import React from 'react';
import styled from 'styled-components';
import { ChevronDown, MapPin } from 'lucide-react';
import { useSelectedLocation, useAnimationState, useMapActions } from '../context/MapContext';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndices,
  transitions,
} from '../../../styles/theme';
import { MAP_CONSTANTS } from '../../../constants/mapConstants';
import { Typography } from '../../common/Typography';

// Styled components with design
const HeaderContainer = styled.div`
  position: absolute;
  top: ${spacing.lg};
  left: ${spacing.lg};
  transform: none;
  z-index: ${zIndices.mapOverlays};
  background-color: ${colors.snowbirdWhite};
  border-radius: ${borderRadius.lg};
  border: 2px solid ${colors.moabMahogany};
  box-shadow: ${shadows.md};
  padding: ${spacing.md};
  max-width: 400px;
  font-family: ${typography.fontFamily};
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

const LocationIcon = styled(MapPin)`
  color: ${colors.moabMahogany};
  flex-shrink: 0;
`;

const LocationInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const LocationName = styled(Typography)`
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: ${typography.fontWeights.medium};
`;

const CoordinatesText = styled(Typography)`
  opacity: 0.8;
`;

const DateSelector = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  background-color: ${colors.backgroundTertiary};
  border: 1px solid ${colors.borderSecondary};
  border-radius: ${borderRadius.md};
  padding: ${spacing.xs} ${spacing.sm};
  cursor: pointer;
  transition: ${transitions.fast};
  margin-left: ${spacing.sm};
  
  &:hover {
    background-color: ${colors.backgroundSecondary};
  }
`;

const DateText = styled(Typography)`
  margin-right: ${spacing.xs};
  white-space: nowrap;
  font-weight: ${typography.fontWeights.medium};
`;

const SectionLabel = styled(Typography)`
  margin-bottom: ${spacing.xs};
  font-weight: ${typography.fontWeights.medium};
`;

const DateDropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: ${colors.snowbirdWhite};
  border: 2px solid ${colors.moabMahogany};
  border-radius: ${borderRadius.md};
  box-shadow: ${shadows.lg};
  z-index: ${zIndices.popups};
  min-width: 200px;
  max-height: 300px;
  overflow-y: auto;
  display: ${props => (props.isOpen ? 'block' : 'none')};
  margin-top: ${spacing.xs};
`;

const DateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  padding: ${spacing.xs};
`;

const SelectContainer = styled.div`
  padding: ${spacing.sm};
  border-bottom: 1px solid ${colors.borderSecondary};
`;

const Select = styled.select`
  width: 100%;
  padding: ${spacing.xs};
  border: 1px solid ${colors.borderSecondary};
  border-radius: ${borderRadius.sm};
  background-color: ${colors.backgroundSecondary};
  font-family: ${typography.fontFamily};
  font-size: ${typography.sizes.body};
  
  &:focus {
    outline: none;
    border-color: ${colors.moabMahogany};
  }
`;

const DateButton = styled.button<{ isSelected?: boolean }>`
  padding: ${spacing.xs};
  border: 1px solid ${colors.borderSecondary};
  background-color: ${props =>
    props.isSelected ? colors.moabMahogany : colors.backgroundSecondary};
  color: ${props => (props.isSelected ? colors.snowbirdWhite : colors.textPrimary)};
  cursor: pointer;
  font-size: ${typography.sizes.small};
  transition: ${transitions.fast};
  
  &:hover {
    background-color: ${props =>
      props.isSelected ? colors.moabMahogany : colors.backgroundTertiary};
  }
`;

export const MapHeaderWithContext: React.FC = React.memo(() => {
  const selectedLocation = useSelectedLocation();
  const { isPlaying, currentDate } = useAnimationState();
  const { setCurrentDate } = useMapActions();
  
  const [isDateSelectorOpen, setIsDateSelectorOpen] = React.useState(false);
  const [selectedYear, setSelectedYear] = React.useState('2016');
  const [selectedMonth, setSelectedMonth] = React.useState('08');

  React.useEffect(() => {
    // Parse current date to set dropdowns
    const dateStr = currentDate;
    if (dateStr && dateStr.length === 8) {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      setSelectedYear(year);
      setSelectedMonth(month);
    }
  }, [currentDate]);

  const formatCurrentDate = (dateString: string): string => {
    if (!dateString || dateString.length !== 8) return 'Aug 25, 2016';
    
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    
    const monthNames = Object.values(MAP_CONSTANTS.MONTHS.NAMES);
    const monthName = monthNames[parseInt(month, 10) - 1] || 'Aug';
    
    return `${monthName} ${parseInt(day, 10)}, ${year}`;
  };

  const handleDateChange = (newDate: string) => {
    setCurrentDate(newDate);
    setIsDateSelectorOpen(false);
  };

  const generateDaysForMonth = () => {
    // Handle null/undefined month, defaulting to August (08)
    const monthNum = parseInt(selectedMonth || '08', 10);
    const yearNum = parseInt(selectedYear || '2016', 10);
    
    // Guard against null/undefined values
    if (!monthNum || !yearNum) return [];
    
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
    const days = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = day.toString().padStart(2, '0');
      const fullDate = `${selectedYear}${selectedMonth}${dayStr}`;
      const isSelected = currentDate === fullDate;
      
      days.push(
        <DateButton
          key={day}
          isSelected={isSelected}
          onClick={() => handleDateChange(fullDate)}
        >
          {day}
        </DateButton>
      );
    }
    
    return days;
  };

  if (!selectedLocation) {
    return null;
  }

  return (
    <HeaderContainer>
      <LocationIcon size={20} />
      <LocationInfo>
        <LocationName variant="body" color={colors.textPrimary}>
          {selectedLocation.name}
        </LocationName>
        <CoordinatesText variant="caption" color={colors.textSecondary}>
          {selectedLocation.lat.toFixed(4)}°N, {Math.abs(selectedLocation.lng).toFixed(4)}°W
        </CoordinatesText>
      </LocationInfo>
      
      {selectedLocation && (
        <DateSelector onClick={() => setIsDateSelectorOpen(!isDateSelectorOpen)}>
          <DateText variant="caption">
            {formatCurrentDate(currentDate)}
          </DateText>
          <ChevronDown size={14} style={{ 
            transform: isDateSelectorOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: transitions.fast
          }} />
          
          <DateDropdown isOpen={isDateSelectorOpen}>
            <SelectContainer>
              <SectionLabel variant="caption">
                Year:
              </SectionLabel>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              >
                {MAP_CONSTANTS.YEARS.map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </Select>
            </SelectContainer>
            
            <SelectContainer>
              <SectionLabel variant="caption">
                Month:
              </SectionLabel>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              >
                {Object.entries(MAP_CONSTANTS.MONTHS.NAMES).map(([value, name]) => (
                  <option key={value} value={value}>
                    {name}
                  </option>
                ))}
              </Select>
            </SelectContainer>
            
            <div style={{ padding: spacing.sm }}>
              <SectionLabel variant="caption">
                Day:
              </SectionLabel>
              <DateGrid>
                {generateDaysForMonth()}
              </DateGrid>
            </div>
          </DateDropdown>
        </DateSelector>
      )}
    </HeaderContainer>
  );
});

MapHeaderWithContext.displayName = 'MapHeaderWithContext';