import React from 'react';
import styled from 'styled-components';
import { ArrowLeft, Play, Pause } from 'lucide-react';
import { LayerType, Location } from '../types';
import { Button } from '../../common/Button';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndices,
} from '../../../styles/theme';
import { Typography } from '../../common/Typography';

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

// Styled components
const ControlsContainer = styled.div`
  position: absolute;
  top: ${spacing.lg};
  left: ${spacing.lg};
  z-index: ${zIndices.mapControls};
  max-width: 320px;
  font-family: ${typography.fontFamily};
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`;

const ControlPanel = styled.div`
  padding: ${spacing.md};
  background-color: ${colors.snowbirdWhite};
  border-radius: ${borderRadius.lg};
  border: 2px solid ${colors.moabMahogany};
  box-shadow: ${shadows.md};
  color: ${colors.olympicParkObsidian};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${spacing.xs};
  margin-bottom: ${spacing.md};
`;

const ThresholdContainer = styled.div`
  margin-bottom: ${spacing.md};
  padding: ${spacing.md};
  background-color: ${colors.backgroundTertiary};
  border-radius: ${borderRadius.md};
  border: 2px solid ${colors.borderSecondary};
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;

const SliderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
`;

const StyledSlider = styled.input`
  width: 100%;
  height: 6px;
  accent-color: ${colors.moabMahogany};
  border-radius: ${borderRadius.sm};
  cursor: pointer;
`;

const SliderLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${typography.sizes.small};
  color: ${colors.textSecondary};
`;


const AdditionalInfoText = styled(Typography)`
  margin-top: ${spacing.sm};
`;

const BackButton = styled(Button)`
  background-color: ${colors.moabMahogany};
  color: ${colors.snowbirdWhite};
  border: 2px solid ${colors.snowbirdWhite} !important;
  
  &:hover {
    background-color: ${colors.greatSaltLakeGreen};
    border: 2px solid ${colors.snowbirdWhite} !important;
  }
  
  &:active {
    background-color: ${colors.greatSaltLakeGreen};
    border: 2px solid ${colors.snowbirdWhite} !important;
    transform: translateY(1px);
  }
`;

// Convert threshold to log scale for slider
const logScale = (value: number) => Math.log10(value);
const inverseLogScale = (value: number) => Math.pow(10, value);

// Min and max values for the footprint threshold
const MIN_THRESHOLD = 1e-7;
const MAX_THRESHOLD = 0.8;

export const MapControls: React.FC<MapControlsProps> = React.memo(({
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
  // All locations now support time series data
  const isTimeSeriesLocation = !!selectedLocation;

  const handleSliderChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = inverseLogScale(parseFloat(event.target.value));
      // Call adjustThreshold with increase/decrease based on whether the new value is higher/lower
      if (newValue > currentFootprintThreshold) {
        adjustThreshold('increase');
      } else if (newValue < currentFootprintThreshold) {
        adjustThreshold('decrease');
      }
    },
    [currentFootprintThreshold, adjustThreshold]
  );

  // Only render controls when a location is selected
  if (!selectedLocation) {
    return null;
  }

  return (
    <ControlsContainer>
      <BackButton
        onClick={onBackClick}
        variant="primary"
        fullWidth
        icon={<ArrowLeft size={18} />}
        iconPosition="left"
      >
        Back to All Locations
      </BackButton>

      <ControlPanel>
        <ButtonGroup>
          <Button
            onClick={() => setLayerType('footprint')}
            variant="secondary"
            fullWidth
            isActive={layerType === 'footprint'}
          >
            Footprint Data
          </Button>
          <Button
            onClick={() => setLayerType('pm25')}
            variant="secondary"
            fullWidth
            isActive={layerType === 'pm25'}
          >
            PM2.5 Data
          </Button>
          <Button
            onClick={() => setLayerType('combined')}
            variant="secondary"
            fullWidth
            isActive={layerType === 'combined'}
          >
            Combined
          </Button>
        </ButtonGroup>

        <ThresholdContainer>
          {layerType === 'footprint' || layerType === 'combined' ? (
            <>
              <Typography variant="body" color={colors.textPrimary}>
                Footprint Threshold: {currentFootprintThreshold.toExponential(4)}
              </Typography>
              <SliderContainer>
                <StyledSlider
                  type="range"
                  min={logScale(MIN_THRESHOLD)}
                  max={logScale(MAX_THRESHOLD)}
                  step="0.1"
                  value={logScale(currentFootprintThreshold)}
                  onChange={handleSliderChange}
                />
                <SliderLabels>
                  <span>{MIN_THRESHOLD.toExponential(4)}</span>
                  <span>{MAX_THRESHOLD.toExponential(4)}</span>
                </SliderLabels>
              </SliderContainer>

              {layerType === 'combined' && (
                <AdditionalInfoText variant="body" align="center">
                  Also showing PM2.5 in μg/m³
                </AdditionalInfoText>
              )}
            </>
          ) : (
            <Typography variant="body" align="center">
              Showing PM2.5 in μg/m³
            </Typography>
          )}
        </ThresholdContainer>

        {isTimeSeriesLocation && (
          <Button
            onClick={() => {
              toggleAnimation();
            }}
            variant="primary"
            fullWidth
            icon={isPlaying ? <Pause size={16} /> : <Play size={16} />}
          >
            {isPlaying ? 'Pause Animation' : 'Play Animation'}
          </Button>
        )}
      </ControlPanel>
    </ControlsContainer>
  );
});

MapControls.displayName = 'MapControls';
