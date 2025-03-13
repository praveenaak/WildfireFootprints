import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_CONFIG } from '../../config/mapbox';

interface MapboxViewerProps {
  accessToken?: string;
  tilesetId: string;
  center: [number, number];
  zoom: number;
  style?: React.CSSProperties;
}

const MapboxViewer: React.FC<MapboxViewerProps> = ({
  accessToken = MAPBOX_CONFIG.accessToken,
  tilesetId,
  center,
  zoom,
  style = { width: '100%', height: '100vh' } // Full screen height
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [layerType, setLayerType] = useState<'footprint' | 'pm25'>('footprint');
  
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
            5, 3,
            8, 8,
            12, 15
          ],
          'circle-color': [
            // Using a logarithmic-like scale for values between 0 and 0.027452
            'interpolate',
            ['linear'],
            // Apply a pseudo-log transformation to the footprint value
            ['/', ['get', 'footprint'], 0.001], // Divide by small number to scale up for visibility
            1, '#e6f7ff', // Very low values (0.001)
            5, '#91d5ff', // Low values (0.005)
            10, '#4dabf7', // Medium-low values (0.01)
            15, '#1890ff', // Medium values (0.015)
            20, '#0050b3', // Medium-high values (0.02)
            27.452, '#003a8c' // High values (0.027452)
          ],
          'circle-opacity': 0.9,
          'circle-stroke-width': 1,
          'circle-stroke-color': 'rgba(255, 255, 255, 0.5)'
        },
        layout: {
          visibility: layerType === 'footprint' ? 'visible' : 'none'
        },
        // Only show points with footprint value > 0
        filter: ['>', ['get', 'footprint'], 0]
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
            5, 3,
            8, 8,
            12, 15
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
        // Only show points with pm25 value > 0
        filter: ['>', ['get', 'pm25'], 0]
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
  }, [accessToken, tilesetId, center, zoom]);
  
  // Update layer visibility when layer type changes
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    
    try {
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
      // Footprint legend items
      const values = [0.001, 0.005, 0.01, 0.015, 0.02, 0.027452];
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
        valueText.textContent = value.toFixed(6);
        
        item.appendChild(colorBox);
        item.appendChild(valueText);
        legend.appendChild(item);
      });
    } else {
      // PM2.5 legend items
      const values = [0, 12, 35, 55, 75, 100];
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
    </div>
  );
};

export default MapboxViewer;