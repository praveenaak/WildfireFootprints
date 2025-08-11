import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import mapboxgl from 'mapbox-gl';
import { Location, LayerType } from '../types';

// Map State Interface
export interface MapState {
  // Map instance and UI state
  map: mapboxgl.Map | null;
  currentZoom: number;
  isLoading: boolean;
  error: string | null;
  
  // Location and layer state
  locations: Location[];
  selectedLocation: Location | null;
  layerType: LayerType;
  
  // Threshold state
  currentFootprintThreshold: number;
  currentPm25Threshold: number;
  minFootprintThreshold: number;
  minPm25Threshold: number;
  
  // Animation state
  isPlaying: boolean;
  currentDate: string;
  
  // Utility state
  dataLoadAttempt: number;
}

// Map Actions
export type MapAction =
  | { type: 'SET_MAP'; payload: mapboxgl.Map }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOCATIONS'; payload: Location[] }
  | { type: 'SELECT_LOCATION'; payload: Location | null }
  | { type: 'SET_LAYER_TYPE'; payload: LayerType }
  | { type: 'SET_FOOTPRINT_THRESHOLD'; payload: number }
  | { type: 'SET_PM25_THRESHOLD'; payload: number }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_CURRENT_DATE'; payload: string }
  | { type: 'INCREMENT_DATA_LOAD_ATTEMPT' }
  | { type: 'ADJUST_THRESHOLD'; payload: { type: 'footprint' | 'pm25'; direction: 'increase' | 'decrease' } }
  | { type: 'RESET_MAP_STATE' };

// Initial State
const initialState: MapState = {
  map: null,
  currentZoom: 4.5,
  isLoading: false,
  error: null,
  locations: [],
  selectedLocation: null,
  layerType: 'footprint',
  currentFootprintThreshold: 1e-7,
  currentPm25Threshold: 0,
  minFootprintThreshold: 1e-7,
  minPm25Threshold: 0,
  isPlaying: false,
  currentDate: '20160801',
  dataLoadAttempt: 0,
};

// Reducer
function mapReducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case 'SET_MAP':
      return { ...state, map: action.payload };
    
    case 'SET_ZOOM':
      return { ...state, currentZoom: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_LOCATIONS':
      return { ...state, locations: action.payload };
    
    case 'SELECT_LOCATION':
      return { 
        ...state, 
        selectedLocation: action.payload,
        // Reset animation when selecting new location
        isPlaying: false,
        currentDate: '20160801'
      };
    
    case 'SET_LAYER_TYPE':
      return { ...state, layerType: action.payload };
    
    case 'SET_FOOTPRINT_THRESHOLD':
      return { ...state, currentFootprintThreshold: action.payload };
    
    case 'SET_PM25_THRESHOLD':
      return { ...state, currentPm25Threshold: action.payload };
    
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    
    case 'SET_CURRENT_DATE':
      return { ...state, currentDate: action.payload };
    
    case 'INCREMENT_DATA_LOAD_ATTEMPT':
      return { ...state, dataLoadAttempt: state.dataLoadAttempt + 1 };
    
    case 'ADJUST_THRESHOLD':
      if (action.payload.type === 'footprint') {
        const factor = action.payload.direction === 'increase' ? 1.1 : 0.9;
        const newThreshold = Math.max(
          state.minFootprintThreshold, 
          Math.min(0.8, state.currentFootprintThreshold * factor)
        );
        return { ...state, currentFootprintThreshold: newThreshold };
      } else {
        const factor = action.payload.direction === 'increase' ? 1.1 : 0.9;
        const newThreshold = Math.max(
          state.minPm25Threshold, 
          state.currentPm25Threshold * factor
        );
        return { ...state, currentPm25Threshold: newThreshold };
      }
    
    case 'RESET_MAP_STATE':
      return {
        ...initialState,
        map: state.map, // Keep the map instance
        locations: state.locations, // Keep loaded locations
      };
    
    default:
      return state;
  }
}

// Context Types
interface MapContextType {
  state: MapState;
  dispatch: React.Dispatch<MapAction>;
  
