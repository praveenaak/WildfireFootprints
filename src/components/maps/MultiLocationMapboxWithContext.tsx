import React, { useCallback, useEffect } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_CONFIG } from '../../config/mapbox';
import { formatInitialDate } from './utils/mapUtils';
import { useMapAnimation } from './hooks/useMapAnimation';
import { useMapInitializationWithContext } from './hooks/useMapInitializationWithContext';
import { 
  MapProvider,
  useMapState,
  useMapActions,
  useSelectedLocation,
  useAnimationState,
  useMapInstance,
} from './context/MapContext';
import { 
  MapControlsWithContext,
  MapLegendWithContext,
  MapHeaderWithContext,
  ZoomControlsWithContext,
  AnimationButtonWithContext,
  MapLayerManagerWithContext,
  MapMarkerManagerWithContext,
} from './ui';
import { MultiLocationMapboxProps } from './types';

// Internal component that uses context
const MultiLocationMapboxInner: React.FC<MultiLocationMapboxProps> = ({
  accessToken = MAPBOX_CONFIG.accessToken,
  center,
  zoom,
  style = { width: '100%', height: '100vh' },
  timestamp = '08-25-2016 00:00',
}) => {
  const { isLoading, error } = useMapState();
  const selectedLocation = useSelectedLocation();
  const { isPlaying, currentDate } = useAnimationState();
  const map = useMapInstance();
  const { selectLocation, setCurrentDate, resetMapState } = useMapActions();

  // Initialize map with context
  const {
    mapContainer,
    flyToLocation,
    flyToCenter,
  } = useMapInitializationWithContext({
    accessToken,
    center,
    zoom,
    style,
  });

  // Set up animation
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
    setIsPlaying: (playing) => {},
    currentDate,
    setCurrentDate,
    selectedLocation,
    map: { current: map },
    currentFootprintThreshold: 1e-7,
    addTimestampIndicator,
  });

  // Initialize date from timestamp prop
  useEffect(() => {
    const initialDate = formatInitialDate(timestamp);
    setCurrentDate(initialDate);
  }, [timestamp, setCurrentDate]);

  // Handle location selection with context
  const handleLocationSelect = useCallback(
    (location: any) => {
      selectLocation(location);
      flyToLocation([location.lng, location.lat]);
    },
    [selectLocation, flyToLocation]
  );

  // Handle back to all locations
  const handleBackClick = useCallback(() => {
    resetMapState();
    flyToCenter();
  }, [resetMapState, flyToCenter]);

  // Add effect to handle location selection change
  useEffect(() => {
    if (selectedLocation) {
      setCurrentDate('20160801');
    }
  }, [selectedLocation, setCurrentDate]);

  if (isLoading) {
    return (
      <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading map...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Error: {error}</div>
      </div>
    );
  }

  return (
    <>
      <div ref={mapContainer} style={style} />
      
      {/* Always visible components */}
      <MapHeaderWithContext />
      <MapMarkerManagerWithContext />
      <MapLayerManagerWithContext />

      {/* Components visible when location is selected */}
      {selectedLocation && (
        <>
          <MapControlsWithContext onBackClick={handleBackClick} />
          <MapLegendWithContext />
          <ZoomControlsWithContext />
          <AnimationButtonWithContext />
        </>
      )}
    </>
  );
};

// Main component with provider wrapper
const MultiLocationMapboxWithContext: React.FC<MultiLocationMapboxProps> = (props) => {
  const {
    minFootprintThreshold = 1e-7,
    minPm25Threshold = 0,
    timestamp = '08-25-2016 00:00',
  } = props;

  const initialConfig = {
    minFootprintThreshold,
    minPm25Threshold,
    currentFootprintThreshold: minFootprintThreshold,
    currentPm25Threshold: minPm25Threshold,
    currentDate: formatInitialDate(timestamp),
  };

  return (
    <MapProvider initialConfig={initialConfig}>
      <MultiLocationMapboxInner {...props} />
    </MapProvider>
  );
};

export default React.memo(MultiLocationMapboxWithContext);