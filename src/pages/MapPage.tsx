import React from 'react';
import  MapboxViewer  from '../components/maps/MapboxViewer';
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
      <MapboxViewer 
        tilesetId={MAPBOX_CONFIG.defaultTileset}
        center={MAPBOX_CONFIG.defaultCenter}
        zoom={MAPBOX_CONFIG.defaultZoom}
      />
    </div>
  );
};

export default MapPage;