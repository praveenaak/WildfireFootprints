import React, { useState, useCallback } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_CONFIG } from '../../config/mapbox';
import {
  parseCoordinates,
  formatInitialDate,
} from './utils/mapUtils';
import { useMapAnimation } from './hooks/useMapAnimation';
import { useMapInitialization } from './hooks/useMapInitialization';
import { 
  MapControls, 
  MapLegend, 
  MapHeader, 
  ZoomControls, 
  AnimationButton,
  MapLayerManager,
  MapMarkerManager
} from './ui';
import { Location, LayerType, MultiLocationMapboxProps } from './types';

const MultiLocationMapboxRefactored: React.FC<MultiLocationMapboxProps> = ({
  accessToken = MAPBOX_CONFIG.accessToken,
  center,
  zoom,
  style = { width: '100%', height: '100vh' },
  minFootprintThreshold = 1e-7,
  minPm25Threshold = 0,
  timestamp = '08-25-2016 00:00',
}) => {
  // State management
  const [layerType, setLayerType] = useState<LayerType>('footprint');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [currentFootprintThreshold, setCurrentFootprintThreshold] = useState(minFootprintThreshold);
  const [currentPm25Threshold, setCurrentPm25Threshold] = useState(minPm25Threshold);
  const [currentZoom, setCurrentZoom] = useState<number>(zoom);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDate, setCurrentDate] = useState(formatInitialDate(timestamp));
  const [dataLoadAttempt, setDataLoadAttempt] = useState(0);

  const locations = parseCoordinates();

  // Custom hooks
  const {
    mapContainer,
    map,
    handleZoomIn,
    handleZoomOut,
    flyToLocation,
    flyToCenter,
  } = useMapInitialization({
    accessToken,
    center,
    zoom,
    style,
    onZoomChange: setCurrentZoom,
  });

  const addTimestampIndicator = useCallback(() => {
    if (!map) return;

    const existingTimestamp = document.getElementById('map-timestamp');
    if (existingTimestamp) {
      existingTimestamp.remove();
    }

    const existingPauseButton = document.getElementById('pause-animation-button');
    if (existingPauseButton) {
      existingPauseButton.remove();
    }
  }, [map]);

  const { toggleAnimation } = useMapAnimation({
    isPlaying,
    setIsPlaying,
    currentDate,
    setCurrentDate,
    selectedLocation,
    map: { current: map },
    currentFootprintThreshold,
    addTimestampIndicator,
  });

  // Event handlers
  const handleLocationSelect = useCallback(
    (location: Location) => {
      if (isPlaying) {
        setIsPlaying(false);
      }

      setCurrentDate('20160801');

      if (selectedLocation?.lng === location.lng && selectedLocation?.lat === location.lat) {
        setDataLoadAttempt(prev => prev + 1);
      }

      setSelectedLocation(location);
      flyToLocation([location.lng, location.lat]);
    },
    [isPlaying, selectedLocation, flyToLocation]
  );

  const handleBackClick = useCallback(() => {
    if (!map) return;

    // Clean up layers
    if (map.getLayer('footprint-layer')) {
      map.removeLayer('footprint-layer');
    }

    if (map.getLayer('pm25-layer')) {
      map.removeLayer('pm25-layer');
    }

    if (map.getSource('footprint-data')) {
      map.removeSource('footprint-data');
    }

    if (map.getSource('pm25-data')) {
      map.removeSource('pm25-data');
    }

    flyToCenter();
    setSelectedLocation(null);
    setLayerType('footprint');
    setIsPlaying(false);
  }, [map, flyToCenter]);

  const adjustThreshold = useCallback((type: 'increase' | 'decrease') => {
    if (layerType === 'footprint') {
      setCurrentFootprintThreshold(prev => {
        const factor = type === 'increase' ? 1.1 : 0.9;
        return Math.max(minFootprintThreshold, Math.min(0.8, prev * factor));
      });
    } else if (layerType === 'pm25') {
      setCurrentPm25Threshold(prev => {
        const factor = type === 'increase' ? 1.1 : 0.9;
        return Math.max(minPm25Threshold, prev * factor);
      });
    }
  }, [layerType, minFootprintThreshold, minPm25Threshold]);

  return (
    <>
      <div ref={mapContainer} style={style} />
      
      {/* Map UI Components */}
      <MapHeader 
        selectedLocation={selectedLocation} 
        isPlaying={isPlaying}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
      />
      
      <MapMarkerManager
        map={map}
        locations={locations}
        selectedLocation={selectedLocation}
        onLocationSelect={handleLocationSelect}
      />

      <MapLayerManager
        map={map}
        selectedLocation={selectedLocation}
        layerType={layerType}
        currentDate={currentDate}
        currentFootprintThreshold={currentFootprintThreshold}
        currentPm25Threshold={currentPm25Threshold}
        dataLoadAttempt={dataLoadAttempt}
      />

      {selectedLocation && (
        <>
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

          <MapLegend
            selectedLocation={selectedLocation}
            layerType={layerType}
            currentFootprintThreshold={currentFootprintThreshold}
            currentPm25Threshold={currentPm25Threshold}
          />

          <ZoomControls
            currentZoom={currentZoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
          />

          <AnimationButton
            isPlaying={isPlaying}
            onClick={toggleAnimation}
            disabled={!selectedLocation}
          />
        </>
      )}
    </>
  );
};

export default React.memo(MultiLocationMapboxRefactored);