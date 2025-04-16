import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_CONFIG } from '../../config/mapbox';
import { Location, MultiLocationMapboxProps, LayerType, MarkerRef } from './types';
import { parseCoordinates, formatInitialDate } from './utils/mapUtils';
import { useMapAnimation } from './hooks/useMapAnimation';
import { MapControls } from './ui/MapControls';
import { MapHeader } from './ui/MapHeader';
import { MapLegend } from './ui/MapLegend';

const MultiLocationMapbox: React.FC<MultiLocationMapboxProps> = ({
  accessToken = MAPBOX_CONFIG.accessToken,
  center,
  zoom,
  style = { width: '100%', height: '100vh' },
  minFootprintThreshold = 0.0002,
  minPm25Threshold = 0.01,
  timestamp = '08-25-2016 00:00'
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [layerType, setLayerType] = useState<LayerType>('footprint');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [currentFootprintThreshold, setCurrentFootprintThreshold] = useState(minFootprintThreshold);
  const [currentPm25Threshold, setCurrentPm25Threshold] = useState(minPm25Threshold);
  const [currentZoom, setCurrentZoom] = useState<number>(zoom);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDate, setCurrentDate] = useState(formatInitialDate(timestamp));

  // Store markers in a ref to manage them
  const markersRef = useRef<MarkerRef[]>([]);
  const locations = parseCoordinates();

  // Add timestamp indicator
  const addTimestampIndicator = () => {
    // Remove existing timestamp if any
    const existingTimestamp = document.getElementById('map-timestamp');
    if (existingTimestamp) {
      existingTimestamp.remove();
    }
    // No longer adding the timestamp indicator since it's shown in the header
  };

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

  // Function to adjust threshold values
  const adjustThreshold = (type: 'increase' | 'decrease') => {
    if (layerType === 'footprint') {
      let newThreshold;
      if (type === 'increase') {
        newThreshold = currentFootprintThreshold * 1.1; // Smaller increment for smoother changes
      } else {
        newThreshold = currentFootprintThreshold / 1.1; // Smaller decrement for smoother changes
      }
      
      // Clamp the threshold between min and max values
      newThreshold = Math.max(0.0001, Math.min(0.04, newThreshold));
      
      setCurrentFootprintThreshold(newThreshold);
      
      if (map.current && map.current.getLayer('footprint-layer')) {
        if (selectedLocation && selectedLocation.lng === -101.8504 && selectedLocation.lat === 33.59076) {
          const formattedDateForFilter = `${currentDate.substring(0, 4)}-${currentDate.substring(4, 6)}-${currentDate.substring(6, 8)}`;
          map.current.setFilter('footprint-layer', ['all',
            ['>', ['get', 'value'], newThreshold],
            ['==', ['get', 'date'], formattedDateForFilter]
          ]);
        } else {
          map.current.setFilter('footprint-layer', ['>', ['coalesce', ['get', 'footprint'], 0], newThreshold]);
        }
      }
    } else {
      const newThreshold = type === 'increase'
        ? currentPm25Threshold * 1.1
        : currentPm25Threshold / 1.1;
      
      setCurrentPm25Threshold(newThreshold);
      
      if (map.current && map.current.getLayer('pm25-layer')) {
        map.current.setFilter('pm25-layer', ['>', ['get', 'pm25'], newThreshold]);
      }
    }
  };

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainer.current) return;
    
    mapboxgl.accessToken = accessToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/pkulandh/cm9iyi6qq00jo01rce7xjcfay',
      center: center,
      zoom: zoom,
      fadeDuration: 0,
      projection: { name: 'mercator' }
    });
    
    // Remove default navigation controls
    map.current.addControl(new mapboxgl.FullscreenControl());
    
    map.current.on('zoom', () => {
      if (map.current) {
        setCurrentZoom(Math.round(map.current.getZoom() * 10) / 10);
      }
    });
    
    map.current.on('load', () => {
      if (!map.current) return;
      
      try {
        // @ts-ignore
        if (map.current.transform && map.current.transform._renderWorldCopies === false) {
          // @ts-ignore
          map.current.transform._renderWorldCopies = true;
        }
      } catch (e) {
        console.warn('Could not force 2D mode:', e);
      }
      
      markersRef.current = [];
      
      locations.forEach((location) => {
        const el = document.createElement('div');
        el.className = 'location-marker';
        el.style.width = '25px';
        el.style.height = '41px';
        
        if (location.lng === -101.8504 && location.lat === 33.59076) {
          el.style.backgroundImage = "url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2225%22%20height%3D%2241%22%3E%3Cpath%20fill%3D%22%23751d0c%22%20d%3D%22M12.5%200C5.596%200%200%205.596%200%2012.5c0%203.662%203.735%2011.08%208.302%2019.271.44.788.859%201.536%201.26%202.263C10.714%2036.357%2011.496%2038%2012.5%2038c1.004%200%201.786-1.643%202.938-3.966.401-.727.82-1.475%201.26-2.263C21.265%2023.58%2025%2016.162%2025%2012.5%2025%205.596%2019.404%200%2012.5%200zm0%2018a5.5%205.5%200%20110-11%205.5%205.5%200%20010%2011z%22%2F%3E%3C%2Fsvg%3E')";
          
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
          
          el.addEventListener('mouseenter', () => {
            tooltip.style.opacity = '1';
          });
          
          el.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
          });
        } else {
          el.style.backgroundImage = "url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2225%22%20height%3D%2241%22%3E%3Cpath%20fill%3D%22%23751d0c%22%20d%3D%22M12.5%200C5.596%200%200%205.596%200%2012.5c0%203.662%203.735%2011.08%208.302%2019.271.44.788.859%201.536%201.26%202.263C10.714%2036.357%2011.496%2038%2012.5%2038c1.004%200%201.786-1.643%202.938-3.966.401-.727.82-1.475%201.26-2.263C21.265%2023.58%2025%2016.162%2025%2012.5%2025%205.596%2019.404%200%2012.5%200zm0%2018a5.5%205.5%200%20110-11%205.5%205.5%200%20010%2011z%22%2F%3E%3C%2Fsvg%3E')";
        }
        
        el.style.backgroundSize = 'cover';
        el.style.cursor = 'pointer';
        el.style.transition = 'none';
        
        const marker = new mapboxgl.Marker({
          element: el,
          anchor: 'bottom',
          offset: [0, 0]
        })
          .setLngLat([location.lng, location.lat])
          .addTo(map.current!);
        
        markersRef.current.push({
          marker,
          element: el,
          location
        });
        
        el.addEventListener('click', () => {
          if (isPlaying) {
            toggleAnimation();
          }
          
          if (location.lng === -101.8504 && location.lat === 33.59076) {
            setCurrentDate('20160801');
          }
          
          setSelectedLocation(location);
          
          map.current?.flyTo({
            center: [location.lng, location.lat],
            zoom: 7,
            essential: true,
            speed: 1.8,
            curve: 1,
            easing: t => t
          });
        });
      });
      
      addTimestampIndicator();
    });
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [accessToken, center, zoom, timestamp]);

  // Load the footprint and PM2.5 data when a location is selected
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded() || !selectedLocation) return;
    
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
      map.current.addSource('footprint-data', {
        type: 'vector',
        url: `mapbox://${selectedLocation.tilesetId}`
      });
      
      const footprintMax = 0.04;
      const footprintMin = Math.max(0.0002, currentFootprintThreshold);
      const footprintStep = (footprintMax - footprintMin) / 5;
      
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
            footprintMin, '#ffd4cc',
            footprintMin + footprintStep, '#ffa699',
            footprintMin + (2 * footprintStep), '#ff7866',
            footprintMin + (3 * footprintStep), '#c73122',
            footprintMin + (4 * footprintStep), '#962615',
            footprintMax, '#751d0c'
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
            Math.max(0, currentPm25Threshold), '#2c6e31',
            Math.min(12, 100 * 0.1), '#4d9221',
            Math.min(35, 100 * 0.35), '#c67f1d',
            Math.min(55, 100 * 0.55), '#d14009',
            Math.min(75, 100 * 0.75), '#ad1707',
            100, '#8b0000'
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
      
      addTimestampIndicator();
    } catch (err) {
      console.error('Error loading location data:', err);
    }
  }, [selectedLocation, layerType, currentFootprintThreshold, currentPm25Threshold]);

  // Manage marker visibility when a location is selected
  useEffect(() => {
    if (!markersRef.current.length) return;
    
    if (selectedLocation) {
      markersRef.current.forEach(({ marker, element, location }) => {
        if (location.lat === selectedLocation.lat && location.lng === selectedLocation.lng) {
          if (location.lng === -101.8504 && location.lat === 33.59076) {
            element.style.backgroundImage = "url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2225%22%20height%3D%2241%22%3E%3Cpath%20fill%3D%22%23751d0c%22%20d%3D%22M12.5%200C5.596%200%200%205.596%200%2012.5c0%203.662%203.735%2011.08%208.302%2019.271.44.788.859%201.536%201.26%202.263C10.714%2036.357%2011.496%2038%2012.5%2038c1.004%200%201.786-1.643%202.938-3.966.401-.727.82-1.475%201.26-2.263C21.265%2023.58%2025%2016.162%2025%2012.5%2025%205.596%2019.404%200%2012.5%200zm0%2018a5.5%205.5%200%20110-11%205.5%205.5%200%20010%2011z%22%2F%3E%3C%2Fsvg%3E')";
          } else {
            element.style.backgroundImage = "url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2225%22%20height%3D%2241%22%3E%3Cpath%20fill%3D%22%23751d0c%22%20d%3D%22M12.5%200C5.596%200%200%205.596%200%2012.5c0%203.662%203.735%2011.08%208.302%2019.271.44.788.859%201.536%201.26%202.263C10.714%2036.357%2011.496%2038%2012.5%2038c1.004%200%201.786-1.643%202.938-3.966.401-.727.82-1.475%201.26-2.263C21.265%2023.58%2025%2016.162%2025%2012.5%2025%205.596%2019.404%200%2012.5%200zm0%2018a5.5%205.5%200%20110-11%205.5%205.5%200%20010%2011z%22%2F%3E%3C%2Fsvg%3E')";
          }
          element.style.width = '30px';
          element.style.height = '49px';
          element.style.zIndex = '100';
        } else {
          marker.remove();
        }
      });
    } else {
      markersRef.current.forEach(({ marker, element, location }) => {
        if (location.lng === -101.8504 && location.lat === 33.59076) {
          element.style.backgroundImage = "url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2225%22%20height%3D%2241%22%3E%3Cpath%20fill%3D%22%23751d0c%22%20d%3D%22M12.5%200C5.596%200%200%205.596%200%2012.5c0%203.662%203.735%2011.08%208.302%2019.271.44.788.859%201.536%201.26%202.263C10.714%2036.357%2011.496%2038%2012.5%2038c1.004%200%201.786-1.643%202.938-3.966.401-.727.82-1.475%201.26-2.263C21.265%2023.58%2025%2016.162%2025%2012.5%2025%205.596%2019.404%200%2012.5%200zm0%2018a5.5%205.5%200%20110-11%205.5%205.5%200%20010%2011z%22%2F%3E%3C%2Fsvg%3E')";
        } else {
          element.style.backgroundImage = "url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2225%22%20height%3D%2241%22%3E%3Cpath%20fill%3D%22%23751d0c%22%20d%3D%22M12.5%200C5.596%200%200%205.596%200%2012.5c0%203.662%203.735%2011.08%208.302%2019.271.44.788.859%201.536%201.26%202.263C10.714%2036.357%2011.496%2038%2012.5%2038c1.004%200%201.786-1.643%202.938-3.966.401-.727.82-1.475%201.26-2.263C21.265%2023.58%2025%2016.162%2025%2012.5%2025%205.596%2019.404%200%2012.5%200zm0%2018a5.5%205.5%200%20110-11%205.5%205.5%200%20010%2011z%22%2F%3E%3C%2Fsvg%3E')";
        }
        element.style.width = '25px';
        element.style.height = '41px';
        
        if (!marker.getElement().isConnected) {
          marker.addTo(map.current!);
        }
      });
    }
  }, [selectedLocation]);

  // Update timestamp when playing state changes
  useEffect(() => {
    addTimestampIndicator();
  }, [isPlaying, currentDate]);

  const handleBackClick = () => {
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
      
      map.current.jumpTo({
        center: center,
        zoom: zoom
      });
    }
    
    setSelectedLocation(null);
  };

  return (
    <div className="mapbox-container" style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={mapContainer} style={style} />
      
      <MapHeader
        selectedLocation={selectedLocation}
        isPlaying={isPlaying}
        toggleAnimation={toggleAnimation}
        currentDate={currentDate}
      />

      {/* Custom Zoom Controls */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '20px',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: '#f8f9fa',
        padding: '6px',
        borderRadius: '8px',
        border: '1px solid #751d0c'
      }}>
        <button
          onClick={() => map.current?.zoomIn()}
          style={{
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            border: '1px solid #751d0c',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '18px',
            color: '#751d0c',
            padding: 0
          }}
        >
          +
        </button>
        <div style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#16182d',
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          fontFamily: 'Sora, sans-serif'
        }}>
          {currentZoom}
        </div>
        <button
          onClick={() => map.current?.zoomOut()}
          style={{
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            border: '1px solid #751d0c',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '18px',
            color: '#751d0c',
            padding: 0
          }}
        >
          −
        </button>
      </div>

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
    </div>
  );
};

export default MultiLocationMapbox;