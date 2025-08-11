import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAP_CONSTANTS } from '../../../constants/mapConstants';

interface UseMapCleanupProps {
  map: React.MutableRefObject<mapboxgl.Map | null>;
}

export const useMapCleanup = ({ map }: UseMapCleanupProps) => {
  const cleanupFunctionsRef = useRef<Array<() => void>>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addCleanupFunction = (fn: () => void) => {
    cleanupFunctionsRef.current.push(fn);
  };

  const clearAllSources = () => {
    if (!map.current) return;

    try {
      // Remove all custom layers
      const layersToRemove = [MAP_CONSTANTS.LAYER_IDS.FOOTPRINT, MAP_CONSTANTS.LAYER_IDS.PM25];

      layersToRemove.forEach(layerId => {
        if (map.current?.getLayer(layerId)) {
          map.current.removeLayer(layerId);
        }
      });

      // Remove all custom sources
      const sourcesToRemove = ['footprint-source', 'pm25-source', 'markers-source'];

      sourcesToRemove.forEach(sourceId => {
        if (map.current?.getSource(sourceId)) {
          map.current.removeSource(sourceId);
        }
      });
    } catch (error) {
      console.warn('Error during source cleanup:', error);
    }
  };

  const clearTimers = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const performCleanup = () => {
    // Clear all timers
    clearTimers();

    // Clear all sources and layers
    clearAllSources();

    // Run all registered cleanup functions
    cleanupFunctionsRef.current.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.warn('Error during cleanup:', error);
      }
    });

    cleanupFunctionsRef.current = [];

    // Remove map instance
    if (map.current) {
      try {
        map.current.remove();
        map.current = null;
      } catch (error) {
        console.warn('Error removing map:', error);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      performCleanup();
    };
  }, []);

  // Memory monitoring (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const monitorMemory = () => {
        if ('memory' in performance) {
          const performanceMemory = (performance as any).memory;
          if (performanceMemory) {
            const { usedJSHeapSize, totalJSHeapSize } = performanceMemory;
            const usedMB = Math.round(usedJSHeapSize / 1048576);
            const totalMB = Math.round(totalJSHeapSize / 1048576);

            if (usedMB > 100) {
              // Alert if using more than 100MB
              console.warn(`High memory usage detected: ${usedMB}MB / ${totalMB}MB`);
            }
          }
        }
      };

      const memoryInterval = setInterval(monitorMemory, 30000); // Check every 30 seconds

      return () => clearInterval(memoryInterval);
    }
  }, []);

  return {
    addCleanupFunction,
    clearAllSources,
    clearTimers,
    performCleanup,
    intervalRef,
    timeoutRef,
  };
};
