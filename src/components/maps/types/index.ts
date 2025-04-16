export interface Location {
  lat: number;
  lng: number;
  tilesetId: string;
  layerName: string;
  name: string;
  date?: string;
}

export interface MultiLocationMapboxProps {
  accessToken?: string;
  center: [number, number];
  zoom: number;
  style?: React.CSSProperties;
  minFootprintThreshold?: number;
  minPm25Threshold?: number;
  timestamp?: string;
}

export type LayerType = 'footprint' | 'pm25';

export interface DataRange {
  min: number;
  max: number;
}

export interface LocationDataRanges {
  [key: string]: {
    footprint: DataRange;
    pm25: DataRange;
  }
}

export interface MarkerRef {
  marker: mapboxgl.Marker;
  element: HTMLDivElement;
  location: Location;
} 