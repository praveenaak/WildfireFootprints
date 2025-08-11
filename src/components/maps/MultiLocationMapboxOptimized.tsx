import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_CONFIG } from '../../config/mapbox';
import { formatInitialDate } from './utils/mapUtils';
import { useMapAnimation } from './hooks/useMapAnimation';
import { useMapLayers } from './hooks/useMapLayers';
import { useMapMarkers } from './hooks/useMapMarkers';
import { useMapCleanup } from './hooks/useMapCleanup';
import { MapControls } from './ui/MapControls';
import { MapLegend } from './ui/MapLegend';
import { MapHeader } from './ui/MapHeader';
import { ZoomControls } from './ui/ZoomControls';
import { AnimationControls } from './ui/AnimationControls';
import { TimestampIndicator } from './ui/TimestampIndicator';
import { Location, LayerType, MultiLocationMapboxProps } from './types';
import { MAP_CONSTANTS } from '../../constants/mapConstants';

const MultiLocationMapboxOptimized: React.FC<MultiLocationMapboxProps> = ({
  accessToken = MAPBOX_CONFIG.accessToken,
  center,
  zoom = MAP_CONSTANTS.ZOOM.DEFAULT,
  style = { width: '100%', height: '100vh' },
  minFootprintThreshold = MAP_CONSTANTS.FOOTPRINT_THRESHOLD.DEFAULT,
  minPm25Threshold = 0,
  timestamp = '08-25-2016 00:00',
  locations = [],
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Memory management
  const { addCleanupFunction } = useMapCleanup({ map });

  // State management
  const [layerType, setLayerType] = useState<LayerType>('footprint');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [currentFootprintThreshold, setCurrentFootprintThreshold] = useState(minFootprintThreshold);
  const [currentPm25Threshold, setCurrentPm25Threshold] = useState(minPm25Threshold);
  const [currentZoom, setCurrentZoom] = useState<number>(zoom);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDate, setCurrentDate] = useState(formatInitialDate(timestamp));

  // Custom hooks with memoization
  const mapLayersHook = useMapLayers({
    map,
    selectedLocation,
    currentDate,
    currentFootprintThreshold,
    currentPm25Threshold,
  });

  const mapMarkersHook = useMapMarkers({
    map,
    locations,
    selectedLocation,
    onLocationSelect: useCallback((location: Location) => {
      setSelectedLocation(location);
    }, []),
  });

  const { toggleAnimation } = useMapAnimation({
    isPlaying,
    setIsPlaying,
    currentDate,
    setCurrentDate,
    selectedLocation,
    map,
    currentFootprintThreshold,
    addTimestampIndicator: useCallback(() => {
      // Timestamp indicator logic
    }, []),
  });

  // Memoized handlers
  const handleLayerTypeChange = useCallback(
    (newLayerType: LayerType) => {
      setLayerType(newLayerType);

      if (newLayerType === 'footprint') {
        mapLayersHook.loadFootprintLayer();
      } else if (newLayerType === 'pm25') {
        mapLayersHook.loadPm25Layer();
      }
    },
    [mapLayersHook]
  );

  const handleThresholdChange = useCallback(
    (type: 'increase' | 'decrease') => {
      if (layerType === 'footprint') {
        const newThreshold =
          type === 'increase' ? currentFootprintThreshold * 2 : currentFootprintThreshold / 2;
        setCurrentFootprintThreshold(newThreshold);
      } else {
        const newThreshold =
          type === 'increase' ? currentPm25Threshold * 2 : currentPm25Threshold / 2;
        setCurrentPm25Threshold(newThreshold);
      }

      // Update filters with debouncing would be ideal here
      setTimeout(() => {
        mapLayersHook.updateLayerFilters(layerType);
      }, 300);
    },
    [layerType, currentFootprintThreshold, currentPm25Threshold, mapLayersHook]
  );

  const handleZoomIn = useCallback(() => {
    if (map.current) {
      const newZoom = Math.min(currentZoom + 1, MAP_CONSTANTS.ZOOM.MAX);
      map.current.setZoom(newZoom);
      setCurrentZoom(newZoom);
    }
  }, [currentZoom]);

  const handleZoomOut = useCallback(() => {
    if (map.current) {
      const newZoom = Math.max(currentZoom - 1, MAP_CONSTANTS.ZOOM.MIN);
      map.current.setZoom(newZoom);
      setCurrentZoom(newZoom);
    }
  }, [currentZoom]);

  // Memoized map initialization
  const initializeMap = useMemo(() => {
    return () => {
      if (mapContainer.current && !map.current) {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: center || [-98.5, 39.5],
          zoom: currentZoom,
          accessToken,
        });

        map.current.on('load', () => {
          mapMarkersHook.addMarkers();
        });

        map.current.on('zoom', () => {
          if (map.current) {
            setCurrentZoom(map.current.getZoom());
          }
        });
      }
    };
  }, [accessToken, center, currentZoom, mapMarkersHook]);

  // Effect for map initialization
  useEffect(() => {
    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initializeMap]);

  // Effect for updating layers when location changes
  useEffect(() => {
    if (selectedLocation) {
      handleLayerTypeChange(layerType);
    }
  }, [selectedLocation, layerType, handleLayerTypeChange]);

  // Effect for updating markers when locations change
  useEffect(() => {
    mapMarkersHook.addMarkers();
  }, [locations, mapMarkersHook]);

  // Memoized timestamp indicator
  const timestampIndicator = useMemo(() => {
    if (!currentDate) return null;

    const year = currentDate.substring(0, 4);
    const month = currentDate.substring(4, 6);
    const day = currentDate.substring(6, 8);

    return `${month}/${day}/${year}`;
  }, [currentDate]);

  return (
    <div style={{ position: 'relative', ...style }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* UI Components */}
      <MapHeader
        selectedLocation={selectedLocation}
        isPlaying={isPlaying}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
      />

      <MapControls
        selectedLocation={selectedLocation}
        layerType={layerType}
        setLayerType={handleLayerTypeChange}
        currentFootprintThreshold={currentFootprintThreshold}
        currentPm25Threshold={currentPm25Threshold}
        adjustThreshold={handleThresholdChange}
        isPlaying={isPlaying}
        toggleAnimation={toggleAnimation}
        currentDate={currentDate}
        onBackClick={() => setSelectedLocation(null)}
      />

      <MapLegend
        selectedLocation={selectedLocation}
        layerType={layerType}
        currentFootprintThreshold={currentFootprintThreshold}
        currentPm25Threshold={currentPm25Threshold}
      />

      <ZoomControls currentZoom={currentZoom} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />

      {selectedLocation && <AnimationControls isPlaying={isPlaying} onToggle={toggleAnimation} />}

      {timestampIndicator && <TimestampIndicator timestamp={timestampIndicator} />}
    </div>
  );
};

export default React.memo(MultiLocationMapboxOptimized);
