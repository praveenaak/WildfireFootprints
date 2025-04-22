import React from 'react';
import styled from 'styled-components';
import { ChevronDown } from 'lucide-react';
import { Location } from '../types';
import { colors, typography, spacing, borderRadius, shadows, zIndices } from '../../../styles/theme';
import { Typography } from '../../common/Typography';

interface MapHeaderProps {
  selectedLocation: Location | null;
  isPlaying: boolean;
  currentDate: string;
  setCurrentDate?: (date: string) => void;
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
  border: 2px solid ${colors.moabMahogany};
  color: ${colors.textPrimary};
  min-width: 320px;
  text-align: center;
  box-shadow: ${shadows.md};
`;

const LocationName = styled(Typography)`
  font-size: 16px;
  color: ${colors.textPrimary};
  font-weight: ${typography.fontWeights.semiBold};
  margin-bottom: 4px;
`;

const NoSelectionText = styled(Typography)`
  font-size: 16px;
  color: ${colors.textPrimary};
  margin: 0;
`;

const SelectorRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  margin-top: ${spacing.xs};
`;

const SelectWrapper = styled.div<{ isEditable: boolean }>`
  position: relative;
  min-width: 80px;
  opacity: ${props => props.isEditable ? 1 : 0.85};
`;

const StyledSelect = styled.select`
  appearance: none;
  background-color: ${colors.backgroundTertiary};
  border: 2px solid ${colors.borderSecondary};
  border-radius: ${borderRadius.md};
  padding: ${spacing.xs} ${spacing.sm};
  padding-right: ${spacing.lg};
  font-family: ${typography.fontFamily};
  font-size: ${typography.sizes.body};
  font-weight: ${typography.fontWeights.medium};
  color: ${colors.textPrimary};
  cursor: pointer;
  width: 100%;
  text-align: center;
  
  &:focus {
    outline: none;
    border-color: ${colors.moabMahogany};
  }
  
  &:disabled {
    cursor: default;
  }
`;

const ReadOnlySelect = styled.div`
  background-color: ${colors.backgroundTertiary};
  border: 2px solid ${colors.borderSecondary};
  border-radius: ${borderRadius.md};
  padding: ${spacing.xs} ${spacing.sm};
  font-family: ${typography.fontFamily};
  font-size: ${typography.sizes.body};
  font-weight: ${typography.fontWeights.medium};
  color: ${colors.textPrimary};
  width: 100%;
  text-align: center;
`;

const ChevronIcon = styled.div<{ isEditable: boolean }>`
  position: absolute;
  right: ${spacing.sm};
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: ${colors.textSecondary};
  opacity: ${props => props.isEditable ? 1 : 0};
`;

const Separator = styled.div`
  font-size: ${typography.sizes.h3};
  font-weight: ${typography.fontWeights.medium};
  color: ${colors.textPrimary};
  margin: 0 -4px;
`;

const AnimationText = styled(Typography)`
  margin-top: ${spacing.xs};
  color: ${colors.moabMahogany};
  font-weight: ${typography.fontWeights.medium};
`;

// Helper function to get month name
const getMonthName = (monthNum: string): string => {
  const months: Record<string, string> = {
    '01': 'January',
    '02': 'February',
    '03': 'March',
    '04': 'April',
    '05': 'May',
    '06': 'June',
    '07': 'July',
    '08': 'August',
    '09': 'September',
    '10': 'October',
    '11': 'November',
    '12': 'December'
  };
  return months[monthNum] || monthNum;
};

export const MapHeader: React.FC<MapHeaderProps> = ({
  selectedLocation,
  isPlaying,
  currentDate,
  setCurrentDate
}) => {
  // Check if this is a time series location
  const isTimeSeriesLocation = selectedLocation && (
    (selectedLocation.lng === -101.8504 && selectedLocation.lat === 33.59076) || 
    (selectedLocation.lng === -111.8722 && selectedLocation.lat === 40.73639)
  );

  // Parse the current date for selectors
  const year = currentDate?.substring(0, 4);
  const month = currentDate?.substring(4, 6);
  const day = currentDate?.substring(6, 8);
  
  // Generate year options (2016-2020)
  const years = ['2016', '2017', '2018', '2019', '2020'];
  
  // Generate month options (August, September, October)
  const months = [
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' }
  ];
  
  // Generate day options based on selected month
  const getDaysForMonth = (month: string) => {
    if (month === '10') {
      // Only show October 1st
      return [{ value: '01', label: '1' }];
    } else if (month === '09') {
      // September has 30 days
      return Array.from({ length: 30 }, (_, i) => {
        const day = String(i + 1).padStart(2, '0');
        return { value: day, label: String(i + 1) };
      });
    } else {
      // August has 31 days
      return Array.from({ length: 31 }, (_, i) => {
        const day = String(i + 1).padStart(2, '0');
        return { value: day, label: String(i + 1) };
      });
    }
  };
  
  const days = getDaysForMonth(month);
  
  // Handle selection changes
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!setCurrentDate) return;
    const newYear = e.target.value;
    setCurrentDate(`${newYear}${month}${day}`);
  };
  
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!setCurrentDate) return;
    const newMonth = e.target.value;
    
    // If changing to October, force day to 01
    let newDay = day;
    if (newMonth === '10') {
      newDay = '01';
    } else if (newMonth === '09' && parseInt(day) > 30) {
      // Adjust day if changing to September and day is 31
      newDay = '30';
    }
    
    setCurrentDate(`${year}${newMonth}${newDay}`);
  };
  
  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!setCurrentDate) return;
    const newDay = e.target.value;
    setCurrentDate(`${year}${month}${newDay}`);
  };

  // Determine if the location is editable (time series and can be edited)
  const isEditable = !!isTimeSeriesLocation && !!setCurrentDate;

  return (
    <HeaderContainer>
      <HeaderPanel>
        {selectedLocation ? (
          <>
            <LocationName variant="body">
              {selectedLocation.name}
            </LocationName>
            
            <SelectorRow>
              <SelectWrapper isEditable={isEditable}>
                {isEditable ? (
                  <>
                    <StyledSelect value={month} onChange={handleMonthChange}>
                      {months.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </StyledSelect>
                    <ChevronIcon isEditable={true}>
                      <ChevronDown size={14} />
                    </ChevronIcon>
                  </>
                ) : (
                  <ReadOnlySelect>
                    {getMonthName(month)}
                  </ReadOnlySelect>
                )}
              </SelectWrapper>
              
              <SelectWrapper isEditable={isEditable}>
                {isEditable ? (
                  <>
                    <StyledSelect 
                      value={day} 
                      onChange={handleDayChange}
                      disabled={month === '10'} 
                    >
                      {days.map(d => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </StyledSelect>
                    <ChevronIcon isEditable={month !== '10'}>
                      <ChevronDown size={14} />
                    </ChevronIcon>
                  </>
                ) : (
                  <ReadOnlySelect>
                    {parseInt(day)}
                  </ReadOnlySelect>
                )}
              </SelectWrapper>
              
              <Separator>,</Separator>
              
              <SelectWrapper isEditable={isEditable}>
                {isEditable ? (
                  <>
                    <StyledSelect value={year} onChange={handleYearChange}>
                      {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </StyledSelect>
                    <ChevronIcon isEditable={true}>
                      <ChevronDown size={14} />
                    </ChevronIcon>
                  </>
                ) : (
                  <ReadOnlySelect>
                    {year}
                  </ReadOnlySelect>
                )}
              </SelectWrapper>
            </SelectorRow>

            {isPlaying && (
              <AnimationText variant="caption">
                Animation Playing
              </AnimationText>
            )}
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