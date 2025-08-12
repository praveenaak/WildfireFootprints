import { useCallback, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { Location, MarkerRef } from '../types';
import { MAP_CONSTANTS, PERFORMANCE_CONSTANTS } from '../../../constants/mapConstants';
import { colors } from '../../../styles/theme';
import { useMapCleanup } from './useMapCleanup';

interface UseMapMarkersProps {
  map: React.MutableRefObject<mapboxgl.Map | null>;
  locations: Location[];
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
}

export const useMapMarkers = ({
  map,
  locations,
  selectedLocation,
  onLocationSelect,
}: UseMapMarkersProps) => {
  const markersRef = useRef<MarkerRef[]>([]);
  const { addCleanupFunction } = useMapCleanup({ map });

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(({ marker }) => {
      marker.remove();
    });
    markersRef.current = [];
  }, []);

  const createMarkerElement = useCallback((location: Location, isSelected: boolean, hasSelection: boolean) => {
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.cssText = `
      width: ${isSelected ? '20px' : '16px'};
      height: ${isSelected ? '20px' : '16px'};
      background-color: ${isSelected ? colors.moabMahogany : colors.canyonlandsTan};
      border: 2px solid white;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      transition: all 0.2s ease;
    `;
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.2)';
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
    });

    return el;
  }, []);

  const addMarkers = useCallback(() => {
    if (!map.current || locations.length === 0) return;

    // Clear existing markers
    clearMarkers();

    // Limit markers for performance
    const limitedLocations = locations.slice(0, PERFORMANCE_CONSTANTS.MAX_MARKERS);
    const hasSelection = selectedLocation !== null;

    limitedLocations.forEach(location => {
      const isSelected =
        selectedLocation?.lng === location.lng && selectedLocation?.lat === location.lat;
      const el = createMarkerElement(location, isSelected, hasSelection);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([location.lng, location.lat])
        .addTo(map.current!);

      // Add click handler
      el.addEventListener('click', () => {
        onLocationSelect(location);
      });

      markersRef.current.push({
        marker,
        location,
        element: el,
      });
    });
  }, [map, locations, selectedLocation, onLocationSelect, createMarkerElement, clearMarkers]);

  const updateMarkerStyles = useCallback(() => {
    const hasSelection = selectedLocation !== null;
    
    markersRef.current.forEach(({ marker, location, element }) => {
      const isSelected =
        selectedLocation?.lng === location.lng && selectedLocation?.lat === location.lat;

      element.style.width = isSelected ? '20px' : '16px';
      element.style.height = isSelected ? '20px' : '16px';
      element.style.backgroundColor = isSelected
        ? colors.moabMahogany
        : colors.canyonlandsTan;
    });
  }, [selectedLocation]);

  // Update marker styles when selection changes
  useEffect(() => {
    updateMarkerStyles();
  }, [selectedLocation, updateMarkerStyles]);

  // Register cleanup function
  useEffect(() => {
    addCleanupFunction(clearMarkers);
  }, [addCleanupFunction, clearMarkers]);

  return {
    addMarkers,
    clearMarkers,
    updateMarkerStyles,
    markersRef,
  };
};
