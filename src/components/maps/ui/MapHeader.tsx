import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Location } from '../types';
import { colors, typography, spacing, borderRadius, shadows, zIndices } from '../../../styles/theme';
import { Typography } from '../../common/Typography';

interface MapHeaderProps {
  selectedLocation: Location | null;
  isPlaying: boolean;
  currentDate: string;
}

// Styled components
const HeaderContainer = styled.div`
  position: absolute;
  top: ${spacing.lg};
  left: 50%;
  transform: translateX(-50%);
  z-index: ${zIndices.mapOverlays};
  font-family: ${typography.fontFamily};
  color: ${colors.textPrimary};
`;

const HeaderPanel = styled.div`
  padding: ${spacing.md};
  background-color: ${colors.snowbirdWhite};
  border-radius: ${borderRadius.lg};
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
  border: 1px solid ${colors.moabMahogany};
  color: ${colors.textPrimary};
  min-width: 200px;
  text-align: center;
  box-shadow: ${shadows.md};
`;

const DateText = styled(Typography)`
  font-size: 18px;
  color: ${colors.textPrimary};
  margin-bottom: 4px;
`;

const LocationName = styled(Typography)`
  font-size: 14px;
  color: ${colors.textPrimary};
  opacity: 0.9;
  margin: 0;
`;

const NoSelectionText = styled(Typography)`
  font-size: 16px;
  color: ${colors.textPrimary};
  margin: 0;
`;

// Helper function to format date display
const formatDisplayDate = (date: string) => {
  // Convert YYYYMMDD to MM-DD-YYYY
  const year = date.substring(0, 4);
  const month = date.substring(4, 6);
  const day = date.substring(6, 8);
  return `${month}-${day}-${year}`;
};

export const MapHeader: React.FC<MapHeaderProps> = ({
  selectedLocation,
  isPlaying,
  currentDate
}) => {
  // Memoize formatted date to prevent unnecessary recalculations
  const formattedDate = useMemo(() => {
    return selectedLocation ? formatDisplayDate(selectedLocation.date || currentDate) : '';
  }, [selectedLocation, currentDate]);

  return (
    <HeaderContainer>
      <HeaderPanel>
        {selectedLocation ? (
          <>
            <DateText variant="h3">
              {formattedDate}
            </DateText>
            <LocationName variant="body">
              {selectedLocation.name}
            </LocationName>
          </>
        ) : (
          <NoSelectionText variant="body">
            Select a location to view its data
          </NoSelectionText>
        )}
      </HeaderPanel>
    </HeaderContainer>
  );
};