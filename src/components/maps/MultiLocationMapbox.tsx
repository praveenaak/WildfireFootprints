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
}

const MultiLocationMapbox: React.FC<MultiLocationMapboxProps> = ({
  accessToken = MAPBOX_CONFIG.accessToken,
  center,
  zoom,
  style = { width: '100%', height: '100vh' },
  minFootprintThreshold = 0.0001, // Default threshold for footprint
  minPm25Threshold = 0.01 // Default threshold for PM2.5
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [layerType, setLayerType] = useState<'footprint' | 'pm25'>('footprint');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [currentFootprintThreshold, setCurrentFootprintThreshold] = useState(minFootprintThreshold);
  const [currentPm25Threshold, setCurrentPm25Threshold] = useState(minPm25Threshold);
  
  // Parse the coordinates string into Location objects
  const parseCoordinates = (): Location[] => {
    // This is the list of location strings provided
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
      zoom: zoom
    });
    
    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl());
    
    // Initialize map with markers when it loads
    map.current.on('load', () => {
      if (!map.current) return;
      
      // Clear any existing markers
      markersRef.current = [];
      
      // Generate simulated data ranges for each location
      // In a real app, these would come from an API or data analysis
      const simulatedRanges: {[key: string]: any} = {};
      
      // Add markers for all locations
      locations.forEach((location) => {
        const el = document.createElement('div');
        el.className = 'location-marker';
        el.style.width = '15px';
        el.style.height = '15px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#3498db';
        el.style.border = '2px solid white';
        el.style.cursor = 'pointer';
        
        // Generate location key for data ranges
        const locationKey = `${location.lng}_${location.lat}`;
        
        // Create simulated data ranges for this location
        // In a real implementation, these would be fetched from an API
        simulatedRanges[locationKey] = {
          footprint: {
            // Generate variable ranges for different locations
            min: 0.0001,
            max: 0.01 + (Math.random() * 0.04) // Random max between 0.01 and 0.05
          },
          pm25: {
            min: 0,
            max: 50 + (Math.random() * 100) // Random max between 50 and 150
          }
        };
        
        // Create a popup but don't add it to the map yet
        const popup = new mapboxgl.Popup({ offset: 25 }).setText(
          `Location: ${location.lng.toFixed(4)}, ${location.lat.toFixed(4)}`
        );
        
        // Create the marker
        const marker = new mapboxgl.Marker(el)
          .setLngLat([location.lng, location.lat])
          .setPopup(popup)
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
            essential: true
          });
        });
      });
      
      // Store the data ranges
      setDataRanges(simulatedRanges);
      
      // Create legend placeholder
      createLegend();
    });
    
    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [accessToken, center, zoom]);
  
  // Manage marker visibility when a location is selected
  useEffect(() => {
    if (!markersRef.current.length) return;
    
    if (selectedLocation) {
      // Hide all markers except the selected one
      markersRef.current.forEach(({ marker, element, location }) => {
        if (location.lat === selectedLocation.lat && location.lng === selectedLocation.lng) {
          // Keep the selected marker visible
          element.style.backgroundColor = '#f39c12'; // Change color to indicate selection
          element.style.width = '18px';
          element.style.height = '18px';
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
        element.style.backgroundColor = '#3498db';
        element.style.width = '15px';
        element.style.height = '15px';
        
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
    const ranges = dataRanges[locationKey] || {
      footprint: { min: 0.0001, max: 0.03 },
      pm25: { min: 0, max: 100 }
    };
    
    try {
      // Add the source for the selected location's tileset
      map.current.addSource('footprint-data', {
        type: 'vector',
        url: `mapbox://${selectedLocation.tilesetId}`
      });
      
      // Calculate intermediate steps for footprint color scale
      const footprintMax = ranges.footprint.max;
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
            ['linear'],
            ['zoom'],
            5, 3,
            8, 8,
            12, 15
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
          'circle-opacity': 0.9,
          'circle-stroke-width': 1,
          'circle-stroke-color': 'rgba(255, 255, 255, 0.5)'
        },
        layout: {
          visibility: layerType === 'footprint' ? 'visible' : 'none'
        },
        // Apply threshold filter to remove very small values
        filter: ['>', ['get', 'footprint'], currentFootprintThreshold]
      });
      
      // Calculate intermediate steps for PM2.5 color scale
      const pm25Max = ranges.pm25.max;
      
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
            5, 3,
            8, 8,
            12, 15
          ],
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'pm25'],
            Math.max(0, currentPm25Threshold), '#e6ffed',
            Math.min(12, pm25Max * 0.1), '#b7eb8f',
            Math.min(35, pm25Max * 0.35), '#ffe58f',
            Math.min(55, pm25Max * 0.55), '#ffbb96',
            Math.min(75, pm25Max * 0.75), '#ff7875',
            pm25Max, '#ff4d4f'
          ],
          'circle-opacity': 0.9,
          'circle-stroke-width': 1,
          'circle-stroke-color': 'rgba(255, 255, 255, 0.5)'
        },
        layout: {
          visibility: layerType === 'pm25' ? 'visible' : 'none'
        },
        // Apply threshold filter to remove very small values
        filter: ['>', ['get', 'pm25'], currentPm25Threshold]
      });
      
      // Update the legend with the specific ranges for this location
      updateLegend(ranges);
    } catch (err) {
      console.error('Error loading location data:', err);
    }
  }, [selectedLocation, dataRanges, layerType, currentFootprintThreshold, currentPm25Threshold]);
  
  // Create a legend for the current layer
  const createLegend = (ranges?: { 
    footprint: {min: number, max: number}, 
    pm25: {min: number, max: number} 
  }) => {
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
    legend.style.right = '10px';
    legend.style.padding = '10px';
    legend.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    legend.style.borderRadius = '4px';
    legend.style.zIndex = '1';
    legend.style.maxWidth = '180px';
    
    // Add legend title
    const title = document.createElement('h4');
    title.style.margin = '0 0 10px 0';
    title.style.fontSize = '14px';
    title.textContent = selectedLocation 
      ? (layerType === 'footprint' ? 'Footprint Scale' : 'PM2.5 Scale (μg/m³)')
      : 'Click a marker to view data';
    legend.appendChild(title);
    
    if (selectedLocation && ranges) {
      if (layerType === 'footprint') {
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
        
        values.forEach((value, i) => {
          const item = document.createElement('div');
          item.style.display = 'flex';
          item.style.alignItems = 'center';
          item.style.marginBottom = '5px';
          
          const colorBox = document.createElement('span');
          colorBox.style.width = '20px';
          colorBox.style.height = '20px';
          colorBox.style.backgroundColor = colors[i];
          colorBox.style.display = 'inline-block';
          colorBox.style.marginRight = '5px';
          
          const valueText = document.createElement('span');
          valueText.style.fontSize = '12px';
          valueText.textContent = value.toExponential(4); // Using exponential notation for clearer display
          
          item.appendChild(colorBox);
          item.appendChild(valueText);
          legend.appendChild(item);
        });
        
        // Add information about thresholds
        const note = document.createElement('p');
        note.style.fontSize = '10px';
        note.style.marginTop = '10px';
        note.style.fontStyle = 'italic';
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
        
        values.forEach((value, i) => {
          const item = document.createElement('div');
          item.style.display = 'flex';
          item.style.alignItems = 'center';
          item.style.marginBottom = '5px';
          
          const colorBox = document.createElement('span');
          colorBox.style.width = '20px';
          colorBox.style.height = '20px';
          colorBox.style.backgroundColor = colors[i];
          colorBox.style.display = 'inline-block';
          colorBox.style.marginRight = '5px';
          
          const valueText = document.createElement('span');
          valueText.style.fontSize = '12px';
          valueText.textContent = `${value.toFixed(1)}${i < values.length - 1 ? `-${values[i+1].toFixed(1)}` : '+'}: ${labels[i]}`;
          
          item.appendChild(colorBox);
          item.appendChild(valueText);
          legend.appendChild(item);
        });
        
        // Add information about thresholds
        const note = document.createElement('p');
        note.style.fontSize = '10px';
        note.style.marginTop = '10px';
        note.style.fontStyle = 'italic';
        note.textContent = `Values < ${currentPm25Threshold.toFixed(2)} are filtered out`;
        legend.appendChild(note);
      }
    } else {
      // Instructions when no location is selected
      const infoText = document.createElement('p');
      infoText.style.fontSize = '12px';
      infoText.style.margin = '0';
      infoText.textContent = 'Select a marker on the map to view footprint or PM2.5 data for that location.';
      legend.appendChild(infoText);
    }
    
    // Append legend to map container
    if (mapContainer.current) {
      mapContainer.current.appendChild(legend);
    }
  };
  
  // Update the legend when layer type or selected location changes
  const updateLegend = (ranges?: { 
    footprint: {min: number, max: number}, 
    pm25: {min: number, max: number} 
  }) => {
    if (selectedLocation && !ranges) {
      const locationKey = `${selectedLocation.lng}_${selectedLocation.lat}`;
      ranges = dataRanges[locationKey];
    }
    createLegend(ranges);
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
        updateLegend();
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
        updateLegend();
      }
    }
  };
  
  return (
    <div className="mapbox-container" style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={mapContainer} style={style} />
      
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        zIndex: 1,
        background: 'rgba(255, 255, 255, 0.8)',
        padding: '10px',
        borderRadius: '4px'
      }}>
        {selectedLocation ? (
          <>
            <div style={{ marginBottom: '10px', fontSize: '14px' }}>
              <strong>Selected Location:</strong> {selectedLocation.lng.toFixed(4)}, {selectedLocation.lat.toFixed(4)}
            </div>
            <button 
              onClick={() => setLayerType('footprint')}
              style={{ 
                fontWeight: layerType === 'footprint' ? 'bold' : 'normal',
                marginRight: '10px',
                padding: '8px 16px',
                backgroundColor: layerType === 'footprint' ? '#3498db' : '#f1f1f1',
                color: layerType === 'footprint' ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Show Footprint
            </button>
            <button 
              onClick={() => setLayerType('pm25')}
              style={{ 
                fontWeight: layerType === 'pm25' ? 'bold' : 'normal',
                padding: '8px 16px',
                backgroundColor: layerType === 'pm25' ? '#3498db' : '#f1f1f1',
                color: layerType === 'pm25' ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Show PM2.5
            </button>
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
                  map.current.flyTo({
                    center: center,
                    zoom: zoom,
                    essential: true
                  });
                }
                
                // Reset selected location
                setSelectedLocation(null);
              }}
              style={{ 
                marginLeft: '10px',
                padding: '8px 16px',
                backgroundColor: '#f1f1f1',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Back to All Locations
            </button>

            {/* Add threshold controls */}
            <div style={{ marginTop: '10px', padding: '5px', backgroundColor: 'rgba(240, 240, 240, 0.8)', borderRadius: '4px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '12px' }}>
                {layerType === 'footprint' 
                  ? `Footprint Threshold: ${currentFootprintThreshold.toExponential(4)}`
                  : `PM2.5 Threshold: ${currentPm25Threshold.toFixed(2)}`}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button 
                  onClick={() => adjustThreshold('decrease')}
                  style={{ 
                    padding: '5px 10px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Lower Threshold
                </button>
                <button 
                  onClick={() => adjustThreshold('increase')}
                  style={{ 
                    padding: '5px 10px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    marginLeft: '5px'
                  }}
                >
                  Raise Threshold
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ fontSize: '14px' }}>
            <strong>Atmospheric Footprint Map</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>
              Click on a marker to view detailed footprint and PM2.5 data for that location.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiLocationMapbox;