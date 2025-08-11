import { useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { LayerType, Location } from '../types';
import {
  formatDateForFilter,
  isSpecialCoordinate,
  formatSpecialCoordinateTilesetId,
  formatSpecialCoordinateConvolvedTilesetId,
  getConvolvedLayerName,
  getSpecialCoordinatePartFunction,
  getSpecialCoordinateConvolvedPartFunction,
} from '../utils/mapUtils';
import { MAP_CONSTANTS } from '../../../constants/mapConstants';

interface UseMapLayersProps {
  map: React.MutableRefObject<mapboxgl.Map | null>;
  selectedLocation: Location | null;
  currentDate: string;
  currentFootprintThreshold: number;
  currentPm25Threshold: number;
}

export const useMapLayers = ({
  map,
  selectedLocation,
  currentDate,
  currentFootprintThreshold,
  currentPm25Threshold,
}: UseMapLayersProps) => {
  const getFootprintFilter = useCallback((dateString: string, threshold: number): any[] => {
    const formattedDate = formatDateForFilter(dateString);
    return ['all', ['>', ['get', 'value'], threshold], ['==', ['get', 'date'], formattedDate]];
  }, []);

  const getPm25Filter = useCallback((dateString: string, threshold: number): any[] => {
    const formattedDate = formatDateForFilter(dateString);
    return ['all', ['>', ['get', 'pm25_value'], threshold], ['==', ['get', 'date'], formattedDate]];
  }, []);

  const loadFootprintLayer = useCallback(() => {
    if (!map.current || !selectedLocation) return;

    const mapInstance = map.current;

    // Remove existing layers
    if (mapInstance.getLayer(MAP_CONSTANTS.LAYER_IDS.FOOTPRINT)) {
      mapInstance.removeLayer(MAP_CONSTANTS.LAYER_IDS.FOOTPRINT);
    }
    if (mapInstance.getSource('footprint-source')) {
      mapInstance.removeSource('footprint-source');
    }

    // Add new footprint layer - need to determine part number from date
    const isSpecial = isSpecialCoordinate(selectedLocation.lng, selectedLocation.lat);
    let tilesetId = 'your-default-tileset-id';

    if (isSpecial) {
      const partFunction = getSpecialCoordinatePartFunction(
        selectedLocation.lng,
        selectedLocation.lat
      );
      const partString = partFunction(currentDate); // Returns 'p1', 'p2', etc.
      const partNum = parseInt(partString.substring(1), 10); // Extract number from 'p1'
      tilesetId = formatSpecialCoordinateTilesetId(
        selectedLocation.lng,
        selectedLocation.lat,
        partNum
      );
    }

    mapInstance.addSource('footprint-source', {
      type: 'vector',
      url: `mapbox://${tilesetId}`,
    });

    mapInstance.addLayer({
      id: MAP_CONSTANTS.LAYER_IDS.FOOTPRINT,
      type: 'fill',
      source: 'footprint-source',
      'source-layer': 'your-source-layer',
      paint: {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'value'],
          0,
          'rgba(117, 29, 12, 0.1)',
          0.5,
          'rgba(117, 29, 12, 0.5)',
          1,
          'rgba(117, 29, 12, 0.9)',
        ],
        'fill-opacity': 0.8,
      },
      filter: getFootprintFilter(currentDate, currentFootprintThreshold),
    });
  }, [map, selectedLocation, currentDate, currentFootprintThreshold, getFootprintFilter]);

  const loadPm25Layer = useCallback(() => {
    if (!map.current || !selectedLocation) return;

    const mapInstance = map.current;

    // Remove existing layers
    if (mapInstance.getLayer(MAP_CONSTANTS.LAYER_IDS.PM25)) {
      mapInstance.removeLayer(MAP_CONSTANTS.LAYER_IDS.PM25);
    }
    if (mapInstance.getSource('pm25-source')) {
      mapInstance.removeSource('pm25-source');
    }

    // Add new PM2.5 layer - need to determine part number from date
    const isSpecial = isSpecialCoordinate(selectedLocation.lng, selectedLocation.lat);
    let tilesetId = 'your-default-convolved-tileset-id';
    let sourceLayerName = 'default-layer';

    if (isSpecial) {
      const convolvedPartFunction = getSpecialCoordinateConvolvedPartFunction(
        selectedLocation.lng,
        selectedLocation.lat
      );
      const partString = convolvedPartFunction(currentDate); // Returns 'p1', 'p2', etc.
      const partNum = parseInt(partString.substring(1), 10); // Extract number from 'p1'
      tilesetId = formatSpecialCoordinateConvolvedTilesetId(
        selectedLocation.lng,
        selectedLocation.lat,
        partNum
      );
      sourceLayerName = getConvolvedLayerName(selectedLocation.lng, selectedLocation.lat, partNum);
    }

    mapInstance.addSource('pm25-source', {
      type: 'vector',
      url: `mapbox://${tilesetId}`,
    });

    mapInstance.addLayer({
      id: MAP_CONSTANTS.LAYER_IDS.PM25,
      type: 'fill',
      source: 'pm25-source',
      'source-layer': sourceLayerName,
      paint: {
        'fill-color': [
          'interpolate',
          ['linear'],
          ['get', 'pm25_value'],
          0,
          'rgba(45, 89, 84, 0.1)',
          50,
          'rgba(45, 89, 84, 0.5)',
          100,
          'rgba(221, 59, 0, 0.9)',
        ],
        'fill-opacity': 0.8,
      },
      filter: getPm25Filter(currentDate, currentPm25Threshold),
    });
  }, [map, selectedLocation, currentDate, currentPm25Threshold, getPm25Filter]);

  const updateLayerFilters = useCallback(
    (layerType: LayerType) => {
      if (!map.current) return;

      const mapInstance = map.current;

      if (layerType === 'footprint' && mapInstance.getLayer(MAP_CONSTANTS.LAYER_IDS.FOOTPRINT)) {
        const filter = getFootprintFilter(currentDate, currentFootprintThreshold);
        mapInstance.setFilter(MAP_CONSTANTS.LAYER_IDS.FOOTPRINT, filter);
      }

      if (layerType === 'pm25' && mapInstance.getLayer(MAP_CONSTANTS.LAYER_IDS.PM25)) {
        const filter = getPm25Filter(currentDate, currentPm25Threshold);
        mapInstance.setFilter(MAP_CONSTANTS.LAYER_IDS.PM25, filter);
      }
    },
    [
      map,
      currentDate,
      currentFootprintThreshold,
      currentPm25Threshold,
      getFootprintFilter,
      getPm25Filter,
    ]
  );

  return {
    loadFootprintLayer,
    loadPm25Layer,
    updateLayerFilters,
  };
};
