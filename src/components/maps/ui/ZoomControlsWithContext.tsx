import React from 'react';
import styled from 'styled-components';
import { useMapState, useMapActions, useMapInstance } from '../context/MapContext';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndices,
  transitions,
} from '../../../styles/theme';

const ZoomContainer = styled.div`
  position: absolute;
  bottom: ${spacing.xl};
  left: ${spacing.lg};
  z-index: ${zIndices.mapControls + 5};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing.xxs};
  background-color: ${colors.snowbirdWhite};
  padding: ${spacing.xs};
  border-radius: ${borderRadius.lg};
  border: 2px solid ${colors.moabMahogany};
  box-shadow: ${shadows.md};
  pointer-events: auto !important;
`;

const ZoomButton = styled.button`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${colors.backgroundSecondary};
  border: 2px solid ${colors.moabMahogany};
  border-radius: ${borderRadius.sm};
  cursor: pointer !important;
  font-size: 18px;
  color: ${colors.moabMahogany};
  padding: 0;
  transition: ${transitions.medium};
  z-index: ${zIndices.mapControls + 10};
  position: relative;
  pointer-events: auto !important;

  &:hover {
    background-color: ${colors.backgroundTertiary};
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ZoomLevel = styled.div`
  font-size: 14px;
  font-weight: ${typography.fontWeights.medium};
  color: ${colors.textPrimary};
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: ${typography.fontFamily};
`;

export const ZoomControlsWithContext: React.FC = React.memo(() => {
  const { currentZoom } = useMapState();
  const map = useMapInstance();

  const handleZoomIn = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (map) {
      map.zoomIn();
    }
  }, [map]);

  const handleZoomOut = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (map) {
      map.zoomOut();
    }
  }, [map]);

  if (!map) {
    return null;
  }

  return (
    <ZoomContainer>
      <ZoomButton 
        onClick={handleZoomIn} 
        aria-label="Zoom in" 
        type="button"
        disabled={currentZoom >= 20}
      >
        +
      </ZoomButton>
      <ZoomLevel>{currentZoom.toFixed(1)}</ZoomLevel>
      <ZoomButton 
        onClick={handleZoomOut} 
        aria-label="Zoom out" 
        type="button"
        disabled={currentZoom <= 1}
      >
        −
      </ZoomButton>
    </ZoomContainer>
  );
});

ZoomControlsWithContext.displayName = 'ZoomControlsWithContext';