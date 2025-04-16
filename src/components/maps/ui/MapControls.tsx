import React from 'react';
import { LayerType, Location } from '../types';
import { formatDate } from '../utils/mapUtils';

interface MapControlsProps {
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

// Map controls component
export const MapControls: React.FC<MapControlsProps> = ({
  selectedLocation,
  layerType,
  setLayerType,
  currentFootprintThreshold,
  currentPm25Threshold,
  adjustThreshold,
  isPlaying,
  toggleAnimation,
  currentDate,
  onBackClick,
}) => {
  const isTimeSeriesLocation = selectedLocation?.lng === -101.8504 && selectedLocation?.lat === 33.59076;

  // Convert threshold to log scale for slider
  const logScale = (value: number) => Math.log10(value);
  const inverseLogScale = (value: number) => Math.pow(10, value);
  
  // Min and max values for the footprint threshold
  const minThreshold = 0.0001;
  const maxThreshold = 0.04;
  
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = inverseLogScale(parseFloat(event.target.value));
    // Call adjustThreshold with increase/decrease based on whether the new value is higher/lower
    if (newValue > currentFootprintThreshold) {
      adjustThreshold('increase');
    } else {
      adjustThreshold('decrease');
    }
  };

  return (
    <div style={{ 
      position: 'absolute', 
      top: '20px', 
      left: '20px', 
      zIndex: 1,
      padding: '16px',
      borderRadius: '12px',
      color: '#16182d',
      maxWidth: '320px',
      fontFamily: "'Sora', sans-serif"
    }}>
      <button 
        onClick={onBackClick}
        style={{ 
          width: '100%',
          padding: '12px 0',
          backgroundColor: '#f8f9fa',
          color: '#16182d',
          border: '1px solid #751d0c',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: 'pointer',
          fontSize: '14px',
          transition: 'all 0.2s ease',
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontFamily: "'Sora', sans-serif"
        }}
      >
        <span style={{ fontSize: '18px' }}>↩</span> Back to All Locations
      </button>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <button 
          onClick={() => setLayerType('footprint')}
          style={{ 
            flex: 1,
            fontWeight: '600',
            padding: '12px 0',
            backgroundColor: layerType === 'footprint' ? '#f8f9fa' : '#ffffff',
            color: '#16182d',
            border: '1px solid #751d0c',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: "'Sora', sans-serif"
          }}
        >
          Footprint Data
        </button>
        <button 
          onClick={() => setLayerType('pm25')}
          style={{ 
            flex: 1,
            fontWeight: '600',
            padding: '12px 0',
            backgroundColor: layerType === 'pm25' ? '#f8f9fa' : '#ffffff',
            color: '#16182d',
            border: '1px solid #751d0c',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: "'Sora', sans-serif"
          }}
        >
          Convolved
        </button>
      </div>

      <div style={{ 
        marginBottom: '16px', 
        padding: '14px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        border: '1px solid #751d0c',
        color: '#16182d',
        fontFamily: "'Sora', sans-serif"
      }}>
        {layerType === 'footprint' ? (
          <>
            <p style={{ margin: '0', fontSize: '14px', fontWeight: '500', color: '#16182d', fontFamily: "'Sora', sans-serif" }}>
              Footprint Threshold: {currentFootprintThreshold.toExponential(4)}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="range"
                min={logScale(minThreshold)}
                max={logScale(maxThreshold)}
                step="0.1"
                value={logScale(currentFootprintThreshold)}
                onChange={handleSliderChange}
                style={{
                  width: '100%',
                  accentColor: '#751d0c',
                  borderRadius: '4px',
                  height: '6px',
                  cursor: 'pointer'
                }}
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '12px', 
                color: '#16182d',
                fontFamily: "'Sora', sans-serif"
              }}>
                <span>{minThreshold.toExponential(4)}</span>
                <span>{maxThreshold.toExponential(4)}</span>
              </div>
            </div>
          </>
        ) : (
          <p style={{ margin: '0', fontSize: '14px', fontWeight: '500', textAlign: 'center', color: '#16182d', fontFamily: "'Sora', sans-serif" }}>
            Showing PM2.5 in Convolved
          </p>
        )}
      </div>

      {isTimeSeriesLocation && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            marginBottom: '10px',
            padding: '10px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid #751d0c',
            color: '#16182d',
            fontFamily: "'Sora', sans-serif"
          }}>
            <strong>Current Date:</strong> 
            <span>
              {formatDate(currentDate)}
              {isPlaying && <span style={{ marginLeft: '8px', color: '#ff6700' }}>●</span>}
            </span>
          </div>
          <button
            onClick={toggleAnimation}
            style={{
              width: '100%',
              padding: '10px 16px',
              backgroundColor: '#f8f9fa',
              color: '#16182d',
              border: '1px solid #751d0c',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: '600',
              fontSize: '14px',
              fontFamily: "'Sora', sans-serif"
            }}
          >
            {isPlaying ? (
              <>
                <span style={{ fontSize: '16px' }}>⏸</span> Pause Animation
              </>
            ) : (
              <>
                <span style={{ fontSize: '16px' }}>▶</span> Play Animation
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}; 