import React, { useEffect, useCallback } from 'react';
import {
  formatDateForFilter,
  determineFootprintCoordinate,
  isSpecialCoordinate,
  getSpecialCoordinatePartFunction,
  getSpecialCoordinateConvolvedPartFunction,
  formatSpecialCoordinateTilesetId,
  formatSpecialCoordinateConvolvedTilesetId,
  getConvolvedLayerName,
} from '../utils/mapUtils';
import { 
  useMapInstance, 
  useSelectedLocation, 
  useLayerType, 
  useThresholds, 
  useAnimationState,
  useMapState 
} from '../context/MapContext';

const getFootprintFilter = (dateString: string, threshold: number): any[] => {
  const formattedDate = formatDateForFilter(dateString);

  const filter = [
    'all',
    ['>', ['get', 'value'], threshold],
    ['==', ['get', 'date'], formattedDate],
  ];

  return filter;
};

const getPm25Filter = (dateString: string, threshold: number): any[] => {
  const formattedDate = formatDateForFilter(dateString);

  const filter = [
    'all',
    ['>', ['get', 'value'], threshold],
    ['==', ['get', 'date'], formattedDate],
  ];

  return filter;
};

export const MapLayerManagerWithContext: React.FC = React.memo(() => {
  const map = useMapInstance();
  const selectedLocation = useSelectedLocation();
  const layerType = useLayerType();
  const { currentDate } = useAnimationState();
  const { footprintThreshold, pm25Threshold } = useThresholds();
  const { dataLoadAttempt } = useMapState();

  const loadFootprintLayer = useCallback(() => {
    if (!map || !selectedLocation) return;

    console.log('Loading footprint layer for:', selectedLocation);

    if (map.getLayer('footprint-layer')) {
      map.removeLayer('footprint-layer');
    }

    if (map.getSource('footprint-data')) {
      map.removeSource('footprint-data');
    }

    let footprintTilesetId: string;

    if (isSpecialCoordinate(selectedLocation.lng, selectedLocation.lat)) {
      const partFunction = getSpecialCoordinatePartFunction(
        selectedLocation.lng,
        selectedLocation.lat
      );
      const partString = partFunction(currentDate);
      const partNum = parseInt(partString.substring(1), 10); // Convert 'p1' to 1
      footprintTilesetId = formatSpecialCoordinateTilesetId(
        selectedLocation.lng,
        selectedLocation.lat,
        partNum
      );
    } else {
      // For non-special coordinates, use the location's tilesetId from parsing
      // This is a simplified approach - in the real implementation, you'd need proper coordinate mapping
      const formattedLng = Math.abs(selectedLocation.lng).toString().replace('.', '_');
      const formattedLat = selectedLocation.lat.toString().replace('.', '_');
      const datePart = determineFootprintCoordinate(currentDate);
      footprintTilesetId = `_${formattedLng}_${formattedLat}_f_16_20_${datePart}`;
    }

    const footprintSourceUrl = `mapbox://pkulandh.${footprintTilesetId}`;

    map.addSource('footprint-data', {
      type: 'vector',
      url: footprintSourceUrl,
    });

    const footprintFilter = getFootprintFilter(currentDate, footprintThreshold);

    map.addLayer({
      id: 'footprint-layer',
      type: 'fill',
      source: 'footprint-data',
      'source-layer': footprintTilesetId,
      filter: footprintFilter,
      paint: {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'value'],
          0, '#FFE6E0',
          0.1, '#FFCDC4',
          0.2, '#F7A597',
          0.3, '#EE7D6A',
          0.4, '#D6553E',
          1.0, '#B32D16',
        ],
        'fill-opacity': 0.6,
      },
    });
  }, [map, selectedLocation, currentDate, footprintThreshold]);

  const loadPm25Layer = useCallback(() => {
    if (!map || !selectedLocation) return;

    console.log('Loading PM2.5 layer for:', selectedLocation);

    if (map.getLayer('pm25-layer')) {
      map.removeLayer('pm25-layer');
    }

    if (map.getSource('pm25-data')) {
      map.removeSource('pm25-data');
    }

    let pm25TilesetId: string;

    if (isSpecialCoordinate(selectedLocation.lng, selectedLocation.lat)) {
      const convolvedPartFunction = getSpecialCoordinateConvolvedPartFunction(
        selectedLocation.lng,
        selectedLocation.lat
      );
      const partString = convolvedPartFunction(currentDate);
      const partNum = parseInt(partString.substring(1), 10); // Convert 'p1' to 1  
      pm25TilesetId = formatSpecialCoordinateConvolvedTilesetId(
        selectedLocation.lng,
        selectedLocation.lat,
        partNum
      );
    } else {
      const datePart = determineFootprintCoordinate(currentDate);
      const partNum = parseInt(datePart.substring(1), 10); // Convert 'p1' to 1
      pm25TilesetId = getConvolvedLayerName(selectedLocation.lng, selectedLocation.lat, partNum);
    }

    const pm25SourceUrl = `mapbox://pkulandh.${pm25TilesetId}`;

    map.addSource('pm25-data', {
      type: 'vector',
      url: pm25SourceUrl,
    });

    const pm25Filter = getPm25Filter(currentDate, pm25Threshold);

    map.addLayer({
      id: 'pm25-layer',
      type: 'fill',
      source: 'pm25-data',
      'source-layer': pm25TilesetId,
      filter: pm25Filter,
      paint: {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'value'],
          0, '#c8f2d5',
          12.1, '#73d13d',
          35.5, '#faad14',
          55.5, '#ff7a45',
          150.5, '#f5222d',
          250, '#a8071a',
        ],
        'fill-opacity': 0.6,
      },
    });
  }, [map, selectedLocation, currentDate, pm25Threshold]);

  const cleanupLayers = useCallback(() => {
    if (!map) return;

    // Clean up existing layers
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
  }, [map]);

  useEffect(() => {
    if (!selectedLocation) {
      cleanupLayers();
      return;
    }

    if (layerType === 'footprint') {
      loadFootprintLayer();
    } else if (layerType === 'pm25') {
      loadPm25Layer();
    } else if (layerType === 'combined') {
      loadFootprintLayer();
      loadPm25Layer();
    }

    // Cleanup on unmount
    return cleanupLayers;
  }, [
    selectedLocation, 
    layerType, 
    currentDate, 
    footprintThreshold, 
    pm25Threshold, 
    loadFootprintLayer, 
    loadPm25Layer, 
    cleanupLayers,
    dataLoadAttempt
  ]);

  return null;
});

MapLayerManagerWithContext.displayName = 'MapLayerManagerWithContext';