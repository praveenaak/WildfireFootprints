import React from 'react';
import { LayerType, Location } from '../types';

interface MapLegendProps {
  selectedLocation: Location | null;
  layerType: LayerType;
  currentFootprintThreshold: number;
  currentPm25Threshold: number;
}

// Map legend component
export const MapLegend: React.FC<MapLegendProps> = ({
  selectedLocation,
  layerType,
  currentFootprintThreshold,
  currentPm25Threshold
}) => {
  if (!selectedLocation) return null;

  const ranges = {
    footprint: { min: 0.0002, max: 0.04 },
    pm25: { min: 0, max: 100 }
  };

  return (
    <div id="map-legend" style={{
      position: 'absolute',
      bottom: '30px',
      right: '20px',
      padding: '12px',
      backgroundColor: '#FFFAFA', // Snowbird white
      color: '#16182d',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 1,
      maxWidth: '180px',
      border: '2px solid #8B0000' // Mahogany red border
    }}>
      <h4 style={{
        margin: '0 0 10px 0',
        fontSize: '14px',
        fontWeight: '600',
        borderBottom: '1px solid #8B0000',
        paddingBottom: '6px',
        color: '#16182d'
      }}>
        {layerType === 'footprint' ? 'Footprint Scale' : 'PM2.5 Scale (μg/m³)'}
      </h4>

      {layerType === 'footprint' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '20px 1fr',
          gap: '6px 8px',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          {generateFootprintLegendItems(ranges.footprint.min, ranges.footprint.max)}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '20px 1fr',
          gap: '6px 8px',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          {generatePm25LegendItems(ranges.pm25.min, ranges.pm25.max)}
        </div>
      )}
    </div>
  );
};

// Helper function to generate footprint legend items
const generateFootprintLegendItems = (min: number, max: number) => {
  const step = (max - min) / 5;
  const values = [min, min + step, min + (2 * step), min + (3 * step), min + (4 * step), max];
  const colors = ['#ffd4cc', '#ffa699', '#ff7866', '#c73122', '#962615', '#751d0c'];

  return values.map((value, i) => (
    <React.Fragment key={i}>
      <span style={{
        width: '20px',
        height: '20px',
        backgroundColor: colors[i],
        display: 'block',
        borderRadius: '4px'
      }} />
      <span style={{ fontSize: '11px' }}>
        {value.toExponential(4)}
      </span>
    </React.Fragment>
  ));
};

// Helper function to generate PM2.5 legend items
const generatePm25LegendItems = (min: number, max: number) => {
  const values = [
    min,
    Math.min(12, max * 0.1),
    Math.min(35, max * 0.35),
    Math.min(55, max * 0.55),
    Math.min(75, max * 0.75),
    max
  ];
  
  const labels = ['Very Good', 'Good', 'Moderate', 'Unhealthy for Sensitive', 'Unhealthy', 'Very Unhealthy'];
  const colors = ['#2c6e31', '#4d9221', '#c67f1d', '#d14009', '#ad1707', '#8b0000'];

  return values.map((value, i) => (
    <React.Fragment key={i}>
      <span style={{
        width: '20px',
        height: '20px',
        backgroundColor: colors[i],
        display: 'block',
        borderRadius: '4px'
      }} />
      <span style={{ fontSize: '11px', lineHeight: '1.3' }}>
        {i === values.length - 1 ? `${value.toFixed(1)}+` : `${value.toFixed(1)} - ${values[i + 1].toFixed(1)}`}
        <br />
        <span style={{ opacity: 0.8 }}>{labels[i]}</span>
      </span>
    </React.Fragment>
  ));
}; 