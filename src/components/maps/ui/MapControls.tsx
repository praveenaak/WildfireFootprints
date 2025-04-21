import React from 'react';
import styled from 'styled-components';
import { ArrowLeft, Play, Pause } from 'lucide-react';
import { LayerType, Location } from '../types';
import { formatDate } from '../utils/mapUtils';
import { Button } from '../../common/Button';
import { colors, typography, spacing, borderRadius, shadows, zIndices } from '../../../styles/theme';
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
  border: 1px solid ${colors.moabMahogany};
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
  border: 1px solid ${colors.borderSecondary};
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

const DateDisplay = styled.div`
  padding: ${spacing.sm};
  background-color: ${colors.backgroundTertiary};
  border-radius: ${borderRadius.md};
  border: 1px solid ${colors.borderSecondary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${spacing.sm};
`;

const RecordingDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: ${colors.rockyMountainRust};
  border-radius: ${borderRadius.round};
  margin-left: ${spacing.xs};
  animation: pulse 1.5s infinite;

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
    100% {
      opacity: 1;
    }
  }
`;

// Convert threshold to log scale for slider
const logScale = (value: number) => Math.log10(value);
const inverseLogScale = (value: number) => Math.pow(10, value);

// Min and max values for the footprint threshold
const MIN_THRESHOLD = 0.0001;
const MAX_THRESHOLD = 0.04;

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
  const isTimeSeriesLocation = selectedLocation?.lng === -101.8504 && selectedLocation?.lat === 33.59076 ||
                              selectedLocation?.lng === -111.8722 && selectedLocation?.lat === 40.73639;
  
  const handleSliderChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = inverseLogScale(parseFloat(event.target.value));
    // Call adjustThreshold with increase/decrease based on whether the new value is higher/lower
    if (newValue > currentFootprintThreshold) {
      adjustThreshold('increase');
    } else if (newValue < currentFootprintThreshold) {
      adjustThreshold('decrease');
    }
  }, [currentFootprintThreshold, adjustThreshold]);

  return (
    <ControlsContainer>
      <Button 
        onClick={onBackClick}
        variant="secondary"
        fullWidth
        icon={<ArrowLeft size={18} />}
        iconPosition="left"
      >
        Back to All Locations
      </Button>

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
        </ButtonGroup>

        <ThresholdContainer>
          {layerType === 'footprint' ? (
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
            </>
          ) : (
            <Typography variant="body" align="center">
              Showing PM2.5 in μg/m³
            </Typography>
          )}
        </ThresholdContainer>

        {isTimeSeriesLocation && (
          <>
            <DateDisplay>
              <Typography variant="body" color={colors.textPrimary}>
                Current Date:
              </Typography>
              <Typography variant="body">
                {formatDate(currentDate)}
                {isPlaying && <RecordingDot />}
              </Typography>
            </DateDisplay>
            <Button
              onClick={toggleAnimation}
              variant="secondary"
              fullWidth
              icon={isPlaying ? <Pause size={16} /> : <Play size={16} />}
            >
              {isPlaying ? 'Pause Animation' : 'Play Animation'}
            </Button>
          </>
        )}
      </ControlPanel>
    </ControlsContainer>
  );
};