import { useEffect, useRef } from 'react';
import { Location } from '../types';
import {
  formatDateForFilter,
  getSpecialCoordinatePartFunction,
  getSpecialCoordinateConvolvedPartFunction,
} from '../utils/mapUtils';
import mapboxgl from 'mapbox-gl';
import { MAP_CONSTANTS } from '../../../constants/mapConstants';

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
  addTimestampIndicator,
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

    if (!map.current.isStyleLoaded()) {
      const checkAndStartAnimation = () => {
        if (map.current && map.current.isStyleLoaded()) {
          actuallyStartAnimation();
        } else {
          setTimeout(checkAndStartAnimation, MAP_CONSTANTS.MAP_STYLE_LOAD_TIMEOUT);
        }
      };

      setTimeout(checkAndStartAnimation, MAP_CONSTANTS.MAP_STYLE_LOAD_TIMEOUT);
      return;
    }

    actuallyStartAnimation();

    function actuallyStartAnimation() {
      isPlayingRef.current = true;

      // Smoothly center the map on selected location at zoom 4 when animation starts
      if (map.current && selectedLocation) {
        const currentCenter = map.current.getCenter();
        const currentZoom = map.current.getZoom();
        
        // Only fly to location if significantly different from current position
        const distance = Math.sqrt(
          Math.pow(currentCenter.lng - selectedLocation.lng, 2) + 
          Math.pow(currentCenter.lat - selectedLocation.lat, 2)
        );
        
        if (distance > 0.1 || Math.abs(currentZoom - 4) > 0.5) {
          map.current.flyTo({
            center: [selectedLocation.lng, selectedLocation.lat],
            zoom: 4,
            duration: 1000,
            essential: true
          });
        }
      }

      // All locations use the same date range now
      const START_DATE = MAP_CONSTANTS.DATE_RANGES.START_DATE;
      const END_DATE = MAP_CONSTANTS.DATE_RANGES.END_DATE;

      const ANIMATION_DELAY = MAP_CONSTANTS.ANIMATION_DELAY;

      const currentDateParts = [
        currentDate.substring(0, 4),
        currentDate.substring(4, 6),
        currentDate.substring(6, 8),
      ];

      let currentDateObj = new Date(
        `${currentDateParts[0]}-${currentDateParts[1]}-${currentDateParts[2]}`
      );

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

        const isoDate = currentDateObj.toISOString().slice(0, 10);
        const formattedDateForFilter = formatDateForFilter(isoDate);
        const formattedDate = formattedDateForFilter.replace(/-/g, '');

        setCurrentDate(formattedDate);

        try {
          let currentPart = '';
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

          const currentLayer = map.current?.getLayer('footprint-layer')
            ? 'footprint'
            : map.current?.getLayer('pm25-layer')
              ? 'pm25'
              : null;

          if (currentLayer === 'footprint') {
            const partFunction = getSpecialCoordinatePartFunction(
              selectedLocation?.lng || 0,
              selectedLocation?.lat || 0
            );
            newPart = partFunction(formattedDate);
          } else if (currentLayer === 'pm25') {
            const convolvedPartFunction = getSpecialCoordinateConvolvedPartFunction(
              selectedLocation?.lng || 0,
              selectedLocation?.lat || 0
            );
            newPart = convolvedPartFunction(formattedDate);
          } else {
            const partFunction = getSpecialCoordinatePartFunction(
              selectedLocation?.lng || 0,
              selectedLocation?.lat || 0
            );
            newPart = partFunction(formattedDate);
          }

          if (currentPart !== newPart) {
            needsReload = true;
          }

          if (needsReload) {
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
              const footprintFilter = [
                'all',
                ['>', ['get', 'value'], currentFootprintThreshold],
                ['==', ['get', 'date'], formattedDateForFilter],
              ];
              map.current.setFilter('footprint-layer', footprintFilter);
            }

            if (map.current.getLayer('pm25-layer')) {
              const pm25Filter = [
                'all',
                ['>', ['get', 'pm25_value'], 0],
                ['==', ['get', 'date'], formattedDateForFilter],
              ];
              map.current.setFilter('pm25-layer', pm25Filter);
            }
          }
        } catch (error) {
          console.error('Error updating map filter:', error);
        }

        addTimestampIndicator();

        // Gently maintain viewport centered on selected location during animation
        if (map.current && selectedLocation) {
          const currentCenter = map.current.getCenter();
          const currentZoom = map.current.getZoom();
          
          // Only adjust if the map has drifted significantly
          const distance = Math.sqrt(
            Math.pow(currentCenter.lng - selectedLocation.lng, 2) + 
            Math.pow(currentCenter.lat - selectedLocation.lat, 2)
          );
          
          if (distance > 0.2 || Math.abs(currentZoom - 4) > 1) {
            map.current.easeTo({
              center: [selectedLocation.lng, selectedLocation.lat],
              zoom: 4,
              duration: 300
            });
          }
        }

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
    animationRef,
  };
};
