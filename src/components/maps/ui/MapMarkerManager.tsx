import React, { useEffect, useCallback, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Location, MarkerRef } from '../types';

interface MapMarkerManagerProps {
  map: mapboxgl.Map | null;
  locations: Location[];
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
}

export const MapMarkerManager: React.FC<MapMarkerManagerProps> = React.memo(({
  map,
  locations,
  selectedLocation,
  onLocationSelect,
}) => {
  const markersRef = useRef<MarkerRef[]>([]);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(markerRef => {
      if (markerRef.marker) {
        markerRef.marker.remove();
      }
    });
    markersRef.current = [];
  }, []);

  const createMarkerElement = useCallback((location: Location, isSelected: boolean) => {
    const el = document.createElement('div');
    el.className = isSelected ? 'location-marker location-marker-selected' : 'location-marker';
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = isSelected ? '#B32D16' : '#751d0c';
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    el.style.cursor = 'pointer';
    el.style.transition = 'all 0.2s ease';
    el.style.transform = isSelected ? 'scale(1.2)' : 'scale(1)';

    el.addEventListener('mouseenter', () => {
      el.style.transform = isSelected ? 'scale(1.3)' : 'scale(1.1)';
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = isSelected ? 'scale(1.2)' : 'scale(1)';
    });

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      onLocationSelect(location);
    });

    return el;
  }, [onLocationSelect]);

  const addMarkers = useCallback(() => {
    if (!map) return;

    clearMarkers();

    locations.forEach(location => {
      const isSelected = selectedLocation?.lng === location.lng && selectedLocation?.lat === location.lat;
      const el = createMarkerElement(location, isSelected);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([location.lng, location.lat])
        .addTo(map);

      markersRef.current.push({ marker, element: el, location });
    });
  }, [map, locations, selectedLocation, clearMarkers, createMarkerElement]);

  const updateMarkerStyles = useCallback(() => {
    markersRef.current.forEach(markerRef => {
      const isSelected = selectedLocation?.lng === markerRef.location.lng && 
                        selectedLocation?.lat === markerRef.location.lat;
      
      if (markerRef.marker) {
        const element = markerRef.marker.getElement();
        element.className = isSelected ? 'location-marker location-marker-selected' : 'location-marker';
        element.style.backgroundColor = isSelected ? '#B32D16' : '#751d0c';
        element.style.transform = isSelected ? 'scale(1.2)' : 'scale(1)';
      }
    });
  }, [selectedLocation]);

  useEffect(() => {
    addMarkers();
  }, [addMarkers]);

  useEffect(() => {
    updateMarkerStyles();
  }, [updateMarkerStyles]);

  useEffect(() => {
    return () => {
      clearMarkers();
    };
  }, [clearMarkers]);

  return null;
});

MapMarkerManager.displayName = 'MapMarkerManager';