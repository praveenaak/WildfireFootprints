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

/**
 * Custom hook to handle map animation logic
 */
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

  /**
   * Function to stop animation
   */
  const stopAnimation = () => {
    console.log('stopAnimation called');
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Update ref
    isPlayingRef.current = false;
    
    // Make sure timestamp indicator is updated
    addTimestampIndicator();
    
    // NOTE: We no longer reset the map view when stopping animation
    // This allows the animation to pause in place with data still visible
  };

  /**
   * Function to start the animation
   */
  const startAnimation = () => {
    console.log('startAnimation called with:', { isPlaying: isPlayingRef.current, selectedLocation });
    
    if (!selectedLocation || !map.current) {
      console.log('Cannot start animation - missing required state');
      return;
    }

    // All locations now support time series data
    const isTimeSeriesLocation = true;

    // Wait for map style to be fully loaded before starting animation
    if (!map.current.isStyleLoaded()) {
      console.log('Map style not loaded yet, waiting before starting animation...');
      // Wait for style to load before starting animation
      const checkAndStartAnimation = () => {
        if (map.current && map.current.isStyleLoaded()) {
          console.log('Map style now loaded, starting animation');
          actuallyStartAnimation();
        } else {
          console.log('Map style still loading, checking again in 100ms');
          setTimeout(checkAndStartAnimation, 100);
        }
      };
      
      setTimeout(checkAndStartAnimation, 100);
      return;
    }
    
    // Main animation function when style is loaded
    actuallyStartAnimation();
    
    function actuallyStartAnimation() {
      // Make sure we set isPlayingRef to true here
      isPlayingRef.current = true;
      console.log('Animation starting for date:', currentDate);
  
      // Define date range based on location
      let START_DATE: Date, END_DATE: Date;
      
      // For Salt Lake City (with 2016-2020 dataset)
      if (selectedLocation && selectedLocation.lng === -111.8722 && selectedLocation.lat === 40.73639) {
        START_DATE = new Date('2016-08-01');
        END_DATE = new Date('2020-10-01');
      } 
      // For Oregon (with 2016-2020 dataset)
      else if (selectedLocation && selectedLocation.lng === -123.0837 && selectedLocation.lat === 44.02631) {
        START_DATE = new Date('2016-08-01');
        END_DATE = new Date('2020-10-01');
      }
      // For California (with 2016-2020 dataset)
      else if (selectedLocation && selectedLocation.lng === -120.9942 && selectedLocation.lat === 37.64216) {
        START_DATE = new Date('2016-08-01');
        END_DATE = new Date('2020-10-01');
      }
      else {
        // Default range for all locations - updated to include all years 2016-2020
        START_DATE = new Date('2016-08-01');
        END_DATE = new Date('2020-10-01');
      }
      
      const ANIMATION_DELAY = 1000; // ms between frames - increased for better visibility
      
      // Parse the current date once
      const currentDateParts = [
        currentDate.substring(0, 4),
        currentDate.substring(4, 6),
        currentDate.substring(6, 8)
      ];
      
      let currentDateObj = new Date(`${currentDateParts[0]}-${currentDateParts[1]}-${currentDateParts[2]}`);
      
      // Ensure we're using a valid date within our range
      if (currentDateObj < START_DATE || currentDateObj > END_DATE) {
        console.log('Current date out of range, resetting to start. Current:', currentDateObj.toISOString(), 'Range:', START_DATE.toISOString(), 'to', END_DATE.toISOString());
        currentDateObj = new Date(START_DATE);
      }
      
      console.log('Starting animation from date:', currentDateObj.toISOString(), 'Range:', START_DATE.toISOString(), 'to', END_DATE.toISOString());
    
    
      // Animation frame function
      const animate = () => {
        if (!isPlayingRef.current || !selectedLocation || !map.current) {
          console.log('Animation condition no longer met, stopping');
          return;
        }
        
        // Skip if map style isn't loaded
        if (!map.current.isStyleLoaded()) {
          console.log('Map style not loaded in animate, waiting 100ms before trying again');
          window.setTimeout(() => {
            if (isPlayingRef.current) {
              animate();
            }
          }, 100);
          return;
        }

        // Store previous date to check for major transitions
        const prevYear = currentDateObj.getFullYear();
        const prevMonth = currentDateObj.getMonth() + 1;
        const prevDay = currentDateObj.getDate();

        // Increment date by one day
        currentDateObj.setDate(currentDateObj.getDate() + 1);
        
        // Reset to start if we reach the end
        if (currentDateObj > END_DATE) {
          currentDateObj = new Date(START_DATE);
          console.log('Animation reached end date, resetting to start');
        }

        // Get new date components
        const newYear = currentDateObj.getFullYear();
        const newMonth = currentDateObj.getMonth() + 1;
        const newDay = currentDateObj.getDate();

        // Format date for filter - extract to single operation
        const isoDate = currentDateObj.toISOString().slice(0, 10);
        const formattedDateForFilter = formatDateForFilter(isoDate);
        const formattedDate = formattedDateForFilter.replace(/-/g, '');
        
        console.log('Animation frame date:', formattedDate, formattedDateForFilter);
        
        // Update internal state (YYYYMMDD format)
        setCurrentDate(formattedDate);
        
        try {
          // Check if we need to determine part change based on date
          // Get current date part using the shared utility function
          const datePart = determineFootprintCoordinate(formattedDate);
          
          // Get the current source layer from map
          let currentPart = "";
          if (map.current && map.current.getLayer('footprint-layer')) {
            const sourceLayer = (map.current.getLayer('footprint-layer') as any)['source-layer'];
            // Extract part from footprints_20162020_p1, p2, p3
            // Check if sourceLayer exists before calling slice
            if (sourceLayer && typeof sourceLayer === 'string') {
              // Extract part - now all coordinates use p1-p8
              if (sourceLayer.includes('_p')) {
                currentPart = sourceLayer.substring(sourceLayer.lastIndexOf('_p') + 1);
              } else {
                currentPart = sourceLayer.slice(-2);
              }
            }
          }
          
          // All coordinates now use the special coordinate system
          let needsReload = false;

          // Determine which part to use based on layer type and date
          let newPart;
          
          // Check if we have a footprint-layer or pm25-layer visible
          const currentLayer = map.current?.getLayer('footprint-layer') ? 'footprint' : 
                            (map.current?.getLayer('pm25-layer') ? 'pm25' : null);
          
          if (currentLayer === 'footprint') {
            // Use 8-part split for footprint data
            const partFunction = getSpecialCoordinatePartFunction(selectedLocation?.lng || 0, selectedLocation?.lat || 0);
            newPart = partFunction(formattedDate);
          } else if (currentLayer === 'pm25') {
            // Use 3-part split for convolved PM2.5 data
            const convolvedPartFunction = getSpecialCoordinateConvolvedPartFunction(selectedLocation?.lng || 0, selectedLocation?.lat || 0);
            newPart = convolvedPartFunction(formattedDate);
          } else {
            // Default to footprint if no layer is visible yet
            const partFunction = getSpecialCoordinatePartFunction(selectedLocation?.lng || 0, selectedLocation?.lat || 0);
            newPart = partFunction(formattedDate);
          }
          
          if (currentPart !== newPart) {
            needsReload = true;
            
            // Store these variables for use in the needsReload block
            const layerTypeForMessage = currentLayer;
            const newPartForMessage = newPart;
          }
          
          // Handle reload if needed
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
                                
            console.log('Animation requires tileset part change:', {
              coordinate: `${selectedLocation?.lng}, ${selectedLocation?.lat}`,
              currentPart, 
              newPart: `${newPartMessage} (${layerTypeMsg})`,
              date: formattedDate
            });
            
            // Just update the date and let the data load effect handle the change
            setCurrentDate(formattedDate);
            
            // Schedule the next frame
            if (isPlayingRef.current) {
              window.setTimeout(() => {
                if (isPlayingRef.current) {
                  animate();
                }
              }, ANIMATION_DELAY);
            }
            return;
          }
          
          // Simply update the filter for both footprint and PM2.5 layers
          if (map.current) {
            // Update footprint layer filter
            if (map.current.getLayer('footprint-layer')) {
              const footprintFilter = ['all',
                ['>', ['get', 'value'], currentFootprintThreshold],
                ['==', ['get', 'date'], formattedDateForFilter]
              ];
              map.current.setFilter('footprint-layer', footprintFilter);
            }
            
            // Update PM2.5 layer filter
            if (map.current.getLayer('pm25-layer')) {
              const pm25Filter = ['all',
                ['>', ['get', 'pm25_value'], 0], // Use 0 as threshold, or you could pass currentPm25Threshold in props if needed
                ['==', ['get', 'date'], formattedDateForFilter]
              ];
              map.current.setFilter('pm25-layer', pm25Filter);
            }
          }
        } catch (error) {
          console.error('Error updating map filter:', error);
        }
        
        
        // Update the timestamp indicator after filter is updated
        addTimestampIndicator();

        // Schedule the next frame with global window.setTimeout to ensure it runs
        if (isPlayingRef.current) {
          console.log('Scheduling next animation frame');
          window.setTimeout(() => {
            if (isPlayingRef.current) {
              animate();
            }
          }, ANIMATION_DELAY);
        }
      };

      // Start the animation immediately
      console.log('Starting first animation frame');
      animate();
    }
  };

  /**
   * Toggle animation
   */
  const toggleAnimation = () => {
    console.log('toggleAnimation called, current state:', isPlaying);
    
    if (isPlaying) {
      console.log('Stopping animation');
      // Update state immediately
      setIsPlaying(false);
      // Then stop animation
      stopAnimation();
    } else {
      console.log('Starting animation');
      
      // Verify we have a location selected
      if (!selectedLocation) {
        console.log('No location selected, cannot start animation');
        return;
      }
      
      // All locations now support time series data
      const isTimeSeriesLocation = true;
      
      // Update state immediately 
      console.log('Setting isPlaying to true');
      setIsPlaying(true);
      
      // Set playing ref
      isPlayingRef.current = true;
      
      // Add timestamp indicator for visual feedback before animation starts
      addTimestampIndicator();
      
      // Start animation with a small delay to allow state updates to propagate
      setTimeout(() => {
        startAnimation();
      }, 50);
    }
  };

  /**
   * Start animation when isPlaying state becomes true
   * Handle animation state changes
   */
  useEffect(() => {
    console.log('Animation effect triggered. isPlaying:', isPlaying, 'selectedLocation:', selectedLocation?.name);
    
    if (isPlaying && selectedLocation) {
      console.log('Starting animation for location:', selectedLocation.name);
      // All locations now support time series data
      const isTimeSeriesLocation = true;
      
      // Call startAnimation directly
      setTimeout(() => {
        console.log('Calling startAnimation from useEffect');
        startAnimation();
      }, 10);
    } else if (!isPlaying) {
      stopAnimation();
    }
    
    // Cleanup animation on component unmount or when animation state changes
    return () => {
      console.log('Cleaning up animation');
      stopAnimation();
    };
    // We intentionally omit startAnimation and stopAnimation as dependencies
    // since they would cause this effect to re-run unnecessarily
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, selectedLocation]);

  return {
    toggleAnimation,
    isPlayingRef,
    animationRef
  };
};