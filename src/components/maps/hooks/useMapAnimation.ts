import { useRef, useEffect } from 'react';
import { Location } from '../types';
import { formatDateForFilter } from '../utils/mapUtils';
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
    
    // Get current map state before removing things
    const savedCenter = map.current ? map.current.getCenter() : null;
    const savedZoom = map.current ? map.current.getZoom() : null;
    console.log('Saving map view state on stop - zoom:', savedZoom);
    
    // Make sure timestamp indicator is updated
    addTimestampIndicator();
    
    // Restore the map view if needed
    if (map.current && savedCenter && savedZoom) {
      console.log('Restoring map view on stop to zoom:', savedZoom);
      map.current.jumpTo({
        center: savedCenter,
        zoom: savedZoom
      });
    }
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

    // Check if we're actually on a time series location
    const isTimeSeriesLocation = 
      (selectedLocation.lng === -101.8504 && selectedLocation.lat === 33.59076) || 
      (selectedLocation.lng === -111.8722 && selectedLocation.lat === 40.73639);
      
    if (!isTimeSeriesLocation) {
      console.log('Not a time series location, cannot animate');
      return;
    }

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
  
      // Define date range - constants to avoid recreating on each animation frame
      const START_DATE = new Date('2016-08-01');
      const END_DATE = new Date('2016-10-01');
      const ANIMATION_DELAY = 1000; // ms between frames - increased for better visibility
      
      // Parse the current date once
      const currentDateParts = [
        currentDate.substring(0, 4),
        currentDate.substring(4, 6),
        currentDate.substring(6, 8)
      ];
      
      let currentDateObj = new Date(`${currentDateParts[0]}-${currentDateParts[1]}-${currentDateParts[2]}`);
      console.log('Starting animation from date:', currentDateObj.toISOString());
    
    
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

        // Increment date by one day
        currentDateObj.setDate(currentDateObj.getDate() + 1);
        
        // Reset to start if we reach the end
        if (currentDateObj > END_DATE) {
          currentDateObj = new Date(START_DATE);
          console.log('Animation reached end date, resetting to start');
        }

        // Format date for filter - extract to single operation
        const isoDate = currentDateObj.toISOString().slice(0, 10);
        const formattedDateForFilter = formatDateForFilter(isoDate);
        const formattedDate = formattedDateForFilter.replace(/-/g, '');
        
        console.log('Animation frame date:', formattedDate, formattedDateForFilter);
        
        // Update internal state (YYYYMMDD format)
        setCurrentDate(formattedDate);
        
        // Special case for Utah
        if (selectedLocation.lng === -111.8722 && selectedLocation.lat === 40.73639) {
          try {
            if (map.current && map.current.getLayer('footprint-layer')) {
              const footprintFilter = ['all',
                ['==', ['get', 'layer_type'], 'f'],
                ['>', ['get', 'value'], currentFootprintThreshold],
                ['==', ['get', 'date'], formattedDateForFilter]
              ];
              
              console.log('Setting Utah footprint filter for date:', formattedDateForFilter);
              map.current.setFilter('footprint-layer', footprintFilter);
            }
            
            if (map.current && map.current.getLayer('pm25-layer')) {
              const pm25Filter = ['all',
                ['==', ['get', 'layer_type'], 'f'],
                ['>', ['get', 'pm25_value'], 0],
                ['==', ['get', 'date'], formattedDateForFilter]
              ];
              console.log('Setting Utah PM2.5 filter for date:', formattedDateForFilter);
              map.current.setFilter('pm25-layer', pm25Filter);
            }
          } catch (error) {
            console.error('Error updating Utah map filter:', error);
          }
        } 
        // Special case for Texas
        else if (selectedLocation.lng === -101.8504 && selectedLocation.lat === 33.59076) {
          try {
            if (map.current && map.current.getLayer('footprint-layer')) {
              const footprintFilter = ['all',
                ['>', ['get', 'value'], currentFootprintThreshold],
                ['==', ['get', 'date'], formattedDateForFilter]
              ];
              
              console.log('Setting Texas footprint filter for date:', formattedDateForFilter);
              map.current.setFilter('footprint-layer', footprintFilter);
            }
            
            if (map.current && map.current.getLayer('pm25-layer')) {
              const pm25Filter = ['all',
                ['>', ['get', 'pm25'], 0],
                ['==', ['get', 'date'], formattedDateForFilter]
              ];
              console.log('Setting Texas PM2.5 filter for date:', formattedDateForFilter);
              map.current.setFilter('pm25-layer', pm25Filter);
            }
          } catch (error) {
            console.error('Error updating Texas map filter:', error);
          }
        } else {
          console.log('Not a time series location, cannot update filter');
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
      
      // Verify we have a time series location selected
      if (!selectedLocation) {
        console.log('No location selected, cannot start animation');
        return;
      }
      
      const isTimeSeriesLocation = 
        (selectedLocation.lng === -101.8504 && selectedLocation.lat === 33.59076) || 
        (selectedLocation.lng === -111.8722 && selectedLocation.lat === 40.73639);
        
      if (!isTimeSeriesLocation) {
        console.log('Not a time series location, cannot start animation');
        return;
      }
      
      // Update state immediately first
      console.log('Setting isPlaying to true');
      setIsPlaying(true);
      
      // Set playing ref
      isPlayingRef.current = true;
      
      // Get the current center and zoom from map
      const savedCenter = map.current ? map.current.getCenter() : null;
      const savedZoom = map.current ? map.current.getZoom() : 7;
      console.log('Saving map state - zoom:', savedZoom, 'center:', savedCenter);
      
      // Add timestamp indicator for visual feedback before animation starts
      addTimestampIndicator();
      
      // Start animation with a small delay to allow state updates to propagate
      setTimeout(() => {
        startAnimation();
          
        // Wait a bit then restore the map view
        setTimeout(() => {
          if (map.current && savedCenter) {
            console.log('Restoring map view to zoom:', savedZoom);
            map.current.jumpTo({
              center: savedCenter,
              zoom: savedZoom
            });
          }
        }, 50);
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
      // Ensure we have the right location type
      const isTimeSeriesLocation = 
        (selectedLocation.lng === -101.8504 && selectedLocation.lat === 33.59076) || 
        (selectedLocation.lng === -111.8722 && selectedLocation.lat === 40.73639);
        
      if (!isTimeSeriesLocation) {
        console.log('Not a time series location, stopping animation');
        stopAnimation();
        return;
      }
      
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