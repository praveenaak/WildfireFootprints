import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_CONFIG } from '../../config/mapbox';
import { Location, MultiLocationMapboxProps, LayerType, MarkerRef } from './types';
import { parseCoordinates, formatInitialDate, formatDateForFilter } from './utils/mapUtils';
import { useMapAnimation } from './hooks/useMapAnimation';
import { MapControls } from './ui/MapControls';
import { MapHeader } from './ui/MapHeader';
import { MapLegend } from './ui/MapLegend';
import { ZoomControls } from './ui/ZoomControls';
import styled from 'styled-components';
import { colors } from '../../styles/theme';

const MapContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
`;

const MapboxMultiLocation: React.FC<MultiLocationMapboxProps> = ({
  accessToken = MAPBOX_CONFIG.accessToken,
  center,
  zoom,
  style = { width: '100%', height: '100vh' },
  minFootprintThreshold = 0.0002,
  minPm25Threshold = 0.01,
  timestamp = '08-25-2016 00:00'
}) => {
  // Debug window to track button clicks
  (window as any).debugMap = {
    zoomInClicked: () => {
      console.log("DEBUG: Zoom in clicked from window");
      if (map.current) {
        const currentZoomLevel = map.current.getZoom();
        console.log(`Current zoom level: ${currentZoomLevel}`);
        map.current.easeTo({
          zoom: currentZoomLevel + 1,
          duration: 300
        });
      }
    },
    zoomOutClicked: () => {
      console.log("DEBUG: Zoom out clicked from window");
      if (map.current) {
        const currentZoomLevel = map.current.getZoom();
        console.log(`Current zoom level: ${currentZoomLevel}`);
        map.current.easeTo({
          zoom: currentZoomLevel - 1,
          duration: 300
        });
      }
    }
  };
  // DOM refs
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  
  // UI state
  const [layerType, setLayerType] = useState<LayerType>('footprint');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [currentFootprintThreshold, setCurrentFootprintThreshold] = useState(minFootprintThreshold);
  const [currentPm25Threshold, setCurrentPm25Threshold] = useState(minPm25Threshold);
  const [currentZoom, setCurrentZoom] = useState<number>(zoom);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDate, setCurrentDate] = useState(formatInitialDate(timestamp));
  const [mapLoaded, setMapLoaded] = useState(false);

  // Store markers in a ref to manage them
  const markersRef = useRef<MarkerRef[]>([]);
  
  // Memoize locations to prevent unnecessary re-renders
  const locations = useMemo(() => parseCoordinates(), []);

  // Add timestamp indicator - memoized to prevent recreating on each render
  const addTimestampIndicator = useCallback(() => {
    // Implementation moved to MapHeader component
  }, []);

  // Initialize animation hook
  const { toggleAnimation } = useMapAnimation({
    isPlaying,
    setIsPlaying,
    currentDate,
    setCurrentDate,
    selectedLocation,
    map,
    currentFootprintThreshold,
    addTimestampIndicator
  });

  // Constants for threshold adjustment
  const THRESHOLD_MULTIPLIER = 1.1;
  const MIN_FOOTPRINT_THRESHOLD = 0.0001;
  const MAX_FOOTPRINT_THRESHOLD = 0.04;
  
  // Function to adjust threshold values - memoized for performance
  const adjustThreshold = useCallback((type: 'increase' | 'decrease') => {
    try {
      if (layerType === 'footprint') {
        // Calculate new threshold value
        const multiplier = type === 'increase' ? THRESHOLD_MULTIPLIER : 1 / THRESHOLD_MULTIPLIER;
        const newThreshold = Math.max(
          MIN_FOOTPRINT_THRESHOLD, 
          Math.min(MAX_FOOTPRINT_THRESHOLD, currentFootprintThreshold * multiplier)
        );
        
        // Only update if there's a significant change
        if (Math.abs(newThreshold - currentFootprintThreshold) < 0.000001) {
          return; // Skip if change is too small
        }
        
        // Update state
        setCurrentFootprintThreshold(newThreshold);
        
        // Update map filter if the layer exists
        if (map.current && map.current.getLayer('footprint-layer')) {
          // Handle time series location differently
          if (selectedLocation && selectedLocation.lng === -101.8504 && selectedLocation.lat === 33.59076) {
            const formattedDateForFilter = formatDateForFilter(currentDate);
            map.current.setFilter('footprint-layer', ['all',
              ['>', ['get', 'value'], newThreshold],
              ['==', ['get', 'date'], formattedDateForFilter]
            ]);
          } else {
            // Standard filter for regular locations
            map.current.setFilter('footprint-layer', ['>', ['coalesce', ['get', 'footprint'], 0], newThreshold]);
          }
        }
      } else {
        // Handle PM2.5 threshold
        const multiplier = type === 'increase' ? THRESHOLD_MULTIPLIER : 1 / THRESHOLD_MULTIPLIER;
        const newThreshold = Math.max(0, currentPm25Threshold * multiplier);
        
        // Update state
        setCurrentPm25Threshold(newThreshold);
        
        // Update map filter if the layer exists
        if (map.current && map.current.getLayer('pm25-layer')) {
          map.current.setFilter('pm25-layer', ['>', ['get', 'pm25'], newThreshold]);
        }
      }
    } catch (error) {
      console.error('Error adjusting threshold:', error);
    }
  }, [layerType, currentFootprintThreshold, currentPm25Threshold, selectedLocation, currentDate]);

  // Handle zooming - memoized for performance
  const handleZoomIn = useCallback(() => {
    console.log('Zoom in clicked');
    if (map.current) {
      try {
        const currentZoomLevel = map.current.getZoom();
        const newZoomLevel = Math.min(12, currentZoomLevel + 1);
        console.log(`Zooming in from ${currentZoomLevel} to ${newZoomLevel}`);
        
        // Use setZoom without animation to avoid issues
        map.current.setZoom(newZoomLevel);
        
        // Update user zoom reference
        userZoomRef.current = newZoomLevel;
        setCurrentZoom(newZoomLevel);
      } catch (error) {
        console.error('Error zooming in:', error);
      }
    } else {
      console.warn('Map not fully loaded yet, zoom in operation ignored');
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    console.log('Zoom out clicked');
    if (map.current) {
      try {
        const currentZoomLevel = map.current.getZoom();
        const newZoomLevel = Math.max(3, currentZoomLevel - 1);
        console.log(`Zooming out from ${currentZoomLevel} to ${newZoomLevel}`);
        
        // Use setZoom without animation to avoid issues
        map.current.setZoom(newZoomLevel);
        
        // Update user zoom reference
        userZoomRef.current = newZoomLevel;
        setCurrentZoom(newZoomLevel);
      } catch (error) {
        console.error('Error zooming out:', error);
      }
    } else {
      console.warn('Map not fully loaded yet, zoom out operation ignored');
    }
  }, []);

  // Handle back button click - memoized for performance
  const handleBackClick = useCallback(() => {
    if (map.current) {
      if (map.current.getLayer('footprint-layer')) {
        map.current.removeLayer('footprint-layer');
      }
      
      if (map.current.getLayer('pm25-layer')) {
        map.current.removeLayer('pm25-layer');
      }
      
      if (map.current.getSource('footprint-data')) {
        map.current.removeSource('footprint-data');
      }
      
      // Use the saved user zoom level instead of initial zoom
      const currentUserZoom = userZoomRef.current || zoom;
      console.log('Back button clicked, using zoom:', currentUserZoom);
      
      map.current.jumpTo({
        center: center,
        zoom: 5 // Use a fixed zoom level that works
      });
    }
    
    setSelectedLocation(null);
    
    // Stop any ongoing animation
    if (isPlaying) {
      toggleAnimation();
    }
  }, [center, zoom, isPlaying, toggleAnimation]);

  // Keep track of user-initiated zoom level
  const userZoomRef = useRef<number>(zoom);
  
  // Create map instance only once with useRef
  const mapInitialized = useRef(false);
  
  // Initialize map when component mounts
  useEffect(() => {
    // Only initialize the map once
    if (mapInitialized.current || !mapContainer.current) return;
    
    let mapInstance: mapboxgl.Map | null = null;
    
    try {
      console.log("INITIALIZING MAP - SHOULD ONLY HAPPEN ONCE");
      mapInitialized.current = true;
      
      // Set the access token
      mapboxgl.accessToken = accessToken;
      
      // Create the map instance
      mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/pkulandh/cm9iyi6qq00jo01rce7xjcfay',
        center: center,
        zoom: 5, // Use a fixed zoom level to start with
        fadeDuration: 0,
        projection: { name: 'mercator' },
        attributionControl: true,
        minZoom: 3,
        maxZoom: 12,
        renderWorldCopies: true
      });
      
      map.current = mapInstance;
      
      // Ensure the map has loaded before accessing it
      mapInstance.on('load', () => {
        console.log('Map loaded successfully');
        setMapLoaded(true);
        console.log('Map reference set successfully:', !!map.current);
      });
    
      // Remove default navigation controls and add fullscreen control
      mapInstance.addControl(new mapboxgl.FullscreenControl());
      
      // Update zoom state when map zooms and zoomend
      mapInstance.on('zoom', () => {
        if (mapInstance) {
          const newZoom = Math.round(mapInstance.getZoom() * 10) / 10;
          console.log('Map zoom updated:', newZoom);
          setCurrentZoom(newZoom);
        }
      });
      
      // Also track the final zoom level after zoom transitions complete
      mapInstance.on('zoomend', () => {
        if (mapInstance) {
          const finalZoom = Math.round(mapInstance.getZoom() * 10) / 10;
          console.log('Map zoomend - final zoom:', finalZoom);
          setCurrentZoom(finalZoom);
          // Save the user-initiated zoom level
          userZoomRef.current = finalZoom;
        }
      });
      
      // Initialize markers and map layers when map loads
      mapInstance.on('load', () => {
        if (!mapInstance) return;
        
        // Initialize markers array
        markersRef.current = [];
        
        // Create location markers
        locations.forEach((location) => {
          const el = document.createElement('div');
          el.className = 'location-marker';
          el.style.width = '25px';
          el.style.height = '41px';
          
          // Special styling for time series location
          if (location.lng === -101.8504 && location.lat === 33.59076) {
            el.style.backgroundImage = "url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2225%22%20height%3D%2241%22%3E%3Cpath%20fill%3D%22%23751d0c%22%20d%3D%22M12.5%200C5.596%200%200%205.596%200%2012.5c0%203.662%203.735%2011.08%208.302%2019.271.44.788.859%201.536%201.26%202.263C10.714%2036.357%2011.496%2038%2012.5%2038c1.004%200%201.786-1.643%202.938-3.966.401-.727.82-1.475%201.26-2.263C21.265%2023.58%2025%2016.162%2025%2012.5%2025%205.596%2019.404%200%2012.5%200zm0%2018a5.5%205.5%200%20110-11%205.5%205.5%200%20010%2011z%22%2F%3E%3C%2Fsvg%3E')";
            
            // Add 'Time Series' label
            const label = document.createElement('div');
            label.style.position = 'absolute';
            label.style.top = '42px';
            label.style.left = '50%';
            label.style.transform = 'translateX(-50%)';
            label.style.backgroundColor = 'rgba(22, 28, 45, 0.85)';
            label.style.color = 'white';
            label.style.padding = '3px 6px';
            label.style.borderRadius = '4px';
            label.style.fontSize = '10px';
            label.style.fontWeight = 'bold';
            label.style.whiteSpace = 'nowrap';
            label.style.pointerEvents = 'none';
            label.textContent = 'Time Series';
            label.style.border = '1px solid #751d0c';
            el.appendChild(label);
            
            // Add tooltip
            const tooltip = document.createElement('div');
            tooltip.style.position = 'absolute';
            tooltip.style.bottom = '42px';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translateX(-50%)';
            tooltip.style.backgroundColor = '#f8f9fa';
            tooltip.style.color = '#16182d';
            tooltip.style.padding = '4px 8px';
            tooltip.style.borderRadius = '4px';
            tooltip.style.fontSize = '11px';
            tooltip.style.fontWeight = 'bold';
            tooltip.style.whiteSpace = 'nowrap';
            tooltip.style.pointerEvents = 'none';
            tooltip.textContent = 'Time Series Data';
            tooltip.style.opacity = '0';
            tooltip.style.transition = 'opacity 0.2s';
            tooltip.style.border = '1px solid #751d0c';
            el.appendChild(tooltip);
            
            // Add hover effects
            el.addEventListener('mouseenter', () => {
              tooltip.style.opacity = '1';
            });
            
            el.addEventListener('mouseleave', () => {
              tooltip.style.opacity = '0';
            });
          } else {
            // Regular location marker styling
            el.style.backgroundImage = "url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2225%22%20height%3D%2241%22%3E%3Cpath%20fill%3D%22%23751d0c%22%20d%3D%22M12.5%200C5.596%200%200%205.596%200%2012.5c0%203.662%203.735%2011.08%208.302%2019.271.44.788.859%201.536%201.26%202.263C10.714%2036.357%2011.496%2038%2012.5%2038c1.004%200%201.786-1.643%202.938-3.966.401-.727.82-1.475%201.26-2.263C21.265%2023.58%2025%2016.162%2025%2012.5%2025%205.596%2019.404%200%2012.5%200zm0%2018a5.5%205.5%200%20110-11%205.5%205.5%200%20010%2011z%22%2F%3E%3C%2Fsvg%3E')";
          }
          
          // Common marker styles
          el.style.backgroundSize = 'cover';
          el.style.cursor = 'pointer';
          el.style.transition = 'none';
          
          // Create and add marker to map
          const marker = new mapboxgl.Marker({
            element: el,
            anchor: 'bottom',
            offset: [0, 0]
          })
            .setLngLat([location.lng, location.lat]);
          
          // Only add marker to map if mapInstance exists
          if (mapInstance) {
            marker.addTo(mapInstance);
          }
          
          // Store marker reference
          markersRef.current.push({
            marker,
            element: el,
            location
          });
          
          // Add click event handler for marker
          el.addEventListener('click', () => {
            // Stop animation if playing
            if (isPlaying) {
              toggleAnimation();
            }
            
            // Reset date for time series location
            if (location.lng === -101.8504 && location.lat === 33.59076) {
              setCurrentDate('20160801');
            }
            
            // Set selected location
            setSelectedLocation(location);
            
            // Add a slight delay to ensure the map is ready for the transition
            setTimeout(() => {
              if (mapInstance && mapInstance.loaded()) {
                console.log('Flying to location:', location.lng, location.lat);
                mapInstance.flyTo({
                  center: [location.lng, location.lat],
                  zoom: 7,
                  essential: true,
                  speed: 1.5,
                  curve: 1.5,
                  duration: 1500,
                  easing: t => t * (2 - t)
                });
              } else {
                console.warn('Map not ready for flyTo');
              }
            }, 50);
          });
        });
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }
    
    // Cleanup on unmount
    return () => {
      try {
        if (mapInstance) {
          // Remove all markers to prevent memory leaks
          if (markersRef.current.length > 0) {
            markersRef.current.forEach(({ marker }) => marker.remove());
            markersRef.current = [];
          }
          
          // Remove the map instance
          mapInstance.remove();
          mapInstance = null;
        }
      } catch (error) {
        console.error('Error cleaning up map:', error);
      }
    };
  }, []); // Remove all dependencies to prevent map recreation

  // Load footprint and PM2.5 data when a location is selected
  useEffect(() => {
    if (!map.current || !mapLoaded || !selectedLocation) return;

    console.log('Loading data for location:', selectedLocation.name);
    
    // Wait a moment for map to be fully ready
    const timer = setTimeout(() => {
      try {
        if (!map.current || !map.current.isStyleLoaded()) {
          console.warn('Map style not loaded yet');
          return;
        }
        
        // Remove existing layers if any
        if (map.current.getLayer('footprint-layer')) {
          map.current.removeLayer('footprint-layer');
        }
        
        if (map.current.getLayer('pm25-layer')) {
          map.current.removeLayer('pm25-layer');
        }
        
        if (map.current.getSource('footprint-data')) {
          map.current.removeSource('footprint-data');
        }
        
        // Add data source
        map.current.addSource('footprint-data', {
          type: 'vector',
          url: `mapbox://${selectedLocation.tilesetId}`
        });
        
        // Calculate scale ranges
        const footprintMax = 0.04;
        const footprintMin = Math.max(0.0002, currentFootprintThreshold);
        const footprintStep = (footprintMax - footprintMin) / 5;
        
        // Add footprint layer
        map.current.addLayer({
          id: 'footprint-layer',
          type: 'circle',
          source: 'footprint-data',
          'source-layer': selectedLocation.layerName,
          paint: {
            'circle-radius': [
              'interpolate',
              ['exponential', 2],
              ['zoom'],
              4, 8,
              5, 15,
              6, 25,
              7, 40,
              8, 60,
            ],
            'circle-color': [
              'interpolate',
              ['linear'],
              ['coalesce', ['get', 'value'], ['get', 'footprint']],
              footprintMin, colors.footprintScale[0],
              footprintMin + footprintStep, colors.footprintScale[1],
              footprintMin + (2 * footprintStep), colors.footprintScale[2],
              footprintMin + (3 * footprintStep), colors.footprintScale[3],
              footprintMin + (4 * footprintStep), colors.footprintScale[4],
              footprintMax, colors.footprintScale[5]
            ],
            'circle-opacity': 0.4,
            'circle-blur': 1,
            'circle-stroke-color': 'rgba(255, 255, 255, 0)',
            'circle-pitch-alignment': 'map',
          },
          layout: {
            visibility: layerType === 'footprint' ? 'visible' : 'none'
          },
          filter: selectedLocation.lng === -101.8504 && selectedLocation.lat === 33.59076 
            ? ['all', 
                ['>', ['get', 'value'], currentFootprintThreshold],
                ['==', ['get', 'date'], `${currentDate.substring(0, 4)}-${currentDate.substring(4, 6)}-${currentDate.substring(6, 8)}`]
              ]
            : ['>', ['coalesce', ['get', 'footprint'], 0], currentFootprintThreshold]
        });
        
        // Add PM2.5 layer
        map.current.addLayer({
          id: 'pm25-layer',
          type: 'circle',
          source: 'footprint-data',
          'source-layer': selectedLocation.layerName,
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              5, 12,
              8, 20,
              12, 35
            ],
            'circle-color': [
              'interpolate',
              ['linear'],
              ['get', 'pm25'],
              Math.max(0, currentPm25Threshold), colors.pm25Scale[0],
              Math.min(12, 100 * 0.1), colors.pm25Scale[1],
              Math.min(35, 100 * 0.35), colors.pm25Scale[2],
              Math.min(55, 100 * 0.55), colors.pm25Scale[3],
              Math.min(75, 100 * 0.75), colors.pm25Scale[4],
              100, colors.pm25Scale[5]
            ],
            'circle-opacity': 0.85,
            'circle-blur': 0.2,
            'circle-stroke-width': 1.5,
            'circle-stroke-color': [
              'interpolate',
              ['linear'],
              ['get', 'pm25'],
              Math.max(0, currentPm25Threshold), '#1a4b1e',
              Math.min(12, 100 * 0.1), '#3a6e19',
              Math.min(35, 100 * 0.35), '#9e6417',
              Math.min(55, 100 * 0.55), '#a63207',
              Math.min(75, 100 * 0.75), '#8b1205',
              100, '#660000'
            ],
            'circle-stroke-opacity': 1
          },
          layout: {
            visibility: layerType === 'pm25' ? 'visible' : 'none'
          },
          filter: ['>', ['get', 'pm25'], 0]
        });

        console.log('Successfully loaded data layers for location:', selectedLocation.name);
      } catch (err) {
        console.error('Error loading location data:', err);
      }
    }, 150);
    
    return () => clearTimeout(timer);
  // We intentionally omit colors.footprintScale and colors.pm25Scale as they're static values
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation, layerType, currentFootprintThreshold, currentPm25Threshold, currentDate, mapLoaded]);

  // Manage marker visibility when a location is selected
  useEffect(() => {
    if (!markersRef.current.length) return;
    
    if (selectedLocation) {
      // When a location is selected, hide all markers except the selected one
      markersRef.current.forEach(({ marker, element, location }) => {
        if (location.lat === selectedLocation.lat && location.lng === selectedLocation.lng) {
          // Style the selected marker
          if (location.lng === -101.8504 && location.lat === 33.59076) {
            element.style.backgroundImage = "url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2225%22%20height%3D%2241%22%3E%3Cpath%20fill%3D%22%23751d0c%22%20d%3D%22M12.5%200C5.596%200%200%205.596%200%2012.5c0%203.662%203.735%2011.08%208.302%2019.271.44.788.859%201.536%201.26%202.263C10.714%2036.357%2011.496%2038%2012.5%2038c1.004%200%201.786-1.643%202.938-3.966.401-.727.82-1.475%201.26-2.263C21.265%2023.58%2025%2016.162%2025%2012.5%2025%205.596%2019.404%200%2012.5%200zm0%2018a5.5%205.5%200%20110-11%205.5%205.5%200%20010%2011z%22%2F%3E%3C%2Fsvg%3E')";
          } else {
            element.style.backgroundImage = "url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2225%22%20height%3D%2241%22%3E%3Cpath%20fill%3D%22%23751d0c%22%20d%3D%22M12.5%200C5.596%200%200%205.596%200%2012.5c0%203.662%203.735%2011.08%208.302%2019.271.44.788.859%201.536%201.26%202.263C10.714%2036.357%2011.496%2038%2012.5%2038c1.004%200%201.786-1.643%202.938-3.966.401-.727.82-1.475%201.26-2.263C21.265%2023.58%2025%2016.162%2025%2012.5%2025%205.596%2019.404%200%2012.5%200zm0%2018a5.5%205.5%200%20110-11%205.5%205.5%200%20010%2011z%22%2F%3E%3C%2Fsvg%3E')";
          }
          // Make selected marker larger
          element.style.width = '30px';
          element.style.height = '49px';
          element.style.zIndex = '100';
        } else {
          // Hide all other markers
          marker.remove();
        }
      });
    } else {
      // When no location is selected, show all markers
      markersRef.current.forEach(({ marker, element, location }) => {
        // Restore original marker sizes
        if (location.lng === -101.8504 && location.lat === 33.59076) {
          element.style.backgroundImage = "url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2225%22%20height%3D%2241%22%3E%3Cpath%20fill%3D%22%23751d0c%22%20d%3D%22M12.5%200C5.596%200%200%205.596%200%2012.5c0%203.662%203.735%2011.08%208.302%2019.271.44.788.859%201.536%201.26%202.263C10.714%2036.357%2011.496%2038%2012.5%2038c1.004%200%201.786-1.643%202.938-3.966.401-.727.82-1.475%201.26-2.263C21.265%2023.58%2025%2016.162%2025%2012.5%2025%205.596%2019.404%200%2012.5%200zm0%2018a5.5%205.5%200%20110-11%205.5%205.5%200%20010%2011z%22%2F%3E%3C%2Fsvg%3E')";
        } else {
          element.style.backgroundImage = "url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2225%22%20height%3D%2241%22%3E%3Cpath%20fill%3D%22%23751d0c%22%20d%3D%22M12.5%200C5.596%200%200%205.596%200%2012.5c0%203.662%203.735%2011.08%208.302%2019.271.44.788.859%201.536%201.26%202.263C10.714%2036.357%2011.496%2038%2012.5%2038c1.004%200%201.786-1.643%202.938-3.966.401-.727.82-1.475%201.26-2.263C21.265%2023.58%2025%2016.162%2025%2012.5%2025%205.596%2019.404%200%2012.5%200zm0%2018a5.5%205.5%200%20110-11%205.5%205.5%200%20010%2011z%22%2F%3E%3C%2Fsvg%3E')";
        }
        element.style.width = '25px';
        element.style.height = '41px';
        
        // Re-add markers to map if they're not already connected
        if (!marker.getElement().isConnected) {
          marker.addTo(map.current!);
        }
      });
    }
  }, [selectedLocation]);

  // This effect that was flying to location has been removed 
  // since the marker click handler already handles flying to the location
  // This prevents the double animation that was causing the viewport reset issue

  // Update layer visibility when layer type changes
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    
    try {
      if (map.current.getLayer('footprint-layer')) {
        map.current.setLayoutProperty(
          'footprint-layer',
          'visibility',
          layerType === 'footprint' ? 'visible' : 'none'
        );
      }
      
      if (map.current.getLayer('pm25-layer')) {
        map.current.setLayoutProperty(
          'pm25-layer',
          'visibility',
          layerType === 'pm25' ? 'visible' : 'none'
        );
      }
    } catch (err) {
      console.error('Error updating layer visibility:', err);
    }
  }, [layerType]);

  return (
    <MapContainer>
      <div ref={mapContainer} style={style} />
      
      <MapHeader
        selectedLocation={selectedLocation}
        isPlaying={isPlaying}
        toggleAnimation={toggleAnimation}
        currentDate={currentDate}
      />

      {/* Add key prop to force re-render of ZoomControls component */}
      <ZoomControls
        key={`zoom-controls-${currentZoom}`}
        currentZoom={currentZoom}
        onZoomIn={handleZoomIn} 
        onZoomOut={handleZoomOut}
      />

      {selectedLocation && (
        <MapControls
          selectedLocation={selectedLocation}
          layerType={layerType}
          setLayerType={setLayerType}
          currentFootprintThreshold={currentFootprintThreshold}
          currentPm25Threshold={currentPm25Threshold}
          adjustThreshold={adjustThreshold}
          isPlaying={isPlaying}
          toggleAnimation={toggleAnimation}
          currentDate={currentDate}
          onBackClick={handleBackClick}
        />
      )}

      <MapLegend
        selectedLocation={selectedLocation}
        layerType={layerType}
        currentFootprintThreshold={currentFootprintThreshold}
        currentPm25Threshold={currentPm25Threshold}
      />
    </MapContainer>
  );
};

export default MapboxMultiLocation;