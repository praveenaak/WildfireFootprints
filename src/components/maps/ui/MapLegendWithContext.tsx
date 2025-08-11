import React from 'react';
import styled from 'styled-components';
import { useSelectedLocation, useLayerType, useThresholds } from '../context/MapContext';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndices,
} from '../../../styles/theme';
import { Typography } from '../../common/Typography';

// Styled components
const LegendContainer = styled.div`
  position: absolute;
  bottom: ${spacing.xl};
  right: ${spacing.lg};
  padding: ${spacing.md};
  background-color: ${colors.snowbirdWhite};
  color: ${colors.textPrimary};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.lg};
  border: 2px solid ${colors.moabMahogany};
  z-index: ${zIndices.mapOverlays};
  font-family: ${typography.fontFamily};
  min-width: 200px;
`;

const LegendTitle = styled(Typography)`
  margin-bottom: ${spacing.sm};
  text-align: center;
  font-weight: ${typography.fontWeights.medium};
`;

const LegendGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacing.xs};
  margin-bottom: ${spacing.sm};
  align-items: center;
`;

const ColorBox = styled.div<{ color: string }>`
  width: 20px;
  height: 16px;
  background-color: ${props => props.color};
  border-radius: ${borderRadius.sm};
  border: 1px solid ${colors.borderSecondary};
`;

const LegendLabel = styled(Typography)`
  font-size: ${typography.sizes.small};
  line-height: 1.2;
`;

const SectionLabel = styled(Typography)`
  font-weight: ${typography.fontWeights.medium};
`;

// Footprint color scale
const footprintColors = [
  '#FFE6E0', // Lightest pink
  '#FFCDC4',
  '#F7A597',
  '#EE7D6A',
  '#D6553E',
  '#B32D16', // Darkest
];

const footprintValues = ['0-0.1', '0.1-0.2', '0.2-0.3', '0.3-0.4', '0.4-0.5', '0.5+'];

// PM2.5 color scale
const pm25Colors = [
  '#c8f2d5', // Very Good
  '#73d13d', // Good
  '#faad14', // Moderate
  '#ff7a45', // Unhealthy for Sensitive
  '#f5222d', // Unhealthy
  '#a8071a', // Very Unhealthy
];

const pm25Values = ['0-12', '12-35', '35-55', '55-150', '150-250', '250+'];
const pm25Labels = ['Good', 'Moderate', 'USG', 'Unhealthy', 'Very Unhealthy', 'Hazardous'];

// Component to render footprint legend items
const FootprintLegend: React.FC = () => {
  const displayIndices = [0, 2, 4, 5]; // Show subset for space
  
  return (
    <>
      {displayIndices.map(i => (
        <React.Fragment key={i}>
          <ColorBox color={footprintColors[i]} />
          <LegendLabel variant="caption">
            {footprintValues[i]}
          </LegendLabel>
        </React.Fragment>
      ))}
    </>
  );
};

// Component to render PM2.5 legend items
const PM25Legend: React.FC = () => {
  const values = ['0-12', '35-55', '150+', '250+'];
  const labels = ['Good', 'USG', 'V.Unhealthy', 'Hazardous'];
  const indices = [0, 2, 4, 5];
  
  return (
    <>
      {values.map((value, i) => (
        <React.Fragment key={i}>
          <ColorBox color={pm25Colors[indices[i]]} />
          <LegendLabel variant="caption">
            {labels[i]}: {value} μg/m³
          </LegendLabel>
        </React.Fragment>
      ))}
    </>
  );
};

export const MapLegendWithContext: React.FC = React.memo(() => {
  const selectedLocation = useSelectedLocation();
  const layerType = useLayerType();
  const { footprintThreshold, pm25Threshold } = useThresholds();

  if (!selectedLocation) return null;

  const getTitle = () => {
    switch (layerType) {
      case 'footprint':
        return 'Wildfire Footprint';
      case 'pm25':
        return 'PM2.5 Levels';
      case 'combined':
        return 'Combined Data';
      default:
        return 'Legend';
    }
  };

  const renderLegendItems = () => {
    if (layerType === 'footprint') {
      return <FootprintLegend />;
    } else if (layerType === 'pm25') {
      return <PM25Legend />;
    } else {
      // Combined view - show both
      return (
        <>
          <FootprintLegend />
          <div style={{ gridColumn: '1 / -1', margin: `${spacing.xs} 0` }}>
            <SectionLabel variant="caption">PM2.5:</SectionLabel>
          </div>
          <PM25Legend />
        </>
      );
    }
  };

  return (
    <LegendContainer>
      <LegendTitle variant="body">
        {getTitle()}
      </LegendTitle>

      <LegendGrid>{renderLegendItems()}</LegendGrid>

      <Typography variant="caption">Values below threshold are filtered out</Typography>
    </LegendContainer>
  );
});

MapLegendWithContext.displayName = 'MapLegendWithContext';