import React from 'react';
import MultiLocationMapbox from '../components/maps/MultiLocationMapbox';
import { MAPBOX_CONFIG } from '../config/mapbox';

const MapPage: React.FC = () => {
  return (
    <div className="map-page" style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100vh',
      overflow: 'hidden'
    }}>
      <MultiLocationMapbox 
        center={MAPBOX_CONFIG.defaultCenter}
        zoom={MAPBOX_CONFIG.defaultZoom}
        minFootprintThreshold={0.0001} // Initial threshold for footprint data
        minPm25Threshold={0.01} // Initial threshold for PM2.5 data
        timestamp="08-25-2016 00:00" 
      />
    </div>
  );
};

export default MapPage;