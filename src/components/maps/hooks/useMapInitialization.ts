import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';

interface MapInitializationProps {
  accessToken: string;
  center: [number, number];
  zoom: number;
  style: React.CSSProperties;
  onMapLoad?: (map: mapboxgl.Map) => void;
  onZoomChange?: (zoom: number) => void;
}

export const useMapInitialization = ({
  accessToken,
  center,
  zoom,
  style,
  onMapLoad,
  onZoomChange,
}: MapInitializationProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const initializeMap = useCallback(() => {
    if (map.current || !mapContainer.current) return;

    mapboxgl.accessToken = accessToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/pkulandh/cm9iyi6qq00jo01rce7xjcfay',
      center: center,
      zoom: zoom,
    });

    map.current.on('load', () => {
      if (map.current && onMapLoad) {
        onMapLoad(map.current);
      }
    });

    map.current.on('zoom', () => {
      if (map.current && onZoomChange) {
        const currentZoom = map.current.getZoom();
        onZoomChange(currentZoom);
      }
    });

    map.current.on('style.load', () => {
      console.log('Map style loaded');
    });
  }, [accessToken, center, zoom, onMapLoad, onZoomChange]);

  useEffect(() => {
    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initializeMap]);

  const handleZoomIn = useCallback(() => {
    if (map.current) {
      map.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (map.current) {
      map.current.zoomOut();
    }
  }, []);

  const flyToLocation = useCallback((location: [number, number], zoomLevel: number = 7) => {
    if (map.current) {
      map.current.flyTo({
        center: location,
        zoom: zoomLevel,
        essential: true,
        speed: 1.8,
        curve: 1,
        easing: t => t,
      });
    }
  }, []);

  const flyToCenter = useCallback((duration: number = 1000) => {
    if (map.current) {
      map.current.flyTo({
        center: center,
        zoom: zoom,
        duration: duration,
      });
    }
  }, [center, zoom]);

  return {
    mapContainer,
    map: map.current,
    handleZoomIn,
    handleZoomOut,
    flyToLocation,
    flyToCenter,
  };
};