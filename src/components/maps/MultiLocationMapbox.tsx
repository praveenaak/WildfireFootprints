import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_CONFIG } from '../../config/mapbox';

interface Location {
  lat: number;
  lng: number;
  tilesetId: string;
  layerName: string;
}

interface MultiLocationMapboxProps {
  accessToken?: string;
  center: [number, number];
  zoom: number;
  style?: React.CSSProperties;
  minFootprintThreshold?: number;
  minPm25Threshold?: number;
  timestamp?: string; // Add timestamp prop
}

const MultiLocationMapbox: React.FC<MultiLocationMapboxProps> = ({
  accessToken = MAPBOX_CONFIG.accessToken,
  center,
  zoom,
  style = { width: '100%', height: '100vh' },
  minFootprintThreshold = 0.0002, // Default threshold for footprint
  minPm25Threshold = 0.01, // Default threshold for PM2.5
  timestamp = '08-25-2016 00:00' // Default timestamp
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [layerType, setLayerType] = useState<'footprint' | 'pm25'>('footprint');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [currentFootprintThreshold, setCurrentFootprintThreshold] = useState(minFootprintThreshold);
  const [currentPm25Threshold, setCurrentPm25Threshold] = useState(minPm25Threshold);
  const [currentZoom, setCurrentZoom] = useState<number>(zoom);
  
  // Parse the coordinates string into Location objects
  const parseCoordinates = (): Location[] => {
    const locationStrings = [
      "-101.8504 33.59076", "-104.8286 38.84801", "-104.9876 39.75118", 
      "-105.0797 40.57129", "-105.2634 40.0211", "-106.5012 31.76829", 
      "-106.5852 35.1343", "-110.9823 32.29515", "-111.8722 40.73639", 
      "-112.0958 33.50383", "-115.0529 36.0487", "-116.2703 43.63611", 
      "-116.541 33.85275", "-117.1497 32.70149", "-117.3255 34.51096", 
      "-117.331 33.67649", "-117.4263 47.69978", "-118.1305 34.66974", 
      "-118.5284 34.38344", "-119.0626 35.35661", "-119.1432 34.25239", 
      "-119.2042 46.21835", "-119.7164 36.81945", "-119.8077 39.52508", 
      "-120.9942 37.64216", "-121.265 38.74643", "-121.2685 37.95074", 
      "-121.8949 37.3485", "-122.3086 47.56824", "-122.7102 38.4435", 
      "-122.8164 45.47019"
    ];
    
    return locationStrings.map(locString => {
      const [lngStr, latStr] = locString.split(" ");
      const lng = parseFloat(lngStr);
      const lat = parseFloat(latStr);
      
      // Format the tilesetId according to the convention (remove minus sign, add underscore)
      const formattedLng = Math.abs(lng).toString().replace('.', '_');
      const formattedLat = lat.toString().replace('.', '_');
      const tilesetId = `pkulandh.wf_${formattedLng}_${formattedLat}`;
      const layerName = `wf_${formattedLng}_${formattedLat}`;
      
      return { lat, lng, tilesetId, layerName };
    });
  };
  
  const locations = parseCoordinates();
  
  // Store markers in a ref to manage them
  const markersRef = useRef<{
    marker: mapboxgl.Marker;
    element: HTMLDivElement;
    location: Location;
  }[]>([]);
  
  // Location-specific data ranges
  const [dataRanges, setDataRanges] = useState<{
    [key: string]: {
      footprint: {min: number, max: number},
      pm25: {min: number, max: number}
    }
  }>({});
  
  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Set Mapbox token
    mapboxgl.accessToken = accessToken;
    
    // Create map instance
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_CONFIG.styleUrl,
      center: center,
      zoom: zoom,
      fadeDuration: 0 // Immediately show tiles without fade-in
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
    
    // Initialize map with markers when it loads
    map.current.on('load', () => {
      if (!map.current) return;
      
      // Clear any existing markers
      markersRef.current = [];
      
      // Generate simulated data ranges for each location
      // In a real app, these would come from an API or data analysis
      const simulatedRanges: {[key: string]: any} = {};
      
      // Add markers for all 
      locations.forEach((location) => {
        const el = document.createElement('div');
        el.className = 'location-marker';
        el.style.width = '25px';
        el.style.height = '41px';
        el.style.backgroundImage = "url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2225%22%20height%3D%2241%22%3E%3Cpath%20fill%3D%22%234dabf7%22%20d%3D%22M12.5%200C5.596%200%200%205.596%200%2012.5c0%203.662%203.735%2011.08%208.302%2019.271.44.788.859%201.536%201.26%202.263C10.714%2036.357%2011.496%2038%2012.5%2038c1.004%200%201.786-1.643%202.938-3.966.401-.727.82-1.475%201.26-2.263C21.265%2023.58%2025%2016.162%2025%2012.5%2025%205.596%2019.404%200%2012.5%200zm0%2018a5.5%205.5%200%20110-11%205.5%205.5%200%20010%2011z%22%2F%3E%3C%2Fsvg%3E')";
        el.style.backgroundSize = 'cover';
        el.style.cursor = 'pointer';
        // Remove any transition effects to make positioning instant
        el.style.transition = 'none';
        
        // Generate location key for data ranges
        const locationKey = `${location.lng}_${location.lat}`;
        
        simulatedRanges[locationKey] = {
          footprint: {
            // Generate variable ranges for different locations
            min: 0.0001,
            max: 0.04 // Fixed maximum of 0.04
          },
          pm25: {
            min: 0,
            max: 50 + (Math.random() * 100) // Random max between 50 and 150
          }
        };
        
        // Create the marker with the custom element and disable animation
        const marker = new mapboxgl.Marker({
          element: el,
          // Setting anchor to bottom center to align with pin location
          anchor: 'bottom',
          // Offset the marker to position correctly with the pin point
          offset: [0, 0]
        })
          .setLngLat([location.lng, location.lat])
          .addTo(map.current!);
        
        // Store the marker reference
        markersRef.current.push({
          marker,
          element: el,
          location
        });
        
        // Add click event to marker
        el.addEventListener('click', () => {
          // Set the selected location
          setSelectedLocation(location);
          
          // Fly to the location
          map.current?.flyTo({
            center: [location.lng, location.lat],
            zoom: 7,
            essential: true,
            speed: 1.8, 
            curve: 1,
            easing: t => t // Use linear easing for faster zooming
          });
        });
      });
      
      // Store the data ranges
      setDataRanges(simulatedRanges);
      
      // Create legend placeholder
      createLegend();
      
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
  }, [accessToken, center, zoom, timestamp]);
  
  // Add effect to update timestamp display whenever zoom changes
  useEffect(() => {
    addTimestampIndicator();
  }, [currentZoom]);

  // Update legend whenever layer type changes
  useEffect(() => {
    if (selectedLocation) {
      const locationKey = `${selectedLocation.lng}_${selectedLocation.lat}`;
      const ranges = {
        footprint: { min: 0.0002, max: 0.04 },
        pm25: { min: 0, max: 100 }
      };
      createLegend(ranges, layerType);
    }
  }, [layerType]);
  
  // Manage marker visibility when a location is selected
  useEffect(() => {
    if (!markersRef.current.length) return;
    
    if (selectedLocation) {
      // Hide all markers except the selected one
      markersRef.current.forEach(({ marker, element, location }) => {
        if (location.lat === selectedLocation.lat && location.lng === selectedLocation.lng) {
          // Keep the selected marker visible
          element.style.backgroundImage = "url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2225%22%20height%3D%2241%22%3E%3Cpath%20fill%3D%22%23ff9500%22%20d%3D%22M12.5%200C5.596%200%200%205.596%200%2012.5c0%203.662%203.735%2011.08%208.302%2019.271.44.788.859%201.536%201.26%202.263C10.714%2036.357%2011.496%2038%2012.5%2038c1.004%200%201.786-1.643%202.938-3.966.401-.727.82-1.475%201.26-2.263C21.265%2023.58%2025%2016.162%2025%2012.5%2025%205.596%2019.404%200%2012.5%200zm0%2018a5.5%205.5%200%20110-11%205.5%205.5%200%20010%2011z%22%2F%3E%3C%2Fsvg%3E')";
          element.style.width = '30px';
          element.style.height = '49px';
          element.style.zIndex = '100';
        } else {
          // Hide other markers
          marker.remove();
        }
      });
    } else {
      // Show all markers when no location is selected
      markersRef.current.forEach(({ marker, element, location }) => {
        // Reset marker style
        element.style.backgroundImage = "url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2225%22%20height%3D%2241%22%3E%3Cpath%20fill%3D%22%234dabf7%22%20d%3D%22M12.5%200C5.596%200%200%205.596%200%2012.5c0%203.662%203.735%2011.08%208.302%2019.271.44.788.859%201.536%201.26%202.263C10.714%2036.357%2011.496%2038%2012.5%2038c1.004%200%201.786-1.643%202.938-3.966.401-.727.82-1.475%201.26-2.263C21.265%2023.58%2025%2016.162%2025%2012.5%2025%205.596%2019.404%200%2012.5%200zm0%2018a5.5%205.5%200%20110-11%205.5%205.5%200%20010%2011z%22%2F%3E%3C%2Fsvg%3E')";
        element.style.width = '25px';
        element.style.height = '41px';
        
        // Add marker back to map if it's not already there
        if (!marker.getElement().isConnected) {
          marker.addTo(map.current!);
        }
      });
    }
  }, [selectedLocation]);
  
  // Load the footprint and PM2.5 data when a location is selected
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded() || !selectedLocation) return;
    
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
    
    // Get data ranges for this location
    const locationKey = `${selectedLocation.lng}_${selectedLocation.lat}`;
    const ranges = {
      footprint: { min: 0.0002, max: 0.04 },
      pm25: { min: 0, max: 100 }
    };
    
    try {
      // Add the source for the selected location's tileset
      map.current.addSource('footprint-data', {
        type: 'vector',
        url: `mapbox://${selectedLocation.tilesetId}`
      });
      
      // Calculate intermediate steps for footprint color scale
      const footprintMax = 0.04; // Fixed maximum
      const footprintMin = Math.max(ranges.footprint.min, currentFootprintThreshold);
      const footprintStep = (footprintMax - footprintMin) / 5;
      
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
            ['get', 'footprint'],
            footprintMin, '#e6f7ff',
            footprintMin + footprintStep, '#91d5ff',
            footprintMin + (2 * footprintStep), '#4dabf7',
            footprintMin + (3 * footprintStep), '#1890ff',
            footprintMin + (4 * footprintStep), '#0050b3',
            footprintMax, '#003a8c'
          ],
          'circle-opacity': 0.85,
          'circle-blur': 0.2,
          'circle-stroke-color': 'rgba(255, 255, 255, 0.3)'
        },
        layout: {
          visibility: layerType === 'footprint' ? 'visible' : 'none'
        },
        filter: ['all', 
          ['>', ['get', 'footprint'], currentFootprintThreshold], 
          ['>', ['get', 'footprint'], 0]
        ]
      });
      
      // Add PM2.5 layer with dynamic range and threshold filter
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
            Math.max(0, currentPm25Threshold), '#e6ffed',
            Math.min(12, ranges.pm25.max * 0.1), '#b7eb8f',
            Math.min(35, ranges.pm25.max * 0.35), '#ffe58f',
            Math.min(55, ranges.pm25.max * 0.55), '#ffbb96',
            Math.min(75, ranges.pm25.max * 0.75), '#ff7875',
            ranges.pm25.max, '#ff4d4f'
          ],
          'circle-opacity': 0.85,
          'circle-blur': 0.5,
          'circle-stroke-width': 0.5,
          'circle-stroke-color': 'rgba(255, 255, 255, 0.3)'
        },
        layout: {
          visibility: layerType === 'pm25' ? 'visible' : 'none'
        },
        filter: ['>', ['get', 'pm25'], 0]
      });
      
      // Update the legend with the specific ranges for this location
      createLegend(ranges, layerType);
      
      // Make sure timestamp is visible
      addTimestampIndicator();
    } catch (err) {
      console.error('Error loading location data:', err);
    }
  }, [selectedLocation, layerType, currentFootprintThreshold, currentPm25Threshold]);
  
  // Create a legend for the current layer
  const createLegend = (ranges?: { 
    footprint: {min: number, max: number}, 
    pm25: {min: number, max: number} 
  }, forcedLayerType?: 'footprint' | 'pm25') => {
    // Use the forced layer type if provided, otherwise use the current state
    const displayLayerType = forcedLayerType || layerType;
    if (!map.current) return;
    
    // Remove existing legend if any
    const existingLegend = document.getElementById('map-legend');
    if (existingLegend) {
      existingLegend.remove();
    }
    
    // Create legend container
    const legend = document.createElement('div');
    legend.id = 'map-legend';
    legend.style.position = 'absolute';
    legend.style.bottom = '30px';
    legend.style.right = '20px';
    legend.style.padding = '15px';
    legend.style.backgroundColor = 'rgba(22, 28, 45, 0.8)';
    legend.style.color = 'white';
    legend.style.borderRadius = '8px';
    legend.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    legend.style.zIndex = '1';
    legend.style.maxWidth = '220px';
    
    // Add legend title
    const title = document.createElement('h4');
    title.style.margin = '0 0 12px 0';
    title.style.fontSize = '16px';
    title.style.fontWeight = '600';
    title.style.borderBottom = '1px solid rgba(255,255,255,0.2)';
    title.style.paddingBottom = '8px';
    title.textContent = selectedLocation 
      ? (displayLayerType === 'footprint' ? 'Footprint Scale' : 'PM2.5 Scale (μg/m³)')
      : 'Data Legend';
    legend.appendChild(title);
    
    if (selectedLocation && ranges) {
      if (displayLayerType === 'footprint') {
        // Dynamic footprint legend items based on the location's range
        const min = Math.max(ranges.footprint.min, currentFootprintThreshold);
        const max = ranges.footprint.max;
        const step = (max - min) / 5;
        
        const values = [
          min,
          min + step,
          min + (2 * step),
          min + (3 * step),
          min + (4 * step),
          max
        ];
        
        const colors = ['#e6f7ff', '#91d5ff', '#4dabf7', '#1890ff', '#0050b3', '#003a8c'];
        
        const legendGrid = document.createElement('div');
        legendGrid.style.display = 'grid';
        legendGrid.style.gridTemplateColumns = '24px 1fr';
        legendGrid.style.gap = '8px 10px';
        legendGrid.style.alignItems = 'center';
        legendGrid.style.marginBottom = '10px';
        
        values.forEach((value, i) => {
          const colorBox = document.createElement('span');
          colorBox.style.width = '24px';
          colorBox.style.height = '24px';
          colorBox.style.backgroundColor = colors[i];
          colorBox.style.display = 'block';
          colorBox.style.borderRadius = '4px';
          
          const valueText = document.createElement('span');
          valueText.style.fontSize = '13px';
          valueText.textContent = value.toExponential(4); // Using exponential notation for clearer display
          
          legendGrid.appendChild(colorBox);
          legendGrid.appendChild(valueText);
        });
        
        legend.appendChild(legendGrid);
        
        // Add information about thresholds
        const note = document.createElement('p');
        note.style.fontSize = '12px';
        note.style.marginTop = '12px';
        note.style.opacity = '0.8';
        note.style.padding = '8px';
        note.style.backgroundColor = 'rgba(255,255,255,0.1)';
        note.style.borderRadius = '4px';
        note.textContent = `Values < ${currentFootprintThreshold.toExponential(4)} are filtered out`;
        legend.appendChild(note);
        
      } else {
        // Dynamic PM2.5 legend based on location's range
        const max = ranges.pm25.max;
        const min = Math.max(0, currentPm25Threshold);
        
        // Create ranges that adapt to the maximum value but preserve EPA breakpoints where possible
        const values = [
          min,
          Math.min(12, max * 0.1),
          Math.min(35, max * 0.35),
          Math.min(55, max * 0.55),
          Math.min(75, max * 0.75),
          max
        ];
        
        const colors = ['#e6ffed', '#b7eb8f', '#ffe58f', '#ffbb96', '#ff7875', '#ff4d4f'];
        const labels = ['Very Good', 'Good', 'Moderate', 'Unhealthy for Sensitive', 'Unhealthy', 'Very Unhealthy'];
        
        const legendGrid = document.createElement('div');
        legendGrid.style.display = 'grid';
        legendGrid.style.gridTemplateColumns = '24px 1fr';
        legendGrid.style.gap = '8px 10px';
        legendGrid.style.alignItems = 'center';
        legendGrid.style.marginBottom = '10px';
        
        values.forEach((value, i) => {
          const colorBox = document.createElement('span');
          colorBox.style.width = '24px';
          colorBox.style.height = '24px';
          colorBox.style.backgroundColor = colors[i];
          colorBox.style.display = 'block';
          colorBox.style.borderRadius = '4px';
          
          const valueText = document.createElement('span');
          valueText.style.fontSize = '13px';
          valueText.style.lineHeight = '1.3';
          
          // Format the range text
          let rangeText = '';
          if (i === values.length - 1) {
            rangeText = `${value.toFixed(1)}+`;
          } else {
            rangeText = `${value.toFixed(1)} - ${values[i + 1].toFixed(1)}`;
          }
          
          valueText.innerHTML = `${rangeText}<br><span style="opacity:0.8">${labels[i]}</span>`;
          
          legendGrid.appendChild(colorBox);
          legendGrid.appendChild(valueText);
        });
        
        legend.appendChild(legendGrid);
        
        // Add information about thresholds
        const note = document.createElement('p');
        note.style.fontSize = '12px';
        note.style.marginTop = '12px';
        note.style.opacity = '0.8';
        note.style.padding = '8px';
        note.style.backgroundColor = 'rgba(255,255,255,0.1)';
        note.style.borderRadius = '4px';
        note.textContent = `Values < ${currentPm25Threshold.toExponential(4)} are filtered out`;
        legend.appendChild(note);
      }
    }

    // Append legend to map container
    if (mapContainer.current) {
      mapContainer.current.appendChild(legend);
    }
  };
  
  // Add timestamp indicator
  const addTimestampIndicator = () => {
    if (!map.current) return;
    
    // Remove existing timestamp if any
    const existingTimestamp = document.getElementById('map-timestamp');
    if (existingTimestamp) {
      existingTimestamp.remove();
    }
    
    // Create timestamp container
    const timestampContainer = document.createElement('div');
    timestampContainer.id = 'map-timestamp';
    timestampContainer.style.position = 'absolute';
    timestampContainer.style.bottom = '30px';
    timestampContainer.style.left = '20px';
    timestampContainer.style.padding = '10px 16px';
    timestampContainer.style.backgroundColor = 'rgba(22, 28, 45, 0.85)';
    timestampContainer.style.color = 'white';
    timestampContainer.style.borderRadius = '10px';
    timestampContainer.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
    timestampContainer.style.zIndex = '1';
    timestampContainer.style.maxWidth = '220px';
    timestampContainer.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    timestampContainer.style.fontFamily = "'Inter', sans-serif";
    timestampContainer.style.backdropFilter = 'blur(8px)';
    
    // Add timestamp text
    const timestampText = document.createElement('span');
    timestampText.style.fontSize = '13px';
    timestampText.style.fontWeight = '600';
    timestampText.textContent = timestamp;
    timestampContainer.appendChild(timestampText);
    
    // Add timestamp to map container
    if (mapContainer.current) {
      mapContainer.current.appendChild(timestampContainer);
    }
  };
  
  // Function to adjust threshold values
  const adjustThreshold = (type: 'increase' | 'decrease') => {
    if (layerType === 'footprint') {
      // Adjust footprint threshold
      const newThreshold = type === 'increase' 
        ? currentFootprintThreshold * 2
        : currentFootprintThreshold / 2;
      
      setCurrentFootprintThreshold(newThreshold);
      
      // Update filter if layer exists
      if (map.current && map.current.getLayer('footprint-layer')) {
        map.current.setFilter('footprint-layer', ['>', ['get', 'footprint'], newThreshold]);
        const ranges = {
          footprint: { min: 0.0002, max: 0.04 },
          pm25: { min: 0, max: 100 }
        };
        createLegend(ranges, layerType);
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
        const ranges = {
          footprint: { min: 0.0002, max: 0.04 },
          pm25: { min: 0, max: 100 }
        };
        createLegend(ranges, layerType);
      }
    }
  };

  return (
    <div className="mapbox-container" style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={mapContainer} style={style} />
      
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        left: '50%', 
        transform: 'translateX(-50%)',
        zIndex: 1,
        background: 'rgba(22, 28, 45, 0.85)',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        color: 'white',
        maxWidth: '320px',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        fontFamily: "'Inter', sans-serif"
      }}>
        {selectedLocation ? (
          <div style={{ fontSize: '16px' }}>
            <strong>Selected Location:</strong> {selectedLocation.lng.toFixed(4)}, {selectedLocation.lat.toFixed(4)}
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: '18px', margin: '0 0 10px 0', fontWeight: '600' }}>Wildfire Footprint Visualizer</h2>
            <p style={{ margin: '0 0 15px 0', fontSize: '14px', lineHeight: '1.4', opacity: '0.8' }}>
              This interactive map shows atmospheric footprint and PM2.5 data from wildfires across multiple locations.
            </p>
            <p style={{ margin: '0', fontSize: '14px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '6px', lineHeight: '1.4' }}>
              Click on any blue marker to view detailed data for that specific location.
            </p>
          </div>
        )}
      </div>

      {selectedLocation && (
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          left: '20px', 
          zIndex: 1,
          background: 'rgba(22, 28, 45, 0.85)',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          color: 'white',
          maxWidth: '320px',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          fontFamily: "'Inter', sans-serif"
        }}>
          <button 
            onClick={() => {
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
                map.current.jumpTo({
                  center: center,
                  zoom: zoom
                });
              }
              
              // Reset selected location
              setSelectedLocation(null);
            }}
            style={{ 
              width: '100%',
              padding: '12px 0',
              backgroundColor: '#ff9500',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              boxShadow: '0 2px 6px rgba(255, 149, 0, 0.3)',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '18px' }}>↩</span> Back to All Locations
          </button>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <button 
              onClick={() => {
                setLayerType('footprint');
                
                // Calculate the bounds of visible data points
                if (map.current && map.current.getLayer('footprint-layer')) {
                  // First show the footprint layer
                  map.current.setLayoutProperty('footprint-layer', 'visibility', 'visible');
                  if (map.current.getLayer('pm25-layer')) {
                    map.current.setLayoutProperty('pm25-layer', 'visibility', 'none');
                  }
                  
                  // Zoom out to fit all visible points
                  if (selectedLocation) {
                    // Fit to the current data extent by using a slightly larger zoom level
                    map.current.jumpTo({
                      center: [selectedLocation.lng, selectedLocation.lat],
                      zoom: 6 // Zoom out a bit to show the full footprint
                    });
                  }
                }
              }}
              style={{ 
                flex: 1,
                fontWeight: '600',
                padding: '12px 0',
                backgroundColor: layerType === 'footprint' ? '#4dabf7' : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: layerType === 'footprint' ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: layerType === 'footprint' ? '0 2px 8px rgba(77, 171, 247, 0.3)' : 'none'
              }}
            >
              Footprint Data
            </button>
            <button 
              onClick={() => {
                setLayerType('pm25');
                
                // Calculate the bounds of visible data points
                if (map.current && map.current.getLayer('pm25-layer')) {
                  // First show the PM2.5 layer
                  map.current.setLayoutProperty('pm25-layer', 'visibility', 'visible');
                  if (map.current.getLayer('footprint-layer')) {
                    map.current.setLayoutProperty('footprint-layer', 'visibility', 'none');
                  }
                  
                  // Zoom out to fit all visible points
                  if (selectedLocation) {
                    // Fit to the current data extent by using a slightly larger zoom level
                    map.current.jumpTo({
                      center: [selectedLocation.lng, selectedLocation.lat],
                      zoom: 6 // Zoom out a bit to show the full PM2.5 extent
                    });
                  }
                }
              }}
              style={{ 
                flex: 1,
                fontWeight: '600',
                padding: '12px 0',
                backgroundColor: layerType === 'pm25' ? '#4dabf7' : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: layerType === 'pm25' ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: layerType === 'pm25' ? '0 2px 8px rgba(77, 171, 247, 0.3)' : 'none'
              }}
            >
              Convolved
            </button>
          </div>

          {/* Add threshold controls */}
          <div style={{ 
            marginBottom: '16px', 
            padding: '14px', 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            {layerType === 'footprint' ? (
              <>
                <p style={{ margin: '0', fontSize: '14px', fontWeight: '500' }}>
                  Footprint Threshold: {currentFootprintThreshold.toExponential(4)}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => adjustThreshold('decrease')}
                    style={{ 
                      flex: 1,
                      padding: '8px 0',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Lower Threshold
                  </button>
                  <button 
                    onClick={() => adjustThreshold('increase')}
                    style={{ 
                      flex: 1,
                      padding: '8px 0',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Raise Threshold
                  </button>
                </div>
              </>
            ) : (
              <p style={{ margin: '0', fontSize: '14px', fontWeight: '500', textAlign: 'center' }}>
                Showing PM2.5 in Convolved Footprints + Emissions
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiLocationMapbox;