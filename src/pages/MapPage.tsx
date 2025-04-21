import React from 'react';
import styled from 'styled-components';
import { MAPBOX_CONFIG } from '../config/mapbox';
import MultiLocationMapbox from '../components/maps/MultiLocationMapbox';
import { zIndices } from '../styles/theme';

const MapContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: ${zIndices.base};
  overflow: hidden;
`;

const MapPage: React.FC = () => {
  return (
    <MapContainer className="map-page">
      <MultiLocationMapbox 
        center={MAPBOX_CONFIG.defaultCenter}
        zoom={MAPBOX_CONFIG.defaultZoom}
        minFootprintThreshold={0.0002} // Initial threshold for footprint data
        minPm25Threshold={0.01} // Initial threshold for PM2.5 data
        timestamp="08-25-2016 00:00" 
      />
    </MapContainer>
  );
};

export default MapPage;