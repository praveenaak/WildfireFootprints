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

// Custom hook to handle map animation logic
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

  // Function to stop animation
  const stopAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    isPlayingRef.current = false;
    setIsPlaying(false);
  };

  // Function to start the animation
  const startAnimation = () => {
    if (!isPlaying || !selectedLocation || !map.current) {
      return;
    }

    isPlayingRef.current = isPlaying;

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
    
    const animate = () => {
      if (!isPlayingRef.current || !selectedLocation || !map.current) {
        return;
      }

      // Increment date by one day
      currentDateObj.setDate(currentDateObj.getDate() + 1);
      
      // Reset to start if we reach the end
      if (currentDateObj > END_DATE) {
        currentDateObj = new Date(START_DATE);
      }

      // Format date for filter - extract to single operation
      const isoDate = currentDateObj.toISOString().slice(0, 10);
      const formattedDateForFilter = formatDateForFilter(isoDate);
      const formattedDate = formattedDateForFilter.replace(/-/g, '');
      
      // Update internal state (YYYYMMDD format)
      setCurrentDate(formattedDate);

      // Only update filter if the layer exists to avoid errors
      if (map.current && map.current.getLayer('footprint-layer')) {
        try {
          const filter = ['all',
            ['>', ['get', 'value'], currentFootprintThreshold],
            ['==', ['get', 'date'], formattedDateForFilter]
          ];
          
          map.current.setFilter('footprint-layer', filter);
          
          // Update the timestamp indicator after filter is updated
          addTimestampIndicator();
        } catch (error) {
          console.error('Error updating map filter:', error);
        }
      }

      // Use consistent timing with setTimeout
      if (isPlayingRef.current) {
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
    animationRef.current = requestAnimationFrame(animate);
  };

  // Toggle animation
  const toggleAnimation = () => {
    if (isPlaying) {
      stopAnimation();
    } else {
      isPlayingRef.current = true;
      setIsPlaying(true);
    }
  };

  // Start animation when isPlaying state becomes true
  // Handle animation state changes
  useEffect(() => {
    if (isPlaying && selectedLocation) {
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