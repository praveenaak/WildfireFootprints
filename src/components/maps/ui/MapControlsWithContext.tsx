import React from 'react';
import styled from 'styled-components';
import { ArrowLeft, Play, Pause } from 'lucide-react';
import { formatDate } from '../utils/mapUtils';
import { Button } from '../../common/Button';
import { 
  useMapState, 
  useMapActions, 
  useSelectedLocation, 
  useLayerType, 
  useThresholds, 
  useAnimationState 
} from '../context/MapContext';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndices,
} from '../../../styles/theme';
import { Typography } from '../../common/Typography';

interface MapControlsWithContextProps {
  onBackClick?: () => void;
}

// Styled components
const ControlsContainer = styled.div`
  position: absolute;
  top: 180px;
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

const DateDisplay = styled.div`
  padding: ${spacing.sm};
  background-color: ${colors.backgroundTertiary};
  border-radius: ${borderRadius.md};
  border: 2px solid ${colors.borderSecondary};
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

const AdditionalInfoText = styled(Typography)`
  margin-top: ${spacing.sm};
`;

// Convert threshold to log scale for slider
const logScale = (value: number) => Math.log10(value);
const inverseLogScale = (value: number) => Math.pow(10, value);

// Min and max values for the footprint threshold
const MIN_THRESHOLD = 1e-7;
const MAX_THRESHOLD = 0.8;

export const MapControlsWithContext: React.FC<MapControlsWithContextProps> = React.memo(({ 
  onBackClick 
}) => {
  // Use context hooks
  const selectedLocation = useSelectedLocation();
  const layerType = useLayerType();
  const { footprintThreshold, pm25Threshold } = useThresholds();
  const { isPlaying, currentDate } = useAnimationState();
  
  const { 
    setLayerType, 
    adjustThreshold, 
    setPlaying,
    resetMapState 
  } = useMapActions();

  // All locations now support time series data
  const isTimeSeriesLocation = !!selectedLocation;

  const handleSliderChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = inverseLogScale(parseFloat(event.target.value));
      // Call adjustThreshold with increase/decrease based on whether the new value is higher/lower
      if (newValue > footprintThreshold) {
        adjustThreshold('footprint', 'increase');
      } else if (newValue < footprintThreshold) {
        adjustThreshold('footprint', 'decrease');
      }
    },
    [footprintThreshold, adjustThreshold]
  );

  const handleBackClick = React.useCallback(() => {
    if (onBackClick) {
      onBackClick();
    } else {
      resetMapState();
    }
  }, [onBackClick, resetMapState]);

  const toggleAnimation = React.useCallback(() => {
    setPlaying(!isPlaying);
  }, [isPlaying, setPlaying]);

  if (!selectedLocation) {
    return null;
  }

  return (
    <ControlsContainer>
      <Button
        onClick={handleBackClick}
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
                Footprint Threshold: {footprintThreshold.toExponential(4)}
              </Typography>
              <SliderContainer>
                <StyledSlider
                  type="range"
                  min={logScale(MIN_THRESHOLD)}
                  max={logScale(MAX_THRESHOLD)}
                  step="0.1"
                  value={logScale(footprintThreshold)}
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
});

MapControlsWithContext.displayName = 'MapControlsWithContext';