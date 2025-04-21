import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_CONFIG } from '../../config/mapbox';
import { parseCoordinates, formatInitialDate, formatDate, formatDateForFilter } from './utils/mapUtils';
import { useMapAnimation } from './hooks/useMapAnimation';
import { MapControls } from './ui/MapControls';
import { MapLegend } from './ui/MapLegend';
import { MapHeader } from './ui/MapHeader';
import { ZoomControls } from './ui/ZoomControls';
import { Location, LayerType, MarkerRef, MultiLocationMapboxProps } from './types';
import { colors } from '../../styles/theme';

const MultiLocationMapbox: React.FC<MultiLocationMapboxProps> = ({
  accessToken = MAPBOX_CONFIG.accessToken,
  center,
  zoom,
  style = { width: '100%', height: '100vh' },
  minFootprintThreshold = 0.0002,
  minPm25Threshold = 0.01,
  timestamp = '08-25-2016 00:00'
}) => {
  // Refs
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<MarkerRef[]>([]);
  
  // State
  const [layerType, setLayerType] = useState<LayerType>('footprint');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [currentFootprintThreshold, setCurrentFootprintThreshold] = useState(minFootprintThreshold);
  const [currentPm25Threshold, setCurrentPm25Threshold] = useState(minPm25Threshold);
  const [currentZoom, setCurrentZoom] = useState<number>(zoom);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDate, setCurrentDate] = useState(formatInitialDate(timestamp));
  const [dataLoadAttempt, setDataLoadAttempt] = useState(0); // Force re-render counter
  
  // Parse locations
  const locations = parseCoordinates();
  
  // Helper function to handle marker clicks - defined outside of effects
  const handleLocationSelect = useCallback((location: Location) => {
    console.log('Selecting location:', location.name);
    
    // Stop any existing animation
    if (isPlaying) {
      setIsPlaying(false);
    }
    
    // Reset current date for time series locations
    if (location.lng === -101.8504 && location.lat === 33.59076 ||
        location.lng === -111.8722 && location.lat === 40.73639) {
      // Set to 2016-08-01 for the special locations
      setCurrentDate('20160801');
    }
    
    // Force data reload if clicking the same marker
    if (selectedLocation?.lng === location.lng && 
        selectedLocation?.lat === location.lat) {
      setDataLoadAttempt(prev => prev + 1);
    }
        
    // Set the location
    setSelectedLocation(location);
    
    // Fly to the location
    if (map.current) {
      map.current.flyTo({
        center: [location.lng, location.lat],
        zoom: 7,
        essential: true,
        speed: 1.8,
        curve: 1,
        easing: t => t
      });
    }
  // Dependencies that actually matter for this handler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, selectedLocation]);
  
  // Add timestamp indicator
  const addTimestampIndicator = useCallback(() => {
    if (!map.current) return;
    
    // Remove existing timestamp if any
    const existingTimestamp = document.getElementById('map-timestamp');
    if (existingTimestamp) {
      existingTimestamp.remove();
    }
    
    // Only show timestamp for time series locations
    if (!selectedLocation) return;
    
    const isTimeSeriesLocation = 
      (selectedLocation.lng === -101.8504 && selectedLocation.lat === 33.59076) || 
      (selectedLocation.lng === -111.8722 && selectedLocation.lat === 40.73639);
    
    if (!isTimeSeriesLocation) return;
    
    // Create timestamp container
    const timestampContainer = document.createElement('div');
    timestampContainer.id = 'map-timestamp';
    timestampContainer.style.position = 'absolute';
    timestampContainer.style.bottom = '30px';
    timestampContainer.style.left = '20px';
    timestampContainer.style.padding = '10px 16px';
    timestampContainer.style.backgroundColor = colors.snowbirdWhite;
    timestampContainer.style.color = colors.olympicParkObsidian;
    timestampContainer.style.borderRadius = '10px';
    timestampContainer.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
    timestampContainer.style.zIndex = '1';
    timestampContainer.style.maxWidth = '220px';
    timestampContainer.style.border = `1px solid ${colors.moabMahogany}`;
    timestampContainer.style.fontFamily = "'Sora', sans-serif";
    
    // Add timestamp text
    const timestampText = document.createElement('span');
    timestampText.style.fontSize = '13px';
    timestampText.style.fontWeight = '600';
    
    // Show the current date
    const formattedDateDisplay = formatDate(currentDate);
    timestampText.textContent = formattedDateDisplay;
    
    // Add animation indicator if playing
    if (isPlaying) {
      const animationDot = document.createElement('span');
      animationDot.style.display = 'inline-block';
      animationDot.style.marginLeft = '8px';
      animationDot.style.color = colors.rockyMountainRust;
      animationDot.style.fontSize = '16px';
      animationDot.textContent = '●';
      timestampText.appendChild(animationDot);
    }
    
    timestampContainer.appendChild(timestampText);
    
    // Add timestamp to map container
    if (mapContainer.current) {
      mapContainer.current.appendChild(timestampContainer);
    }
  }, [selectedLocation, isPlaying, currentDate]);
  
  // Set up animation hook
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
  
  // Function to handle zooming in
  const handleZoomIn = useCallback(() => {
    if (map.current) {
      map.current.zoomIn();
    }
  }, []);
  
  // Function to handle zooming out
  const handleZoomOut = useCallback(() => {
    if (map.current) {
      map.current.zoomOut();
    }
  }, []);
  
  // Function to handle back click
  const handleBackClick = useCallback(() => {
    // Clear data layers before resetting
    if (map.current) {
      // Remove layers if they exist
      if (map.current.getLayer('footprint-layer')) {
        map.current.removeLayer('footprint-layer');
      }
      
      if (map.current.getLayer('pm25-layer')) {
        map.current.removeLayer('pm25-layer');
      }
      
      if (map.current.getSource('footprint-data')) {
        map.current.removeSource('footprint-data');
      }
      
      // Reset the view to show all locations
      map.current.flyTo({
        center: center,
        zoom: zoom,
        duration: 1000
      });
    }
    
    // Reset selected location
    setSelectedLocation(null);
    
    // Stop any playing animation
    if (isPlaying) {
      setIsPlaying(false);
    }
  }, [center, zoom, isPlaying]);
  
  // Function to adjust threshold values
  const adjustThreshold = useCallback((type: 'increase' | 'decrease') => {
    if (layerType === 'footprint') {
      // Adjust footprint threshold
      const newThreshold = type === 'increase' 
        ? currentFootprintThreshold * 2
        : currentFootprintThreshold / 2;
      
      setCurrentFootprintThreshold(newThreshold);
      
      // Update filter if layer exists
      if (map.current && map.current.getLayer('footprint-layer')) {
        if (selectedLocation && 
            (selectedLocation.lng === -101.8504 && selectedLocation.lat === 33.59076 || 
             selectedLocation.lng === -111.8722 && selectedLocation.lat === 40.73639)) {
          // Format date as YYYY-MM-DD for the filter
          const formattedDateForFilter = formatDateForFilter(currentDate);
          
          // For time series data
          map.current.setFilter('footprint-layer', ['all',
            ['>', ['get', 'value'], newThreshold],
            ['==', ['get', 'date'], formattedDateForFilter]
          ]);
        } else {
          // For regular footprint data
          map.current.setFilter('footprint-layer', ['>', ['coalesce', ['get', 'footprint'], 0], newThreshold]);
        }
      }
    } else {
      // Adjust PM2.5 threshold
      const newThreshold = type === 'increase'
        ? currentPm25Threshold * 2
        : currentPm25Threshold / 2;
      
      setCurrentPm25Threshold(newThreshold);
      
      // Update filter if layer exists
      if (map.current && map.current.getLayer('pm25-layer')) {
        map.current.setFilter('pm25-layer', ['>', ['get', 'pm25'], newThreshold]);
      }
    }
  }, [layerType, currentFootprintThreshold, currentPm25Threshold, selectedLocation, currentDate]);
  
  // Initialize map only once when component mounts
  useEffect(() => {
    // Skip initialization if container is not available
    if (!mapContainer.current) return;
    
    // Check if we already have a map instance
    if (map.current) {
      console.log('Map already exists, not recreating');
      return;
    }
    
    console.log('Creating new map instance');
    
    // Set Mapbox token
    mapboxgl.accessToken = accessToken;
    
    // Make sure the container is empty
    while (mapContainer.current.firstChild) {
      mapContainer.current.removeChild(mapContainer.current.firstChild);
    }
    
    // Create map instance - only once!
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_CONFIG.styleUrl,
      center: center,
      zoom: zoom,
      fadeDuration: 0, // Immediately show tiles without fade-in
      interactive: true, // Make sure the map is interactive
      trackResize: true // Auto-resize when container changes
    });
    
    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl());
    
    // Track zoom level changes
    map.current.on('zoom', () => {
      if (map.current) {
        setCurrentZoom(Math.round(map.current.getZoom() * 10) / 10);
      }
    });
    
    // Prevent map click from interfering with marker clicks
    map.current.on('click', (e) => {
      // Check if click is on a marker (which should have already been handled)
      // This prevents the map click from overriding marker click
      const clickedOnMarker = e.originalEvent && 
                             (e.originalEvent.target as HTMLElement)?.closest('.location-marker');
      
      if (clickedOnMarker) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
    
    // Initialize map with markers when it loads
    map.current.on('load', () => {
      if (!map.current) return;
      
      // Clear any existing markers
      markersRef.current = [];
      
      // Add markers for all locations
      locations.forEach((location) => {
        const el = document.createElement('div');
        el.className = 'location-marker';
        el.setAttribute('data-location-name', location.name);
        el.style.width = '25px';
        el.style.height = '41px';
        el.style.backgroundSize = 'cover';
        el.style.cursor = 'pointer';
        el.style.pointerEvents = 'auto'; // Ensure element can receive pointer events
        el.style.zIndex = '10'; // Make sure markers are above other elements (increased priority)
        el.style.transition = 'none'; // Remove any transition effects to make positioning instant
        
        // Use a different color for markers with time series data
        if (location.lng === -101.8504 && location.lat === 33.59076 || 
            location.lng === -111.8722 && location.lat === 40.73639) {
          el.style.backgroundImage = `url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2225%22%20height%3D%2241%22%3E%3Cpath%20fill%3D%22%23${colors.moabMahogany.substring(1)}%22%20d%3D%22M12.5%200C5.596%200%200%205.596%200%2012.5c0%203.662%203.735%2011.08%208.302%2019.271.44.788.859%201.536%201.26%202.263C10.714%2036.357%2011.496%2038%2012.5%2038c1.004%200%201.786-1.643%202.938-3.966.401-.727.82-1.475%201.26-2.263C21.265%2023.58%2025%2016.162%2025%2012.5%2025%205.596%2019.404%200%2012.5%200zm0%2018a5.5%205.5%200%20110-11%205.5%205.5%200%20010%2011z%22%2F%3E%3C%2Fsvg%3E')`;
          
          // Add a permanent label below the marker
          const label = document.createElement('div');
          label.style.position = 'absolute';
          label.style.top = '42px';
          label.style.left = '50%';
          label.style.transform = 'translateX(-50%)';
          label.style.backgroundColor = colors.olympicParkObsidian;
          label.style.color = colors.snowbirdWhite;
          label.style.padding = '3px 6px';
          label.style.borderRadius = '4px';
          label.style.fontSize = '10px';
          label.style.fontWeight = 'bold';
          label.style.whiteSpace = 'nowrap';
          label.style.pointerEvents = 'none';
          label.textContent = 'Time Series';
          label.style.border = `1px solid ${colors.moabMahogany}`;
          el.appendChild(label);
        } else {
          el.style.backgroundImage = `url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2225%22%20height%3D%2241%22%3E%3Cpath%20fill%3D%22%23${colors.bonnevilleSaltFlatsBlue.substring(1)}%22%20d%3D%22M12.5%200C5.596%200%200%205.596%200%2012.5c0%203.662%203.735%2011.08%208.302%2019.271.44.788.859%201.536%201.26%202.263C10.714%2036.357%2011.496%2038%2012.5%2038c1.004%200%201.786-1.643%202.938-3.966.401-.727.82-1.475%201.26-2.263C21.265%2023.58%2025%2016.162%2025%2012.5%2025%205.596%2019.404%200%2012.5%200zm0%2018a5.5%205.5%200%20110-11%205.5%205.5%200%20010%2011z%22%2F%3E%3C%2Fsvg%3E')`;
        }
        
        // Create the marker with the custom element and disable animation
        const marker = new mapboxgl.Marker({
          element: el,
          // Setting anchor to bottom center to align with pin location
          anchor: 'bottom',
          // Offset the marker to position correctly with the pin point
          offset: [0, 0],
          // Explicitly enable drag and click
          draggable: false,
          clickTolerance: 10 // Make clicks more forgiving (default is 3)
        })
          .setLngLat([location.lng, location.lat])
          .addTo(map.current!);
        
        // Store the marker reference
        markersRef.current.push({
          marker,
          element: el,
          location
        });
        
        // Create a handler specifically for this marker using the correct Mapbox event type
        const onMarkerClick = () => {
          // Use the shared handler function
          handleLocationSelect(location);
        };
        
        // Add DOM event for the element
        el.addEventListener('click', (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          onMarkerClick();
        });
        
        // Add Mapbox event listener
        marker.getElement().addEventListener('click', onMarkerClick);
        
        // Make sure the element is clickable with proper styling
        el.style.pointerEvents = 'auto';
        el.style.cursor = 'pointer';
      });
      
      // Add timestamp indicator
      addTimestampIndicator();
    });
    
    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  // Dependency array: only include the minimum required props and handleLocationSelect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, center, zoom, handleLocationSelect]);
  
  // Update timestamp when playing state changes
  useEffect(() => {
    addTimestampIndicator();
  }, [isPlaying, currentDate, addTimestampIndicator]);
  
  // Load the footprint and PM2.5 data when a location is selected
  useEffect(() => {
    console.log('Data loading effect triggered for location:', selectedLocation?.name, 'attempt:', dataLoadAttempt);
    
    if (!map.current || !selectedLocation) return;
    
    // Ensure the map style is loaded before proceeding
    if (!map.current.isStyleLoaded()) {
      console.log('Map style not loaded yet, waiting...');
      
      // Set up one-time listener for style.load event
      const onStyleLoad = () => {
        console.log('Map style loaded, loading data now');
        loadLocationData();
      };
      
      map.current.once('style.load', onStyleLoad);
      
      return () => {
        // Clean up listener if effect is cleaned up before style loads
        if (map.current) {
          map.current.off('style.load', onStyleLoad);
        }
      };
    }
    
    loadLocationData();
    
    // Helper function to load location data
    function loadLocationData() {
      if (!map.current || !selectedLocation) return;
    
    // Remove previous layers if they exist
    if (map.current.getLayer('footprint-layer')) {
      map.current.removeLayer('footprint-layer');
    }
    
    if (map.current.getLayer('pm25-layer')) {
      map.current.removeLayer('pm25-layer');
    }
    
    if (map.current.getSource('footprint-data')) {
      map.current.removeSource('footprint-data');
    }
    
    try {
      // Add the source for the selected location's tileset
      map.current.addSource('footprint-data', {
        type: 'vector',
        url: `mapbox://${selectedLocation.tilesetId}`
      });
      
      // Calculate intermediate steps for footprint color scale
      const footprintMax = 0.04; // Fixed maximum
      const footprintMin = Math.max(0.0001, currentFootprintThreshold);
      const footprintStep = (footprintMax - footprintMin) / 5;
      
      // Create layer configuration based on the selected location
      // Special case for Utah location
      if (selectedLocation.lng === -111.8722 && selectedLocation.lat === 40.73639) {
        // Add footprint layer for Utah data
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
              4, 2,
              5, 5,
              6, 7,
              7, 10,
              8, 20,
            ],
            'circle-color': [
              'interpolate',
              ['linear'],
              ['get', 'value'],
              footprintMin, colors.footprintScale[0],
              footprintMin + footprintStep, colors.footprintScale[1],
              footprintMin + (2 * footprintStep), colors.footprintScale[2],
              footprintMin + (3 * footprintStep), colors.footprintScale[3],
              footprintMin + (4 * footprintStep), colors.footprintScale[4],
              footprintMax, colors.footprintScale[5]
            ],
            'circle-opacity': 0.85,
            'circle-blur': 0.2,
            'circle-stroke-color': 'rgba(255, 255, 255, 0.3)'
          },
          layout: {
            visibility: layerType === 'footprint' ? 'visible' : 'none'
          },
          filter: [
            'all',
            ['==', ['get', 'layer_type'], 'footprint'],
            ['>', ['get', 'value'], currentFootprintThreshold],
            ['==', ['get', 'date'], formatDateForFilter(currentDate)]
          ]
        });
        
        // Add PM2.5 layer for Utah data
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
              ['get', 'pm25_value'],
              0, colors.pm25Scale[0],
              12, colors.pm25Scale[1],
              35, colors.pm25Scale[2],
              55, colors.pm25Scale[3],
              75, colors.pm25Scale[4],
              100, colors.pm25Scale[5]
            ],
            'circle-opacity': 0.85,
            'circle-blur': 0.5,
            'circle-stroke-width': 0.5,
            'circle-stroke-color': 'rgba(255, 255, 255, 0.3)'
          },
          layout: {
            visibility: layerType === 'pm25' ? 'visible' : 'none'
          },
          filter: [
            'all',
            ['==', ['get', 'layer_type'], 'convolved'],
            ['>', ['get', 'pm25_value'], currentPm25Threshold],
            ['==', ['get', 'date'], formatDateForFilter(currentDate)]
          ]
        });
      }
      // Special case for Texas location
      else if (selectedLocation.lng === -101.8504 && selectedLocation.lat === 33.59076) {
        // Add footprint layer for Texas data
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
              4, 2,
              5, 5,
              6, 7,
              7, 10,
              8, 20,
            ],
            'circle-color': [
              'interpolate',
              ['linear'],
              ['get', 'value'],
              footprintMin, colors.footprintScale[0],
              footprintMin + footprintStep, colors.footprintScale[1],
              footprintMin + (2 * footprintStep), colors.footprintScale[2],
              footprintMin + (3 * footprintStep), colors.footprintScale[3],
              footprintMin + (4 * footprintStep), colors.footprintScale[4],
              footprintMax, colors.footprintScale[5]
            ],
            'circle-opacity': 0.85,
            'circle-blur': 0.2,
            'circle-stroke-color': 'rgba(255, 255, 255, 0.3)'
          },
          layout: {
            visibility: layerType === 'footprint' ? 'visible' : 'none'
          },
          filter: [
            'all',
            ['>', ['get', 'value'], currentFootprintThreshold],
            ['==', ['get', 'date'], formatDateForFilter(currentDate)]
          ]
        });
        
        // Add PM2.5 layer for Texas data
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
              0, colors.pm25Scale[0],
              12, colors.pm25Scale[1],
              35, colors.pm25Scale[2],
              55, colors.pm25Scale[3],
              75, colors.pm25Scale[4],
              100, colors.pm25Scale[5]
            ],
            'circle-opacity': 0.85,
            'circle-blur': 0.5,
            'circle-stroke-width': 0.5,
            'circle-stroke-color': 'rgba(255, 255, 255, 0.3)'
          },
          layout: {
            visibility: layerType === 'pm25' ? 'visible' : 'none'
          },
          filter: ['>', ['get', 'pm25'], currentPm25Threshold]
        });
      }
      // Regular location case
      else {
        // Add footprint layer with dynamic range and threshold filter
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
              4, 2,
              5, 5,
              6, 7,
              7, 10,
              8, 20,
            ],
            'circle-color': [
              'interpolate',
              ['linear'],
              // Check if 'value' property exists, otherwise use 'footprint'
              ['coalesce', ['get', 'value'], ['get', 'footprint']],
              footprintMin, colors.footprintScale[0],
              footprintMin + footprintStep, colors.footprintScale[1],
              footprintMin + (2 * footprintStep), colors.footprintScale[2],
              footprintMin + (3 * footprintStep), colors.footprintScale[3],
              footprintMin + (4 * footprintStep), colors.footprintScale[4],
              footprintMax, colors.footprintScale[5]
            ],
            'circle-opacity': 0.85,
            'circle-blur': 0.2,
            'circle-stroke-color': 'rgba(255, 255, 255, 0.3)'
          },
          layout: {
            visibility: layerType === 'footprint' ? 'visible' : 'none'
          },
          filter: ['>', ['coalesce', ['get', 'footprint'], 0], currentFootprintThreshold]
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
              0, colors.pm25Scale[0],
              12, colors.pm25Scale[1],
              35, colors.pm25Scale[2],
              55, colors.pm25Scale[3],
              75, colors.pm25Scale[4],
              100, colors.pm25Scale[5]
            ],
            'circle-opacity': 0.85,
            'circle-blur': 0.5,
            'circle-stroke-width': 0.5,
            'circle-stroke-color': 'rgba(255, 255, 255, 0.3)'
          },
          layout: {
            visibility: layerType === 'pm25' ? 'visible' : 'none'
          },
          filter: ['>', ['get', 'pm25'], currentPm25Threshold]
        });
      }
      
      // Make sure timestamp is visible
      addTimestampIndicator();
    } catch (err) {
      console.error('Error loading location data:', err);
    }
    }
  }, [selectedLocation, layerType, currentFootprintThreshold, currentPm25Threshold, currentDate, addTimestampIndicator, dataLoadAttempt]);
  
  // Manage marker visibility when a location is selected
  useEffect(() => {
    if (!markersRef.current.length) return;
    
    if (selectedLocation) {
      // Hide all markers except the selected one
      markersRef.current.forEach(({ marker, element, location }) => {
        if (location.lat === selectedLocation.lat && location.lng === selectedLocation.lng) {
          // Keep the selected marker visible
          if (location.lng === -101.8504 && location.lat === 33.59076 ||
              location.lng === -111.8722 && location.lat === 40.73639) {
            // Use mahogany color for the time series data marker
            element.style.backgroundImage = `url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2225%22%20height%3D%2241%22%3E%3Cpath%20fill%3D%22%23${colors.moabMahogany.substring(1)}%22%20d%3D%22M12.5%200C5.596%200%200%205.596%200%2012.5c0%203.662%203.735%2011.08%208.302%2019.271.44.788.859%201.536%201.26%202.263C10.714%2036.357%2011.496%2038%2012.5%2038c1.004%200%201.786-1.643%202.938-3.966.401-.727.82-1.475%201.26-2.263C21.265%2023.58%2025%2016.162%2025%2012.5%2025%205.596%2019.404%200%2012.5%200zm0%2018a5.5%205.5%200%20110-11%205.5%205.5%200%20010%2011z%22%2F%3E%3C%2Fsvg%3E')`;
          } else {
            // Use canyonlands tan color for other selected markers
            element.style.backgroundImage = `url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2225%22%20height%3D%2241%22%3E%3Cpath%20fill%3D%22%23${colors.canyonlandsTan.substring(1)}%22%20d%3D%22M12.5%200C5.596%200%200%205.596%200%2012.5c0%203.662%203.735%2011.08%208.302%2019.271.44.788.859%201.536%201.26%202.263C10.714%2036.357%2011.496%2038%2012.5%2038c1.004%200%201.786-1.643%202.938-3.966.401-.727.82-1.475%201.26-2.263C21.265%2023.58%2025%2016.162%2025%2012.5%2025%205.596%2019.404%200%2012.5%200zm0%2018a5.5%205.5%200%20110-11%205.5%205.5%200%20010%2011z%22%2F%3E%3C%2Fsvg%3E')`;
          }
        } else {
          element.style.display = 'none';
        }
      });
    } else {
      // Restore all markers to their original styles
      markersRef.current.forEach(({ marker, element, location }) => {
        element.style.display = 'block';
        
        if (location.lng === -101.8504 && location.lat === 33.59076 || 
            location.lng === -111.8722 && location.lat === 40.73639) {
          element.style.backgroundImage = `url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2225%22%20height%3D%2241%22%3E%3Cpath%20fill%3D%22%23${colors.moabMahogany.substring(1)}%22%20d%3D%22M12.5%200C5.596%200%200%205.596%200%2012.5c0%203.662%203.735%2011.08%208.302%2019.271.44.788.859%201.536%201.26%202.263C10.714%2036.357%2011.496%2038%2012.5%2038c1.004%200%201.786-1.643%202.938-3.966.401-.727.82-1.475%201.26-2.263C21.265%2023.58%2025%2016.162%2025%2012.5%2025%205.596%2019.404%200%2012.5%200zm0%2018a5.5%205.5%200%20110-11%205.5%205.5%200%20010%2011z%22%2F%3E%3C%2Fsvg%3E')`;
        } else {
          element.style.backgroundImage = `url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2225%22%20height%3D%2241%22%3E%3Cpath%20fill%3D%22%23${colors.bonnevilleSaltFlatsBlue.substring(1)}%22%20d%3D%22M12.5%200C5.596%200%200%205.596%200%2012.5c0%203.662%203.735%2011.08%208.302%2019.271.44.788.859%201.536%201.26%202.263C10.714%2036.357%2011.496%2038%2012.5%2038c1.004%200%201.786-1.643%202.938-3.966.401-.727.82-1.475%201.26-2.263C21.265%2023.58%2025%2016.162%2025%2012.5%2025%205.596%2019.404%200%2012.5%200zm0%2018a5.5%205.5%200%20110-11%205.5%205.5%200%20010%2011z%22%2F%3E%3C%2Fsvg%3E')`;
        }
      });
    }
  }, [selectedLocation, colors.canyonlandsTan, colors.moabMahogany, colors.bonnevilleSaltFlatsBlue]);

  // Return JSX with styled components
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Map container */}
      <div ref={mapContainer} style={style} />
      
      {/* Map UI Components */}
      <MapHeader 
        selectedLocation={selectedLocation} 
        isPlaying={isPlaying} 
        currentDate={currentDate} 
      />
      
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
      
      <ZoomControls 
        currentZoom={currentZoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
      
      <MapLegend 
        selectedLocation={selectedLocation}
        layerType={layerType}
        currentFootprintThreshold={currentFootprintThreshold}
        currentPm25Threshold={currentPm25Threshold}
      />
    </div>
  );
};

export default MultiLocationMapbox;