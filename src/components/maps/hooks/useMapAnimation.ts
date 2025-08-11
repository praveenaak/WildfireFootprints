import { useState, useEffect, useRef, useCallback } from 'react';
import { Location } from '../types';
import { 
  formatDateForFilter, 
  determineFootprintCoordinate, 
  determineConvolvedPart,
  isSpecialCoordinate,
  getSpecialCoordinatePartFunction,
  getSpecialCoordinateConvolvedPartFunction
} from '../utils/mapUtils';
import mapboxgl from 'mapbox-gl';

interface UseMapAnimationProps {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentDate: string;
  setCurrentDate: (date: string) => void;
  selectedLocation: Location | null;
  map: React.MutableRefObject<mapboxgl.Map | null>;
  currentFootprintThreshold: number;
  addTimestampIndicator: () => void;
}

export const useMapAnimation = ({
  isPlaying,
  setIsPlaying,
  currentDate,
  setCurrentDate,
  selectedLocation,
  map,
  currentFootprintThreshold,
  addTimestampIndicator
}: UseMapAnimationProps) => {
  const animationRef = useRef<number | null>(null);
  const isPlayingRef = useRef(isPlaying);

  const stopAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    isPlayingRef.current = false;
    addTimestampIndicator();
  };

  const startAnimation = () => {
    if (!selectedLocation || !map.current) {
      return;
    }

    const isTimeSeriesLocation = true;

    if (!map.current.isStyleLoaded()) {
      const checkAndStartAnimation = () => {
        if (map.current && map.current.isStyleLoaded()) {
          actuallyStartAnimation();
        } else {
          setTimeout(checkAndStartAnimation, 100);
        }
      };
      
      setTimeout(checkAndStartAnimation, 100);
      return;
    }
    
    actuallyStartAnimation();
    
    function actuallyStartAnimation() {
      isPlayingRef.current = true;
  
      let START_DATE: Date, END_DATE: Date;
      
      if (selectedLocation && selectedLocation.lng === -111.8722 && selectedLocation.lat === 40.73639) {
        START_DATE = new Date('2016-08-01');
        END_DATE = new Date('2020-10-01');
      } 
      else if (selectedLocation && selectedLocation.lng === -123.0837 && selectedLocation.lat === 44.02631) {
        START_DATE = new Date('2016-08-01');
        END_DATE = new Date('2020-10-01');
      }
      else if (selectedLocation && selectedLocation.lng === -120.9942 && selectedLocation.lat === 37.64216) {
        START_DATE = new Date('2016-08-01');
        END_DATE = new Date('2020-10-01');
      }
      else {
        START_DATE = new Date('2016-08-01');
        END_DATE = new Date('2020-10-01');
      }
      
      const ANIMATION_DELAY = 1000;
      
      const currentDateParts = [
        currentDate.substring(0, 4),
        currentDate.substring(4, 6),
        currentDate.substring(6, 8)
      ];
      
      let currentDateObj = new Date(`${currentDateParts[0]}-${currentDateParts[1]}-${currentDateParts[2]}`);
      
      if (currentDateObj < START_DATE || currentDateObj > END_DATE) {
        currentDateObj = new Date(START_DATE);
      }
    
      const animate = () => {
        if (!isPlayingRef.current || !selectedLocation || !map.current) {
          return;
        }
        
        if (!map.current.isStyleLoaded()) {
          window.setTimeout(() => {
            if (isPlayingRef.current) {
              animate();
            }
          }, 100);
          return;
        }

        const prevYear = currentDateObj.getFullYear();
        const prevMonth = currentDateObj.getMonth() + 1;
        const prevDay = currentDateObj.getDate();

        currentDateObj.setDate(currentDateObj.getDate() + 1);
        
        if (currentDateObj > END_DATE) {
          currentDateObj = new Date(START_DATE);
        }

        const isOctober = currentDateObj.getMonth() === 9;
        const isBeforeFinalYear = currentDateObj.getFullYear() < 2020;
        
        if (isOctober && isBeforeFinalYear) {
          currentDateObj.setFullYear(currentDateObj.getFullYear() + 1);
          currentDateObj.setMonth(7);
          currentDateObj.setDate(1);
        }

        const newYear = currentDateObj.getFullYear();
        const newMonth = currentDateObj.getMonth() + 1;
        const newDay = currentDateObj.getDate();

        const isoDate = currentDateObj.toISOString().slice(0, 10);
        const formattedDateForFilter = formatDateForFilter(isoDate);
        const formattedDate = formattedDateForFilter.replace(/-/g, '');
        
        setCurrentDate(formattedDate);
        
        try {
          const datePart = determineFootprintCoordinate(formattedDate);
          
          let currentPart = "";
          if (map.current && map.current.getLayer('footprint-layer')) {
            const sourceLayer = (map.current.getLayer('footprint-layer') as any)['source-layer'];
            if (sourceLayer && typeof sourceLayer === 'string') {
              if (sourceLayer.includes('_p')) {
                currentPart = sourceLayer.substring(sourceLayer.lastIndexOf('_p') + 1);
              } else {
                currentPart = sourceLayer.slice(-2);
              }
            }
          }
          
          let needsReload = false;

          let newPart;
          
          const currentLayer = map.current?.getLayer('footprint-layer') ? 'footprint' : 
                            (map.current?.getLayer('pm25-layer') ? 'pm25' : null);
          
          if (currentLayer === 'footprint') {
            const partFunction = getSpecialCoordinatePartFunction(selectedLocation?.lng || 0, selectedLocation?.lat || 0);
            newPart = partFunction(formattedDate);
          } else if (currentLayer === 'pm25') {
            const convolvedPartFunction = getSpecialCoordinateConvolvedPartFunction(selectedLocation?.lng || 0, selectedLocation?.lat || 0);
            newPart = convolvedPartFunction(formattedDate);
          } else {
            const partFunction = getSpecialCoordinatePartFunction(selectedLocation?.lng || 0, selectedLocation?.lat || 0);
            newPart = partFunction(formattedDate);
          }
          
          if (currentPart !== newPart) {
            needsReload = true;
            
            const layerTypeForMessage = currentLayer;
            const newPartForMessage = newPart;
          }
          
          if (needsReload) {
            const currentLayer = map.current?.getLayer('footprint-layer') ? 'footprint' : 
                                (map.current?.getLayer('pm25-layer') ? 'pm25' : null);
            
            let newPartMessage;
            if (currentLayer === 'footprint') {
              const partFunction = getSpecialCoordinatePartFunction(selectedLocation?.lng || 0, selectedLocation?.lat || 0);
              newPartMessage = partFunction(formattedDate);
            } else if (currentLayer === 'pm25') {
              const convolvedPartFunction = getSpecialCoordinateConvolvedPartFunction(selectedLocation?.lng || 0, selectedLocation?.lat || 0);
              newPartMessage = convolvedPartFunction(formattedDate);
            } else {
              newPartMessage = "unknown";
            }
            
            const layerTypeMsg = currentLayer === 'footprint' ? 'footprint (8-part)' : 
                                (currentLayer === 'pm25' ? 'convolved PM2.5 (3-part)' : 'unknown');
                                
            setCurrentDate(formattedDate);
            
            if (isPlayingRef.current) {
              window.setTimeout(() => {
                if (isPlayingRef.current) {
                  animate();
                }
              }, ANIMATION_DELAY);
            }
            return;
          }
          
          if (map.current) {
            if (map.current.getLayer('footprint-layer')) {
              const footprintFilter = ['all',
                ['>', ['get', 'value'], currentFootprintThreshold],
                ['==', ['get', 'date'], formattedDateForFilter]
              ];
              map.current.setFilter('footprint-layer', footprintFilter);
            }
            
            if (map.current.getLayer('pm25-layer')) {
              const pm25Filter = ['all',
                ['>', ['get', 'pm25_value'], 0],
                ['==', ['get', 'date'], formattedDateForFilter]
              ];
              map.current.setFilter('pm25-layer', pm25Filter);
            }
          }
        } catch (error) {
          console.error('Error updating map filter:', error);
        }
        
        addTimestampIndicator();

        if (isPlayingRef.current) {
          window.setTimeout(() => {
            if (isPlayingRef.current) {
              animate();
            }
          }, ANIMATION_DELAY);
        }
      };

      animate();
    }
  };

  const toggleAnimation = () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopAnimation();
    } else {
      if (!selectedLocation) {
        return;
      }
      
      const isTimeSeriesLocation = true;
      
      setIsPlaying(true);
      
      isPlayingRef.current = true;
      
      addTimestampIndicator();
      
      setTimeout(() => {
        startAnimation();
      }, 50);
    }
  };

  useEffect(() => {
    if (isPlaying && selectedLocation) {
      const isTimeSeriesLocation = true;
      
      setTimeout(() => {
        startAnimation();
      }, 10);
    } else if (!isPlaying) {
      stopAnimation();
    }
    
    return () => {
      stopAnimation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, selectedLocation]);

  return {
    toggleAnimation,
    isPlayingRef,
    animationRef
  };
};