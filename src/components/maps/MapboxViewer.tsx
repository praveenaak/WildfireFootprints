import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_CONFIG } from '../../config/mapbox';
import { colors } from '../../styles/theme';

interface MapboxViewerProps {
  accessToken?: string;
  tilesetId: string;
  center: [number, number];
  zoom: number;
  style?: React.CSSProperties;
  minFootprintThreshold?: number; // Add threshold prop with default value in component
  minPm25Threshold?: number; // Add threshold prop with default value in component
}

interface SelectedLocation {
  footprint: number;
  pm25: number;
  longitude: number;
  latitude: number;
}

const MapboxViewer: React.FC<MapboxViewerProps> = ({
  accessToken = MAPBOX_CONFIG.accessToken,
  tilesetId,
  center,
  zoom,
  style = { width: '100%', height: '100vh' },
  minFootprintThreshold = 1e-7, // Adjust this value based on your data
  minPm25Threshold = 0.01 // Adjust this value based on your data
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popup = useRef<mapboxgl.Popup | null>(null);
  const hoverPopup = useRef<mapboxgl.Popup | null>(null);
  const [layerType, setLayerType] = useState<'footprint' | 'pm25'>('footprint');
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  
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
    
    // Initialize map with data when it loads
    map.current.on('load', () => {
      if (!map.current) return;
      
      // Add the source for our tileset
      map.current.addSource('footprint-data', {
        type: 'vector',
        url: `mapbox://${tilesetId}`
      });
      
      // Add footprint heatmap layer to create a smooth blended effect
      map.current.addLayer({
        id: 'footprint-heatmap',
        type: 'heatmap',
        source: 'footprint-data',
        'source-layer': 'location_-111-9dkxy7',
        paint: {
          // Increase the heatmap weight based on footprint value
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'footprint'],
            1e-7, 0.1,
            0.8, 1
          ],
          // Increase the heatmap color weight by zoom level
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3, 1,
            8, 0.5
          ],
          // Color ramp for heatmap - lighter to darker mahogany colors
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(255, 219, 213, 0)',
            0.1, colors.footprintScale[0], // Lightest
            0.3, colors.footprintScale[1],
            0.5, colors.footprintScale[2],
            0.7, colors.footprintScale[3],
            0.85, colors.footprintScale[4],
            1, colors.footprintScale[5] // Darkest
          ],
          // Adjust the heatmap radius by zoom level
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3, 15,
            8, 5
          ],
          // Transition from heatmap to circle layer by zoom level
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            6, 1,
            9, 0
          ]
        },
        layout: {
          visibility: layerType === 'footprint' ? 'visible' : 'none'
        },
        filter: ['>', ['get', 'footprint'], minFootprintThreshold]
      });
      
      // Add footprint layer as circle points with logarithmic scale for coloring
      map.current.addLayer({
        id: 'footprint-layer',
        type: 'circle',
        source: 'footprint-data',
        'source-layer': 'location_-111-9dkxy7',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3, 25,  // Much larger at zoom level 3
            4, 20,
            5, 18,
            8, 15,
            12, 10
          ],
          'circle-color': [
            // Using a logarithmic-like scale for values between minFootprintThreshold and 0.8
            'interpolate',
            ['linear'],
            // Apply a pseudo-log transformation to the footprint value
            ['get', 'footprint'],
            1e-7, colors.footprintScale[0], // Lightest for very low values
            1e-5, colors.footprintScale[0],
            1e-4, colors.footprintScale[0],
            1e-3, colors.footprintScale[1], // Start gradient from 0.001
            1e-2, colors.footprintScale[2],
            1e-1, colors.footprintScale[3],
            5e-1, colors.footprintScale[4],
            8e-1, colors.footprintScale[5] // Darkest for highest values
          ],
          'circle-opacity': 0.9,
          'circle-stroke-width': 0,
          'circle-blur': 1.2
        },
        layout: {
          visibility: layerType === 'footprint' ? 'visible' : 'none'
        },
        filter: ['>', ['get', 'footprint'], minFootprintThreshold]
      });
      
      // Add PM2.5 layer as circle points
      map.current.addLayer({
        id: 'pm25-layer',
        type: 'circle',
        source: 'footprint-data',
        'source-layer': 'location_-111-9dkxy7',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3, 25,
            5, 20,
            8, 15,
            12, 12
          ],
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'pm25'],
            0, '#e6ffed', // Very clean air
            12, '#b7eb8f', // Good air quality (EPA standard)
            35, '#ffe58f', // Moderate air quality (EPA standard)
            55, '#ffbb96', // Unhealthy for sensitive groups
            75, '#ff7875', // Unhealthy
            100, '#ff4d4f'  // Very unhealthy
          ],
          'circle-opacity': 0.9,
          'circle-stroke-width': 1,
          'circle-stroke-color': 'rgba(255, 255, 255, 0.5)'
        },
        layout: {
          visibility: layerType === 'pm25' ? 'visible' : 'none'
        },
        filter: ['>', ['get', 'pm25'], minPm25Threshold]
      });

      // Initialize hover popup
      hoverPopup.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      });

      // Change cursor when user hovers over either layer
      map.current.on('mouseenter', 'footprint-layer', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseenter', 'pm25-layer', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      // Change cursor back when user leaves either layer
      map.current.on('mouseleave', 'footprint-layer', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
        // Also remove hover popup when leaving the point
        hoverPopup.current?.remove();
      });

      map.current.on('mouseleave', 'pm25-layer', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
        // Also remove hover popup when leaving the point
        hoverPopup.current?.remove();
      });

      // Add mousemove event for hover effect
      map.current.on('mousemove', (e) => {
        if (!map.current || selectedLocation) return;

        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['footprint-layer', 'pm25-layer']
        });

        // Clear existing hover popup when moving away from point
        if (!features.length) {
          hoverPopup.current?.remove();
          return;
        }

        const feature = features[0];
        const props = feature.properties;
        
        // Ensure we properly parse the numeric properties
        const footprint = props?.footprint ? parseFloat(props.footprint) : null;
        const pm25 = props?.pm25 ? parseFloat(props.pm25) : null;
        
        if (footprint === null || pm25 === null) return;

        // Create popup content
        const popupContent = `
          <div style="padding: 8px;">
            <p style="margin: 0 0 5px 0;"><strong>Footprint:</strong> ${footprint.toExponential(6)}</p>
            <p style="margin: 0;"><strong>PM2.5:</strong> ${pm25} μg/m³</p>
            <p style="margin: 5px 0 0 0; font-size: 10px; font-style: italic;">Click for more details</p>
          </div>
        `;

        // Position the popup at the coordinates of the point
        hoverPopup.current
          ?.setLngLat(e.lngLat)
          .setHTML(popupContent)
          .addTo(map.current);
      });

      // Remove the general click handler and add specific click handlers for each layer
      // Add click handler for footprint layer
      map.current.on('click', 'footprint-layer', (e) => {
        if (!e.features || e.features.length === 0) return;
        
        const feature = e.features[0];
        const props = feature.properties;
        
        const footprint = props?.footprint ? parseFloat(props.footprint) : null;
        const pm25 = props?.pm25 ? parseFloat(props.pm25) : null;
        
        if (footprint === null || pm25 === null) {
          console.error('Invalid feature properties:', props);
          return;
        }

        if (selectedLocation) {
          // If clicking the same location, clear selection
          if (selectedLocation.footprint === footprint && 
              selectedLocation.pm25 === pm25) {
            setSelectedLocation(null);
            return;
          }
        }

        // Set new selected location
        setSelectedLocation({
          footprint: footprint,
          pm25: pm25,
          longitude: e.lngLat.lng,
          latitude: e.lngLat.lat
        });
        
        // Remove hover popup when selecting a point
        hoverPopup.current?.remove();
      });

      // Add click handler for pm25 layer
      map.current.on('click', 'pm25-layer', (e) => {
        if (!e.features || e.features.length === 0) return;
        
        const feature = e.features[0];
        const props = feature.properties;
        
        const footprint = props?.footprint ? parseFloat(props.footprint) : null;
        const pm25 = props?.pm25 ? parseFloat(props.pm25) : null;
        
        if (footprint === null || pm25 === null) {
          console.error('Invalid feature properties:', props);
          return;
        }

        if (selectedLocation) {
          // If clicking the same location, clear selection
          if (selectedLocation.footprint === footprint && 
              selectedLocation.pm25 === pm25) {
            setSelectedLocation(null);
            return;
          }
        }

        // Set new selected location
        setSelectedLocation({
          footprint: footprint,
          pm25: pm25,
          longitude: e.lngLat.lng,
          latitude: e.lngLat.lat
        });
        
        // Remove hover popup when selecting a point
        hoverPopup.current?.remove();
      });

      // Add click handler for map background to clear selection
      map.current.on('click', (e) => {
        const features = map.current?.queryRenderedFeatures(e.point, {
          layers: ['footprint-layer', 'pm25-layer']
        });

        // Only clear selection if clicking outside any point
        if (!features || features.length === 0) {
          setSelectedLocation(null);
        }
      });

      // Add a legend
      createLegend();
    });
    
    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [accessToken, tilesetId, center, zoom, minFootprintThreshold, minPm25Threshold]);
  
  // Update layer visibility when layer type changes
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    
    try {
      map.current.setLayoutProperty(
        'footprint-heatmap',
        'visibility',
        layerType === 'footprint' ? 'visible' : 'none'
      );
      
      map.current.setLayoutProperty(
        'footprint-layer',
        'visibility',
        layerType === 'footprint' ? 'visible' : 'none'
      );
      
      map.current.setLayoutProperty(
        'pm25-layer',
        'visibility',
        layerType === 'pm25' ? 'visible' : 'none'
      );

      // Update the legend when the layer type changes
      updateLegend();
    } catch (err) {
      console.error('Error updating layer visibility:', err);
    }
  }, [layerType]);

  // Update filters when selected location changes
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    // Remove existing popup if any
    if (popup.current) {
      popup.current.remove();
      popup.current = null;
    }

    // If a location is selected, only show that marker
    // Otherwise show all markers above threshold
    if (selectedLocation) {
      try {
        // Create a new source just for the selected feature
        if (map.current.getSource('selected-point')) {
          map.current.removeLayer('selected-point-layer');
          map.current.removeSource('selected-point');
        }
        
        // Add a new source with just the selected marker
        map.current.addSource('selected-point', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [selectedLocation.longitude, selectedLocation.latitude]
            },
            properties: {
              footprint: selectedLocation.footprint,
              pm25: selectedLocation.pm25
            }
          }
        });
        
        // Add a new layer for the selected point
        map.current.addLayer({
          id: 'selected-point-layer',
          type: 'circle',
          source: 'selected-point',
          paint: {
            'circle-radius': 15,
            'circle-color': layerType === 'footprint' ? '#1890ff' : '#ff7875',
            'circle-opacity': 0.9,
            'circle-stroke-width': 3,
            'circle-stroke-color': 'white'
          }
        });
        
        // Hide all other markers
        map.current.setLayoutProperty('footprint-layer', 'visibility', 'none');
        map.current.setLayoutProperty('pm25-layer', 'visibility', 'none');
        
        // Fly to the selected location with animation
        map.current.flyTo({
          center: [selectedLocation.longitude, selectedLocation.latitude],
          zoom: 10,
          duration: 1000
        });
        
        // Create a detailed popup for the selected location
        popup.current = new mapboxgl.Popup({ closeOnClick: false })
          .setLngLat([selectedLocation.longitude, selectedLocation.latitude])
          .setHTML(`
            <div style="padding: 12px;">
              <h3 style="margin: 0 0 8px 0;">Selected Location</h3>
              <p style="margin: 0 0 5px 0;"><strong>Footprint:</strong> ${selectedLocation.footprint.toExponential(6)}</p>
              <p style="margin: 0 0 5px 0;"><strong>PM2.5:</strong> ${selectedLocation.pm25} μg/m³</p>
              <p style="margin: 0 0 5px 0;"><strong>Coordinates:</strong> [${selectedLocation.longitude.toFixed(5)}, ${selectedLocation.latitude.toFixed(5)}]</p>
              <p style="margin: 5px 0 0 0; font-size: 11px; font-style: italic;">Click anywhere else to clear selection</p>
            </div>
          `)
          .addTo(map.current);
          
      } catch (err) {
        console.error('Error updating for selected location:', err);
      }
    } else {
      // When no location is selected, remove the selected point layer and source
      try {
        if (map.current.getLayer('selected-point-layer')) {
          map.current.removeLayer('selected-point-layer');
        }
        
        if (map.current.getSource('selected-point')) {
          map.current.removeSource('selected-point');
        }
        
        // Show the appropriate layer based on layer type
        map.current.setLayoutProperty(
          'footprint-heatmap',
          'visibility',
          layerType === 'footprint' ? 'visible' : 'none'
        );
        
        map.current.setLayoutProperty(
          'footprint-layer',
          'visibility',
          layerType === 'footprint' ? 'visible' : 'none'
        );
        
        map.current.setLayoutProperty(
          'pm25-layer',
          'visibility',
          layerType === 'pm25' ? 'visible' : 'none'
        );
        
        // Apply the threshold filters
        map.current.setFilter('footprint-layer', ['>', ['get', 'footprint'], minFootprintThreshold]);
        map.current.setFilter('pm25-layer', ['>', ['get', 'pm25'], minPm25Threshold]);
      } catch (err) {
        console.error('Error resetting view:', err);
      }
    }
  }, [selectedLocation, minFootprintThreshold, minPm25Threshold, layerType]);

  // Create a legend for the current layer
  const createLegend = () => {
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
    title.textContent = layerType === 'footprint' ? 'Footprint Scale' : 'PM2.5 Scale (μg/m³)';
    legend.appendChild(title);
    
    if (layerType === 'footprint') {
      // Footprint legend items - using logarithmic scale
      const values = [1e-7, 1e-3, 1e-2, 1e-1, 5e-1, 8e-1];
      const legendColors = [
        colors.footprintScale[0], // Lightest for very low values
        colors.footprintScale[1], // Start gradient from 0.001
        colors.footprintScale[2],
        colors.footprintScale[3],
        colors.footprintScale[4],
        colors.footprintScale[5]  // Darkest for highest values
      ];
      
      values.forEach((value, i) => {
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.marginBottom = '5px';
        
        const colorBox = document.createElement('span');
        colorBox.style.width = '20px';
        colorBox.style.height = '20px';
        colorBox.style.backgroundColor = legendColors[i];
        colorBox.style.display = 'inline-block';
        colorBox.style.marginRight = '5px';
        
        const valueText = document.createElement('span');
        valueText.style.fontSize = '12px';
        valueText.textContent = value.toExponential(6); // Using exponential notation for clarity
        
        item.appendChild(colorBox);
        item.appendChild(valueText);
        legend.appendChild(item);
      });

      // Add note about threshold
      const thresholdNote = document.createElement('div');
      thresholdNote.style.fontSize = '10px';
      thresholdNote.style.marginTop = '8px';
      thresholdNote.style.fontStyle = 'italic';
      legend.appendChild(thresholdNote);
    } else {
      // PM2.5 legend items
      const values = [minPm25Threshold, 12, 35, 55, 75, 100];
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
        valueText.textContent = `${value}${i < values.length - 1 ? `-${values[i+1]}` : '+'}: ${labels[i]}`;
        
        item.appendChild(colorBox);
        item.appendChild(valueText);
        legend.appendChild(item);
      });

      // Add note about threshold
      const thresholdNote = document.createElement('div');
      thresholdNote.style.fontSize = '10px';
      thresholdNote.style.marginTop = '8px';
      thresholdNote.style.fontStyle = 'italic';
      legend.appendChild(thresholdNote);
    }
    
    // Append legend to map container
    if (mapContainer.current) {
      mapContainer.current.appendChild(legend);
    }
  };

  // Update the legend when layer type changes
  const updateLegend = () => {
    createLegend();
  };

  // Function to adjust the threshold values
  const adjustThreshold = (type: 'increase' | 'decrease') => {
    if (layerType === 'footprint') {
      const newThreshold = type === 'increase' 
        ? minFootprintThreshold * 2
        : minFootprintThreshold / 2;
        
      // Update the filter for the footprint layer
      if (map.current && map.current.getLayer('footprint-layer')) {
        map.current.setFilter('footprint-layer', ['>', ['get', 'footprint'], newThreshold]);
      }
      
      // Update the filter for the footprint heatmap layer
      if (map.current && map.current.getLayer('footprint-heatmap')) {
        map.current.setFilter('footprint-heatmap', ['>', ['get', 'footprint'], newThreshold]);
      }
    } else {
      const newThreshold = type === 'increase'
        ? minPm25Threshold * 2
        : minPm25Threshold / 2;
        
      // Update the filter for the pm25 layer
      if (map.current && map.current.getLayer('pm25-layer')) {
        map.current.setFilter('pm25-layer', ['>', ['get', 'pm25'], newThreshold]);
      }
    }
    
    // Update the legend
    updateLegend();
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
      </div>

      {/* Add threshold adjustment controls */}
      <div style={{ 
        position: 'absolute', 
        top: '60px', 
        left: '10px', 
        zIndex: 1,
        background: 'rgba(255, 255, 255, 0.8)',
        padding: '10px',
        borderRadius: '4px'
      }}>
        <p style={{ margin: '0 0 5px 0', fontSize: '12px' }}>Adjust Threshold:</p>
        <div style={{ display: 'flex' }}>
          <button 
            onClick={() => adjustThreshold('decrease')}
            style={{ 
              padding: '5px 10px',
              marginRight: '5px',
              backgroundColor: '#f1f1f1',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Lower
          </button>
          <button 
            onClick={() => adjustThreshold('increase')}
            style={{ 
              padding: '5px 10px',
              backgroundColor: '#f1f1f1',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Raise
          </button>
        </div>
      </div>
      
      {/* Add info text */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        left: '10px',
        zIndex: 1,
        background: 'rgba(255, 255, 255, 0.8)',
        padding: '10px',
        borderRadius: '4px',
        maxWidth: '250px',
        fontSize: '12px'
      }}>
        <p style={{ margin: '0', fontWeight: 'bold' }}>Point Interaction:</p>
        <p style={{ margin: '5px 0 0 0' }}>• Hover over points to see their values</p>
        <p style={{ margin: '5px 0 0 0' }}>• Click a point to select it and view detailed information</p>
        <p style={{ margin: '5px 0 0 0' }}>• Click elsewhere to clear the selection</p>
      </div>
    </div>
  );
};

export default MapboxViewer;