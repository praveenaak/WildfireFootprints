import React from 'react';
import { Location } from '../types';
import { formatDate } from '../utils/mapUtils';

interface MapHeaderProps {
  selectedLocation: Location | null;
  isPlaying: boolean;
  toggleAnimation: () => void;
  currentDate: string;
}

// Map header component
export const MapHeader: React.FC<MapHeaderProps> = ({
  selectedLocation,
  isPlaying,
  toggleAnimation,
  currentDate
}) => {
  const isTimeSeriesLocation = selectedLocation?.lng === -101.8504 && selectedLocation?.lat === 33.59076;
  
  const formatDisplayDate = (date: string) => {
    // Convert YYYYMMDD to MM-DD-YYYY
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);
    return `${month}-${day}-${year}`;
  };

  return (
    <div style={{ 
      position: 'absolute',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1,
      fontFamily: 'Sora, sans-serif',
      color: '#16182d'
    }}>
      <div style={{ 
        padding: '14px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        border: '1px solid #751d0c',
        color: '#16182d',
        minWidth: '200px',
        textAlign: 'center'
      }}>
        {selectedLocation ? (
          <>
            <div style={{ 
              fontSize: '18px', 
              color: '#16182d',
              fontWeight: '600'
            }}>
              {formatDisplayDate(selectedLocation.date || currentDate)}
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#16182d',
              opacity: '0.9'
            }}>
              {selectedLocation.name}
            </div>
          </>
        ) : (
          <div style={{ fontSize: '16px', color: '#16182d' }}>
            Select a location to view its footprint
          </div>
        )}
      </div>
    </div>
  );
}; 