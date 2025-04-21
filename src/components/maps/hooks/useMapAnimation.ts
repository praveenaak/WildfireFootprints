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
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    isPlayingRef.current = false;
    setIsPlaying(false);
  };

  /**
   * Function to start the animation
   */
  const startAnimation = () => {
    console.log('startAnimation called with:', { isPlaying, selectedLocation });
    
    if (!isPlaying || !selectedLocation || !map.current) {
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

    isPlayingRef.current = true;
    console.log('Animation starting for date:', currentDate);

    // Define date range - constants to avoid recreating on each animation frame
    const START_DATE = new Date('2016-08-01');
    const END_DATE = new Date('2016-10-01');
    const ANIMATION_DELAY = 500; // ms between frames
    
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

      // Only update filter if the layer exists to avoid errors
      if (map.current && map.current.getLayer('footprint-layer')) {
        try {
          const filter = ['all',
            ['>', ['get', 'value'], currentFootprintThreshold],
            ['==', ['get', 'date'], formattedDateForFilter]
          ];
          
          console.log('Setting map filter for date:', formattedDateForFilter);
          map.current.setFilter('footprint-layer', filter);
          
          // If we have pm25 layer, update that as well
          if (map.current.getLayer('pm25-layer')) {
            const pm25Filter = ['all',
              ['>', ['get', 'pm25_value'], 0],
              ['==', ['get', 'date'], formattedDateForFilter]
            ];
            map.current.setFilter('pm25-layer', pm25Filter);
          }
          
          // Update the timestamp indicator after filter is updated
          addTimestampIndicator();
        } catch (error) {
          console.error('Error updating map filter:', error);
        }
      } else {
        console.log('footprint-layer not found, cannot update filter');
      }

      // Use consistent timing with setTimeout
      if (isPlayingRef.current) {
        console.log('Scheduling next animation frame');
        const timeoutId = setTimeout(() => {
          if (isPlayingRef.current) {
            animationRef.current = requestAnimationFrame(animate);
          }
        }, ANIMATION_DELAY);
        
        // Store timeout ID for cleanup
        return () => clearTimeout(timeoutId);
      }
    };

    // Start the animation
    console.log('Starting first animation frame');
    animationRef.current = requestAnimationFrame(animate);
  };

  /**
   * Toggle animation
   */
  const toggleAnimation = () => {
    console.log('toggleAnimation called, current state:', isPlaying);
    
    if (isPlaying) {
      console.log('Stopping animation');
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
      
      // Set playing state which will trigger the useEffect to start animation
      isPlayingRef.current = true;
      setIsPlaying(true);
      
      // For immediate visual feedback, update timestamp indicator
      addTimestampIndicator();
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
      
      startAnimation();
    } else if (!isPlaying) {
      stopAnimation();
    }
    
    // Cleanup animation on component unmount or when animation state changes
    return () => {
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