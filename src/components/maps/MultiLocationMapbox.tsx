import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_CONFIG } from '../../config/mapbox';
import {
  parseCoordinates,
  formatInitialDate,
  formatDateForFilter,
  determineFootprintCoordinate,
  isSpecialCoordinate,
  getSpecialCoordinatePartFunction,
  getSpecialCoordinateConvolvedPartFunction,
  formatSpecialCoordinateTilesetId,
  formatSpecialCoordinateConvolvedTilesetId,
  getConvolvedLayerName,
} from './utils/mapUtils';
import { useMapAnimation } from './hooks/useMapAnimation';
import { MapControls } from './ui/MapControls';
import { MapLegend } from './ui/MapLegend';
import { MapHeader } from './ui/MapHeader';
import { ZoomControls } from './ui/ZoomControls';
import { Location, LayerType, MarkerRef, MultiLocationMapboxProps } from './types';
import { colors } from '../../styles/theme';
import { createGlobalStyle } from 'styled-components';
import { 
  getMarkerConfig, 
  applyMarkerBaseStyles, 
  applyMarkerConfig 
} from './config/markerConfig';

const MarkerStyles = createGlobalStyle`
  .location-marker.marker-hover {
    filter: brightness(1.2);
    z-index: 20;
  }
`;

const getFootprintFilter = (dateString: string, threshold: number): any[] => {
  const formattedDate = formatDateForFilter(dateString);

  const filter = [
    'all',
    ['>', ['get', 'value'], threshold],
    ['==', ['get', 'date'], formattedDate],
  ];

  return filter;
};



