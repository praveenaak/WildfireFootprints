import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Location } from '../types';
// Import needed components
import { colors, typography, spacing, borderRadius, shadows, zIndices } from '../../../styles/theme';

interface MapHeaderProps {
  selectedLocation: Location | null;
  isPlaying: boolean;
  toggleAnimation: () => void;
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
  background-color: ${colors.backgroundTertiary};
  border-radius: ${borderRadius.lg};
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
  border: 1px solid ${colors.borderPrimary};
  color: ${colors.textPrimary};
  min-width: 200px;
  text-align: center;
  box-shadow: ${shadows.md};
`;

const DateText = styled.div`
  font-size: 18px;
  color: ${colors.textPrimary};
  font-weight: ${typography.fontWeights.semiBold};
`;

const LocationName = styled.div`
  font-size: 14px;
  color: ${colors.textPrimary};
  opacity: 0.9;
`;

const NoSelectionText = styled.div`
  font-size: 16px;
  color: ${colors.textPrimary};
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
  toggleAnimation,
  currentDate
}) => {
  // We don't need this check in the header component as it's handled in the parent component
  
  // Memoize formatted date to prevent unnecessary recalculations
  const formattedDate = useMemo(() => {
    return selectedLocation ? formatDisplayDate(selectedLocation.date || currentDate) : '';
  }, [selectedLocation, currentDate]);

  return (
    <HeaderContainer>
      <HeaderPanel>
        {selectedLocation ? (
          <>
            <DateText>
              {formattedDate}
            </DateText>
            <LocationName>
              {selectedLocation.name}
            </LocationName>
          </>
        ) : (
          <NoSelectionText>
            Select a location to view its footprint
          </NoSelectionText>
        )}
      </HeaderPanel>
    </HeaderContainer>
  );
};