  // Convenience action creators
  setMap: (map: mapboxgl.Map) => void;
  setZoom: (zoom: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLocations: (locations: Location[]) => void;
  selectLocation: (location: Location | null) => void;
  setLayerType: (layerType: LayerType) => void;
  setFootprintThreshold: (threshold: number) => void;
  setPm25Threshold: (threshold: number) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentDate: (date: string) => void;
  incrementDataLoadAttempt: () => void;
  adjustThreshold: (type: 'footprint' | 'pm25', direction: 'increase' | 'decrease') => void;
  resetMapState: () => void;
}

// Create Context
const MapContext = createContext<MapContextType | null>(null);

// Provider Props
interface MapProviderProps {
  children: ReactNode;
  initialConfig?: Partial<MapState>;
}

// Provider Component
export const MapProvider: React.FC<MapProviderProps> = ({ 
  children, 
  initialConfig = {} 
}) => {
  const [state, dispatch] = useReducer(mapReducer, {
    ...initialState,
    ...initialConfig
  });

  // Action creators
  const setMap = useCallback((map: mapboxgl.Map) => {
    dispatch({ type: 'SET_MAP', payload: map });
  }, []);

  const setZoom = useCallback((zoom: number) => {
    dispatch({ type: 'SET_ZOOM', payload: zoom });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setLocations = useCallback((locations: Location[]) => {
    dispatch({ type: 'SET_LOCATIONS', payload: locations });
  }, []);

  const selectLocation = useCallback((location: Location | null) => {
    dispatch({ type: 'SELECT_LOCATION', payload: location });
  }, []);

  const setLayerType = useCallback((layerType: LayerType) => {
    dispatch({ type: 'SET_LAYER_TYPE', payload: layerType });
  }, []);

  const setFootprintThreshold = useCallback((threshold: number) => {
    dispatch({ type: 'SET_FOOTPRINT_THRESHOLD', payload: threshold });
  }, []);

  const setPm25Threshold = useCallback((threshold: number) => {
    dispatch({ type: 'SET_PM25_THRESHOLD', payload: threshold });
  }, []);

  const setPlaying = useCallback((playing: boolean) => {
    dispatch({ type: 'SET_PLAYING', payload: playing });
  }, []);

  const setCurrentDate = useCallback((date: string) => {
    dispatch({ type: 'SET_CURRENT_DATE', payload: date });
  }, []);

  const incrementDataLoadAttempt = useCallback(() => {
    dispatch({ type: 'INCREMENT_DATA_LOAD_ATTEMPT' });
  }, []);

  const adjustThreshold = useCallback((type: 'footprint' | 'pm25', direction: 'increase' | 'decrease') => {
    dispatch({ type: 'ADJUST_THRESHOLD', payload: { type, direction } });
  }, []);

  const resetMapState = useCallback(() => {
    dispatch({ type: 'RESET_MAP_STATE' });
  }, []);

  const contextValue: MapContextType = {
    state,
    dispatch,
    setMap,
    setZoom,
    setLoading,
    setError,
    setLocations,
    selectLocation,
    setLayerType,
    setFootprintThreshold,
    setPm25Threshold,
    setPlaying,
    setCurrentDate,
    incrementDataLoadAttempt,
    adjustThreshold,
    resetMapState,
  };

  return (
    <MapContext.Provider value={contextValue}>
      {children}
    </MapContext.Provider>
  );
};

// Custom hook to use MapContext
export const useMapContext = (): MapContextType => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
};

// Selector hooks for specific state slices
export const useMapState = () => {
  const { state } = useMapContext();
  return state;
};

export const useMapActions = () => {
  const context = useMapContext();
  return {
    setMap: context.setMap,
    setZoom: context.setZoom,
    setLoading: context.setLoading,
    setError: context.setError,
    setLocations: context.setLocations,
    selectLocation: context.selectLocation,
    setLayerType: context.setLayerType,
    setFootprintThreshold: context.setFootprintThreshold,
    setPm25Threshold: context.setPm25Threshold,
    setPlaying: context.setPlaying,
    setCurrentDate: context.setCurrentDate,
    incrementDataLoadAttempt: context.incrementDataLoadAttempt,
    adjustThreshold: context.adjustThreshold,
    resetMapState: context.resetMapState,
  };
};

// Specific selector hooks
export const useSelectedLocation = () => {
  const { state } = useMapContext();
  return state.selectedLocation;
};

export const useLayerType = () => {
  const { state } = useMapContext();
  return state.layerType;
};

export const useMapInstance = () => {
  const { state } = useMapContext();
  return state.map;
};

export const useAnimationState = () => {
  const { state } = useMapContext();
  return {
    isPlaying: state.isPlaying,
    currentDate: state.currentDate,
  };
};

export const useThresholds = () => {
  const { state } = useMapContext();
  return {
    footprintThreshold: state.currentFootprintThreshold,
    pm25Threshold: state.currentPm25Threshold,
    minFootprintThreshold: state.minFootprintThreshold,
    minPm25Threshold: state.minPm25Threshold,
  };
};