const MultiLocationMapbox: React.FC<MultiLocationMapboxProps> = ({
  accessToken = MAPBOX_CONFIG.accessToken,
  center,
  zoom,
  style = { width: '100%', height: '100vh' },
  minFootprintThreshold = 1e-7,
  minPm25Threshold = 0,
  timestamp = '08-25-2016 00:00',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<MarkerRef[]>([]);
  const toggleAnimationRef = useRef<() => void>(() => {});
  const handleLocationSelectRef = useRef<((location: Location) => void) | null>(null);
  const selectedLocationRef = useRef<Location | null>(null);

  const [layerType, setLayerType] = useState<LayerType>('footprint');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [currentFootprintThreshold, setCurrentFootprintThreshold] = useState(minFootprintThreshold);
  const [currentPm25Threshold, setCurrentPm25Threshold] = useState(minPm25Threshold);
  const [currentZoom, setCurrentZoom] = useState<number>(zoom);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDate, setCurrentDate] = useState(formatInitialDate(timestamp));
  const [dataLoadAttempt, setDataLoadAttempt] = useState(0); // Force re-render counter

  const locations = parseCoordinates();

  const addTimestampIndicator = useCallback(() => {
    if (!map.current) return;

    const existingTimestamp = document.getElementById('map-timestamp');
    if (existingTimestamp) {
      existingTimestamp.remove();
    }

    const existingPauseButton = document.getElementById('pause-animation-button');
    if (existingPauseButton) {
      existingPauseButton.remove();
    }
  }, []);

  const { toggleAnimation } = useMapAnimation({
    isPlaying,
    setIsPlaying,
    currentDate,
    setCurrentDate,
    selectedLocation,
    map,
    currentFootprintThreshold,
    addTimestampIndicator,
  });



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

      if (map.current) {
        map.current.flyTo({
          center: [location.lng, location.lat],
          zoom: 4,
          essential: true,
          speed: 1.8,
          curve: 1,
          easing: t => t,
        });
      }
    },
    [isPlaying, selectedLocation]
  );

  useEffect(() => {
    toggleAnimationRef.current = toggleAnimation;
    handleLocationSelectRef.current = handleLocationSelect;
    selectedLocationRef.current = selectedLocation;
  }, [toggleAnimation, handleLocationSelect, selectedLocation]);

  const handleZoomIn = useCallback(() => {
    if (map.current) {
      map.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (map.current) {
      map.current.zoomOut();
    }
  }, []);

  const handleBackClick = useCallback(() => {
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

      map.current.flyTo({
        center: center,
        zoom: zoom,
        duration: 1000,
      });
    }

    setSelectedLocation(null);

    if (isPlaying) {
      setIsPlaying(false);
    }
  }, [center, zoom, isPlaying]);

  const adjustThreshold = useCallback(
    (type: 'increase' | 'decrease') => {
      if (layerType === 'footprint') {
        const newThreshold =
          type === 'increase' ? currentFootprintThreshold * 2 : currentFootprintThreshold / 2;

        setCurrentFootprintThreshold(newThreshold);

        if (map.current && map.current.getLayer('footprint-layer')) {
          const footprintFilter = getFootprintFilter(currentDate, newThreshold);
          map.current.setFilter('footprint-layer', footprintFilter);
        }
      } else {
        const newThreshold =
          type === 'increase' ? currentPm25Threshold * 2 : currentPm25Threshold / 2;

        setCurrentPm25Threshold(newThreshold);

        if (map.current && map.current.getLayer('pm25-layer')) {
          const formattedDateForFilter = formatDateForFilter(currentDate);
          const pm25Filter = [
            'all',
            ['>', ['get', 'pm25_value'], newThreshold],
            ['==', ['get', 'date'], formattedDateForFilter],
          ];
          map.current.setFilter('pm25-layer', pm25Filter);
        }
      }
    },
    [layerType, currentFootprintThreshold, currentPm25Threshold, currentDate]
  );

  const handleDateChange = useCallback(
    (newDate: string) => {
      if (isPlaying) {
        toggleAnimation();
      }

      setCurrentDate(newDate);

      if (map.current && selectedLocation) {
        const formattedDateForFilter = formatDateForFilter(newDate);

        let needsReload = false;

        let currentPart = '';
        if (map.current.getLayer('footprint-layer')) {
          const sourceLayer = (map.current.getLayer('footprint-layer') as any)['source-layer'];
          if (sourceLayer && sourceLayer.includes('_p')) {
            currentPart = sourceLayer.substring(sourceLayer.lastIndexOf('_p') + 1);
          }

          const partFunction = getSpecialCoordinatePartFunction(
            selectedLocation.lng,
            selectedLocation.lat
          );
          const newPart = partFunction(newDate);

          if (currentPart !== newPart.substring(1)) {
            needsReload = true;
          }
        } else if (map.current.getLayer('pm25-layer')) {
          const sourceLayer = (map.current.getLayer('pm25-layer') as any)['source-layer'];
          if (sourceLayer && sourceLayer.includes('_p')) {
            currentPart = sourceLayer.substring(sourceLayer.lastIndexOf('_p') + 1);
          }

          const convolvedPartFunction = getSpecialCoordinateConvolvedPartFunction(
            selectedLocation.lng,
            selectedLocation.lat
          );
          const newPart = convolvedPartFunction(newDate);

          if (currentPart !== newPart.substring(1)) {
            needsReload = true;
          }
        }

        if (needsReload) {
          console.log('Date change requires part change, reloading data');
          setDataLoadAttempt(prev => prev + 1);
          return;
        }

        if (map.current.getLayer('footprint-layer')) {
          const footprintFilter = getFootprintFilter(newDate, currentFootprintThreshold);

          map.current.setFilter('footprint-layer', footprintFilter);
        }

        if (map.current.getLayer('pm25-layer')) {
          const pm25Filter = [
            'all',
            ['>', ['get', 'pm25_value'], currentPm25Threshold],
            ['==', ['get', 'date'], formattedDateForFilter],
          ];
          map.current.setFilter('pm25-layer', pm25Filter);
        }

        addTimestampIndicator();
      }
    },
    [
      isPlaying,
      toggleAnimation,
      selectedLocation,
      currentFootprintThreshold,
      currentPm25Threshold,
      addTimestampIndicator,
    ]
  );

  useEffect(() => {
    if (!mapContainer.current) return;

    if (map.current) {
      return;
    }

    mapboxgl.accessToken = accessToken;
    mapboxgl.accessToken = accessToken;

    while (mapContainer.current.firstChild) {
      mapContainer.current.removeChild(mapContainer.current.firstChild);
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_CONFIG.styleUrl,
      center: center,
      zoom: zoom,
      minZoom: 4,
      maxZoom: 6.1,
      fadeDuration: 0,
      interactive: true,
      trackResize: true,
    });

    map.current.on('zoom', () => {
      if (map.current) {
        setCurrentZoom(Math.round(map.current.getZoom() * 10) / 10);
      }
    });

    map.current.on('click', e => {
      const clickedOnMarker =
        e.originalEvent && (e.originalEvent.target as HTMLElement)?.closest('.location-marker');

      if (clickedOnMarker) {
        if (e.originalEvent) {
          e.originalEvent.preventDefault();
          e.originalEvent.stopPropagation();
        }
      }
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // Small delay to ensure map is fully rendered
      setTimeout(() => {
        if (!map.current) return;
        
        markersRef.current = [];

        locations.forEach(location => {
        const el = document.createElement('div');
        el.className = 'location-marker';
        el.setAttribute('data-location-name', location.name);
        
        // Apply base styles and unselected marker configuration
        applyMarkerBaseStyles(el);
        applyMarkerConfig(el, getMarkerConfig(false));
        
        // Ensure marker is visible and clickable
        el.style.display = 'block';
        el.style.visibility = 'visible';
        el.style.opacity = '1';

        const marker = new mapboxgl.Marker({
          element: el,
          anchor: 'bottom',
          offset: [0, 0],
          draggable: false,
          clickTolerance: 10,
        })
          .setLngLat([location.lng, location.lat])
          .addTo(map.current!);

        markersRef.current.push({
          marker,
          element: el,
          location,
        });

        const onMarkerClick = () => {
          // Allow selection when no marker is selected OR clicking on a different marker
          if (handleLocationSelectRef.current) {
            handleLocationSelectRef.current(location);
          }
        };

        el.addEventListener('click', (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          onMarkerClick();
        });

        // Add hover effects only when no marker is selected
        el.addEventListener('mouseenter', () => {
          if (!selectedLocationRef.current) {
            el.classList.add('marker-hover');
          }
        });

        el.addEventListener('mouseleave', () => {
          if (!selectedLocationRef.current) {
            el.classList.remove('marker-hover');
          }
        });

        marker.getElement().addEventListener('click', onMarkerClick);

        el.style.pointerEvents = 'auto';
        el.style.cursor = 'pointer';
      });

      addTimestampIndicator();
        }, 100); // Small delay to ensure proper marker setup
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, center, zoom]);

  useEffect(() => {
    addTimestampIndicator();
  }, [isPlaying, currentDate, addTimestampIndicator]);

  useEffect(() => {
    if (!map.current || !selectedLocation) return;

    if (!map.current.isStyleLoaded()) {
      const onStyleLoad = () => {
        loadLocationData();
      };

      map.current.once('style.load', onStyleLoad);

      return () => {
        if (map.current) {
          map.current.off('style.load', onStyleLoad);
        }
      };
    }

    loadLocationData();

    function loadLocationData() {
      if (!map.current || !selectedLocation) return;

      const savedCenter = map.current.getCenter();
      const savedZoom = map.current.getZoom();
      const savedBearing = map.current.getBearing();
      const savedPitch = map.current.getPitch();

      const isAnimationRunning = isPlaying;

      if (map.current.getLayer('footprint-layer')) {
        map.current.removeLayer('footprint-layer');
      }

      if (map.current.getLayer('pm25-layer')) {
        map.current.removeLayer('pm25-layer');
      }

      if (map.current.getSource('footprint-data')) {
        map.current.removeSource('footprint-data');
      }

      if (map.current.getSource('pm25-data')) {
        map.current.removeSource('pm25-data');
      }

      try {
        let sourceLayerName = selectedLocation.layerName; // Default layer name
        let tilesetIdToUse = selectedLocation.tilesetId;

        if (isSpecialCoordinate(selectedLocation.lng, selectedLocation.lat)) {
          if (layerType === 'combined') {
            const partFunction = getSpecialCoordinatePartFunction(
              selectedLocation.lng,
              selectedLocation.lat
            );
            const footprintPartSuffix = partFunction(currentDate);
            const footprintPartNum = parseInt(footprintPartSuffix.substring(1), 10);
            const footprintTilesetId = formatSpecialCoordinateTilesetId(
              selectedLocation.lng,
              selectedLocation.lat,
              footprintPartNum
            );
            const footprintSourceLayer = `part${footprintPartNum}`;

            const convolvedPartFunction = getSpecialCoordinateConvolvedPartFunction(
              selectedLocation.lng,
              selectedLocation.lat
            );
            const pm25PartSuffix = convolvedPartFunction(currentDate);
            const pm25PartNum = parseInt(pm25PartSuffix.substring(1), 10);
            const pm25TilesetId = formatSpecialCoordinateConvolvedTilesetId(
              selectedLocation.lng,
              selectedLocation.lat,
              pm25PartNum
            );
            const pm25SourceLayer = getConvolvedLayerName(
              selectedLocation.lng,
              selectedLocation.lat,
              pm25PartNum
            );

            map.current.addSource('footprint-data', {
              type: 'vector',
              url: `mapbox://${footprintTilesetId}`,
            });

            map.current.addSource('pm25-data', {
              type: 'vector',
              url: `mapbox://${pm25TilesetId}`,
            });

            map.current.addLayer({
              id: 'footprint-layer',
              type: 'circle',
              source: 'footprint-data',
              'source-layer': footprintSourceLayer,
              paint: {
                'circle-radius': [
                  'interpolate',
                  ['exponential', 2],
                  ['zoom'],
                  3,
                  30,
                  4,
                  25,
                  5,
                  20,
                  6,
                  18,
                  7,
                  15,
                  8,
                  12,
                ],
                'circle-color': [
                  'interpolate',
                  ['linear'],
                  ['get', 'value'],
                  1e-7,
                  colors.footprintScale[0],
                  1e-5,
                  colors.footprintScale[0],
                  1e-4,
                  colors.footprintScale[0],
                  1e-3,
                  colors.footprintScale[1],
                  1e-2,
                  colors.footprintScale[2],
                  1e-1,
                  colors.footprintScale[3],
                  5e-1,
                  colors.footprintScale[4],
                  8e-1,
                  colors.footprintScale[5],
                ],
                'circle-opacity': 0.9,
                'circle-blur': 1.2,
                'circle-stroke-width': 0,
              },
              layout: {
                visibility: 'visible',
              },
              filter: [
                'all',
                ['>', ['get', 'value'], currentFootprintThreshold],
                ['==', ['get', 'date'], formatDateForFilter(currentDate)],
              ],
            });

            map.current.addLayer({
              id: 'pm25-layer',
              type: 'circle',
              source: 'pm25-data',
              'source-layer': pm25SourceLayer,
              paint: {
                'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 8, 5, 12, 8, 16, 12, 14],
                'circle-color': [
                  'interpolate',
                  ['linear'],
                  ['get', 'pm25_value'],
                  0,
                  colors.pm25Scale[0],
                  12,
                  colors.pm25Scale[1],
                  35,
                  colors.pm25Scale[2],
                  55,
                  colors.pm25Scale[3],
                  75,
                  colors.pm25Scale[4],
                  100,
                  colors.pm25Scale[5],
                ],
                'circle-opacity': 0.95,
                'circle-blur': 0.3,
                'circle-stroke-width': 1.5,
                'circle-stroke-color': 'rgba(10, 10, 10, 0.8)',
              },
              layout: {
                visibility: 'visible',
              },
              filter: [
                'all',
                ['>', ['get', 'pm25_value'], currentPm25Threshold],
                ['==', ['get', 'date'], formatDateForFilter(currentDate)],
              ],
            });

            addTimestampIndicator();

            if (isAnimationRunning) {
              map.current.jumpTo({
                center: savedCenter,
                zoom: savedZoom,
                bearing: savedBearing,
                pitch: savedPitch,
              });
            }

            return; // Skip the rest of the function
          } else if (layerType === 'footprint') {
            const partFunction = getSpecialCoordinatePartFunction(
              selectedLocation.lng,
              selectedLocation.lat
            );
            const partSuffix = partFunction(currentDate);
            const partNum = parseInt(partSuffix.substring(1), 10);
            tilesetIdToUse = formatSpecialCoordinateTilesetId(
              selectedLocation.lng,
              selectedLocation.lat,
              partNum
            );
            sourceLayerName = `part${partNum}`;
          } else if (layerType === 'pm25') {
            const convolvedPartFunction = getSpecialCoordinateConvolvedPartFunction(
              selectedLocation.lng,
              selectedLocation.lat
            );
            const partSuffix = convolvedPartFunction(currentDate);
            const partNum = parseInt(partSuffix.substring(1), 10);
            tilesetIdToUse = formatSpecialCoordinateConvolvedTilesetId(
              selectedLocation.lng,
              selectedLocation.lat,
              partNum
            );
            sourceLayerName = getConvolvedLayerName(
              selectedLocation.lng,
              selectedLocation.lat,
              partNum
            );
          }
        } else {
          console.warn(
            'Fallback code for non-special coordinates reached - this should not happen'
          );
          const datePart = determineFootprintCoordinate(currentDate);
          const baseId = tilesetIdToUse.replace('_p1', '').replace('_p2', '').replace('_p3', '');
          tilesetIdToUse = `${baseId}_${datePart}`;
          sourceLayerName = `${datePart}`;
        }

        map.current.addSource('footprint-data', {
          type: 'vector',
          url: `mapbox://${tilesetIdToUse}`,
        });

        map.current.addLayer({
          id: 'footprint-layer',
          type: 'circle',
          source: 'footprint-data',
          'source-layer': sourceLayerName,
          paint: {
            'circle-radius': [
              'interpolate',
              ['exponential', 2],
              ['zoom'],
              3,
              30,
              4,
              25,
              5,
              20,
              6,
              18,
              7,
              15,
              8,
              12,
            ],
            'circle-color': [
              'interpolate',
              ['linear'],
              ['get', 'value'],
              1e-7,
              colors.footprintScale[0],
              1e-5,
              colors.footprintScale[0],
              1e-4,
              colors.footprintScale[0],
              1e-3,
              colors.footprintScale[1],
              1e-2,
              colors.footprintScale[2],
              1e-1,
              colors.footprintScale[3],
              5e-1,
              colors.footprintScale[4],
              8e-1,
              colors.footprintScale[5],
            ],
            'circle-opacity': 0.9,
            'circle-blur': 1.2,
            'circle-stroke-width': 0,
          },
          layout: {
            visibility: layerType === 'footprint' || layerType === 'combined' ? 'visible' : 'none',
          },
          filter: getFootprintFilter(currentDate, currentFootprintThreshold),
        });

        map.current.addLayer({
          id: 'pm25-layer',
          type: 'circle',
          source: 'footprint-data',
          'source-layer': sourceLayerName,
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 8, 5, 12, 8, 16, 12, 14],
            'circle-color': [
              'interpolate',
              ['linear'],
              ['get', 'pm25_value'],
              0,
              colors.pm25Scale[0],
              12,
              colors.pm25Scale[1],
              35,
              colors.pm25Scale[2],
              55,
              colors.pm25Scale[3],
              75,
              colors.pm25Scale[4],
              100,
              colors.pm25Scale[5],
            ],
            'circle-opacity': 0.95,
            'circle-blur': 0.3,
            'circle-stroke-width': 1.5,
            'circle-stroke-color': 'rgba(10, 10, 10, 0.8)',
          },
          layout: {
            visibility: layerType === 'pm25' || layerType === 'combined' ? 'visible' : 'none',
          },
          filter: [
            'all',
            ['>', ['get', 'pm25_value'], currentPm25Threshold],
            ['==', ['get', 'date'], formatDateForFilter(currentDate)],
          ],
        });

        addTimestampIndicator();

        if (isAnimationRunning) {
          map.current.jumpTo({
            center: savedCenter,
            zoom: savedZoom,
            bearing: savedBearing,
            pitch: savedPitch,
          });
        }
      } catch (err) {
        console.error('Error loading location data:', err);
      }
    }
  }, [
    selectedLocation,
    layerType,
    currentFootprintThreshold,
    currentPm25Threshold,
    currentDate,
    addTimestampIndicator,
    dataLoadAttempt,
    isPlaying,
  ]);

  useEffect(() => {
    if (!markersRef.current.length) return;

    if (selectedLocation) {
      markersRef.current.forEach(({ marker, location }) => {
        if (location.lat === selectedLocation.lat && location.lng === selectedLocation.lng) {
          marker.remove();

          const el = document.createElement('div');
          el.className = 'location-marker location-marker-selected';
          el.setAttribute('data-location-name', location.name);
          
          // Apply base styles and selected marker configuration
          applyMarkerBaseStyles(el);
          applyMarkerConfig(el, getMarkerConfig(true));

          const newMarker = new mapboxgl.Marker({
            element: el,
            anchor: 'bottom',
            offset: [0, 0],
            draggable: false,
          })
            .setLngLat([location.lng, location.lat])
            .addTo(map.current!);

          markersRef.current = markersRef.current.map(item => {
            if (item.location.lat === location.lat && item.location.lng === location.lng) {
              return { ...item, marker: newMarker, element: el };
            }
            // Disable click interaction for other markers when one is selected
            item.element.style.cursor = 'default';
            item.element.style.pointerEvents = 'none';
            return item;
          });
        }
      });
    } else {
      markersRef.current.forEach(({ marker, location }) => {
        marker.remove();

        const el = document.createElement('div');
        el.className = 'location-marker';
        el.setAttribute('data-location-name', location.name);
        
        // Apply base styles and unselected marker configuration
        applyMarkerBaseStyles(el);
        applyMarkerConfig(el, getMarkerConfig(false));

        const newMarker = new mapboxgl.Marker({
          element: el,
          anchor: 'bottom',
          offset: [0, 0],
          draggable: false,
        })
          .setLngLat([location.lng, location.lat])
          .addTo(map.current!);

        const onMarkerClick = () => {
          handleLocationSelect(location);
        };

        el.addEventListener('click', (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          onMarkerClick();
        });

        newMarker.getElement().addEventListener('click', onMarkerClick);

        markersRef.current = markersRef.current.map(item => {
          if (item.location.lat === location.lat && item.location.lng === location.lng) {
            return { ...item, marker: newMarker, element: el };
          }
          // Re-enable click interaction for all markers when no selection
          item.element.style.cursor = 'pointer';
          item.element.style.pointerEvents = 'auto';
          return item;
        });
      });
    }
  }, [
    selectedLocation,
    handleLocationSelect,
  ]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MarkerStyles />
      <div ref={mapContainer} style={style} />

      <MapHeader
        selectedLocation={selectedLocation}
        isPlaying={isPlaying}
        currentDate={currentDate}
        setCurrentDate={handleDateChange}
      />

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

      <ZoomControls currentZoom={currentZoom} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />

      <MapLegend
        selectedLocation={selectedLocation}
        layerType={layerType}
        currentFootprintThreshold={currentFootprintThreshold}
        currentPm25Threshold={currentPm25Threshold}
      />

    </div>
  );
};

export default React.memo(MultiLocationMapbox);
