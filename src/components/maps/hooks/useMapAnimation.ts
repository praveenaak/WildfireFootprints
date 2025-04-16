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

    // Define date range
    const startDate = new Date('2016-08-01');
    const endDate = new Date('2016-10-01');
    
    // Parse the current date
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
      if (currentDateObj > endDate) {
        currentDateObj = new Date(startDate);
      }

      // Format date for filter
      const formattedDateForFilter = formatDateForFilter(currentDateObj.toISOString().slice(0, 10));
      
      // Update internal state (YYYYMMDD format)
      const formattedDate = formattedDateForFilter.replace(/-/g, '');
      setCurrentDate(formattedDate);

      // Update filter to show data for this date
      if (map.current.getLayer('footprint-layer')) {
        const filter = ['all',
          ['>', ['get', 'value'], currentFootprintThreshold],
          ['==', ['get', 'date'], formattedDateForFilter]
        ];
        
        map.current.setFilter('footprint-layer', filter);
      }
      
      // Update the timestamp indicator
      addTimestampIndicator();

      // Schedule next animation frame with a delay
      if (isPlayingRef.current) {
        setTimeout(() => {
          if (isPlayingRef.current) {
            animationRef.current = requestAnimationFrame(animate);
          }
        }, 500);
      }
    };

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
  useEffect(() => {
    if (isPlaying && selectedLocation) {
      startAnimation();
    } else if (!isPlaying) {
      stopAnimation();
    }
  }, [isPlaying, selectedLocation]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, []);

  return {
    toggleAnimation,
    isPlayingRef,
    animationRef
  };
}; 