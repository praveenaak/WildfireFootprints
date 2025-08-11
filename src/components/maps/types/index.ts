import mapboxgl from 'mapbox-gl';

export interface Location {
  lat: number;
  lng: number;
  tilesetId: string;
  layerName: string;
  name: string;
  date?: string;
  hasTimeSeriesData?: boolean;
}


export interface MultiLocationMapboxProps {
  accessToken?: string;
  center: [number, number];
  zoom: number;
  style?: React.CSSProperties;
  minFootprintThreshold?: number;
  minPm25Threshold?: number;
  timestamp?: string;
  locations?: Location[];
}

export type LayerType = 'footprint' | 'pm25' | 'combined';

export interface DataRange {
  min: number;
  max: number;
}

export interface LocationDataRanges {
  [key: string]: {
    footprint: DataRange;
    pm25: DataRange;
  };
}

export interface MarkerRef {
  marker: mapboxgl.Marker;
  element: HTMLDivElement;
  location: Location;
}

export interface SelectedLocation {
  footprint: number;
  pm25: number;
  longitude: number;
  latitude: number;
}

export interface MapControlsProps {
  selectedLocation: Location | null;
  layerType: LayerType;
  setLayerType: (type: LayerType) => void;
  currentFootprintThreshold: number;
  currentPm25Threshold: number;
  adjustThreshold: (type: 'increase' | 'decrease') => void;
  isPlaying: boolean;
  toggleAnimation: () => void;
  currentDate: string;
  onBackClick: () => void;
}
