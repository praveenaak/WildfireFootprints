import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapActions, useMapState } from '../context/MapContext';
import { parseCoordinates } from '../utils/mapUtils';

interface MapInitializationProps {
  accessToken: string;
  center: [number, number];
  zoom: number;
  style: React.CSSProperties;
}

export const useMapInitializationWithContext = ({
  accessToken,
  center,
  zoom,
  style,
}: MapInitializationProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const { map } = useMapState();
  const { setMap, setZoom, setLocations, setLoading, setError } = useMapActions();

  const initializeMap = useCallback(() => {
    if (map || !mapContainer.current) return;

    setLoading(true);
    setError(null);

    try {
      mapboxgl.accessToken = accessToken;

      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/pkulandh/cm9iyi6qq00jo01rce7xjcfay',
        center: center,
        zoom: zoom,
      });

      newMap.on('load', () => {
        console.log('Map loaded successfully');
        setMap(newMap);
        setLoading(false);
        
        // Load locations
        const locations = parseCoordinates();
        setLocations(locations);
      });

      newMap.on('zoom', () => {
        const currentZoom = newMap.getZoom();
        setZoom(currentZoom);
      });

      newMap.on('error', (error) => {
        console.error('Map error:', error);
        setError('Failed to load map');
        setLoading(false);
      });

      newMap.on('style.load', () => {
        console.log('Map style loaded');
      });

    } catch (error) {
      console.error('Failed to initialize map:', error);
      setError('Failed to initialize map');
      setLoading(false);
    }
  }, [accessToken, center, zoom, map, setMap, setZoom, setLocations, setLoading, setError]);

  const cleanup = useCallback(() => {
    if (map) {
      map.remove();
    }
  }, [map]);

  useEffect(() => {
    initializeMap();
    return cleanup;
  }, [initializeMap, cleanup]);

  const handleZoomIn = useCallback(() => {
    if (map) {
      map.zoomIn();
    }
  }, [map]);

  const handleZoomOut = useCallback(() => {
    if (map) {
      map.zoomOut();
    }
  }, [map]);

  const flyToLocation = useCallback((location: [number, number], zoomLevel: number = 7) => {
    if (map) {
      map.flyTo({
        center: location,
        zoom: zoomLevel,
        essential: true,
        speed: 1.8,
        curve: 1,
        easing: t => t,
      });
    }
  }, [map]);

  const flyToCenter = useCallback((duration: number = 1000) => {
    if (map) {
      map.flyTo({
        center: center,
        zoom: zoom,
        duration: duration,
      });
    }
  }, [map, center, zoom]);

  return {
    mapContainer,
    map,
    handleZoomIn,
    handleZoomOut,
    flyToLocation,
    flyToCenter,
  };
};