import React from 'react';
import styled from 'styled-components';
import { ChevronDown, MapPin } from 'lucide-react';
import { Location } from '../types';
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

interface MapHeaderProps {
  selectedLocation: Location | null;
  isPlaying: boolean;
  currentDate: string;
  setCurrentDate?: (date: string) => void;
}

// Styled components with design
const HeaderContainer = styled.div`
  position: absolute;
  top: ${spacing.lg};
  left: 50%;
  transform: translateX(-50%);
  z-index: ${zIndices.mapOverlays};
  font-family: ${typography.fontFamily};
  color: ${colors.textPrimary};
  max-width: 450px;
  width: 450px;
  display: flex;
  flex-direction: column;
`;

const HeaderPanel = styled.div`
  padding: ${spacing.md};
  background-color: rgba(249, 246, 239, 0.6);
  border-radius: ${borderRadius.lg};
  display: flex;
  flex-direction: column;
  gap: ${spacing.xs};
  border: 2px solid ${colors.moabMahogany};
  color: ${colors.textPrimary};
  text-align: center;
  box-shadow: ${shadows.md};
  backdrop-filter: blur(8px);
  transition: ${transitions.medium};
  width: 100%;

  &:hover {
    box-shadow: ${shadows.lg};
    background-color: rgba(249, 246, 239, 0.75);
  }
`;

const LocationName = styled(Typography)`
  font-size: 18px;
  color: ${colors.moabMahogany};
  font-weight: ${typography.fontWeights.semiBold};
  margin-bottom: 4px;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 2px;
    background: linear-gradient(to right, transparent, ${colors.moabMahogany}, transparent);
    border-radius: 2px;
  }
`;

const LocationIcon = styled(MapPin)`
  color: ${colors.moabMahogany};
  margin-right: ${spacing.xs};
`;

const NoSelectionText = styled(Typography)`
  font-size: 16px;
  color: ${colors.textPrimary};
  margin: ${spacing.md} 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DateContainer = styled.div`
  margin-top: ${spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const DateSelectorRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.md};
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: ${borderRadius.lg};
  border: 2px solid ${colors.moabMahogany};
  box-shadow: ${shadows.sm};
  backdrop-filter: blur(4px);
`;

const SelectWrapper = styled.div<{ isEditable: boolean }>`
  position: relative;
  min-width: 80px;
  opacity: ${props => (props.isEditable ? 1 : 0.85)};
`;

const StyledSelect = styled.select`
  appearance: none;
  background-color: ${colors.snowbirdWhite};
  border: 1px solid ${colors.moabMahogany}40;
  border-radius: ${borderRadius.md};
  padding: ${spacing.sm} ${spacing.md};
  padding-right: ${spacing.xl};
  font-family: ${typography.fontFamily};
  font-size: ${typography.sizes.body};
  font-weight: ${typography.fontWeights.semiBold};
  color: ${colors.moabMahogany};
  cursor: pointer;
  width: 100%;
  text-align: center;
  transition: ${transitions.medium};
  box-shadow: 0 2px 4px rgba(117, 29, 12, 0.1);

  &:focus {
    outline: none;
    border-color: ${colors.moabMahogany};
    box-shadow: 0 0 0 3px ${colors.moabMahogany}30, 0 2px 8px rgba(117, 29, 12, 0.2);
    background-color: ${colors.snowbirdWhite};
  }

  &:hover {
    border-color: ${colors.moabMahogany}60;
    box-shadow: 0 2px 8px rgba(117, 29, 12, 0.15);
    background-color: ${colors.snowbirdWhite};
  }

  &:disabled {
    cursor: default;
    opacity: 0.6;
    background-color: ${colors.backgroundTertiary};
  }
`;

const ReadOnlySelect = styled.div`
  background-color: ${colors.snowbirdWhite};
  border: 1px solid ${colors.moabMahogany}40;
  border-radius: ${borderRadius.md};
  padding: ${spacing.sm} ${spacing.md};
  font-family: ${typography.fontFamily};
  font-size: ${typography.sizes.body};
  font-weight: ${typography.fontWeights.semiBold};
  color: ${colors.moabMahogany};
  width: 100%;
  text-align: center;
  box-shadow: 0 2px 4px rgba(117, 29, 12, 0.1);
  opacity: 0.8;
`;

const ChevronIcon = styled.div<{ isEditable: boolean }>`
  position: absolute;
  right: ${spacing.md};
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: ${colors.moabMahogany};
  opacity: ${props => (props.isEditable ? 0.7 : 0)};
  transition: ${transitions.medium};
`;

const Separator = styled.div`
  font-size: ${typography.sizes.h3};
  font-weight: ${typography.fontWeights.semiBold};
  color: ${colors.moabMahogany};
  margin: 0 -2px;
  opacity: 0.8;
`;


// Helper function to get month name
const getMonthName = (monthNum: string): string => {
  return (
    MAP_CONSTANTS.MONTHS.NAMES[monthNum as keyof typeof MAP_CONSTANTS.MONTHS.NAMES] || monthNum
  );
};

export const MapHeader: React.FC<MapHeaderProps> = ({
  selectedLocation,
  isPlaying,
  currentDate,
  setCurrentDate,
}) => {
  // All locations now support time series data
  const isTimeSeriesLocation = true;

  // Parse the current date for selectors, defaulting to August 1, 2016 if undefined
  const safeCurrentDate = currentDate || MAP_CONSTANTS.DATE_RANGES.DEFAULT_DATE;
  const year = safeCurrentDate.substring(0, 4);
  const month = safeCurrentDate.substring(4, 6);
  const day = safeCurrentDate.substring(6, 8);

  // Generate year options (2016-2020)
  const years = MAP_CONSTANTS.YEARS;

  // Generate month options (August, September, October)
  const months = MAP_CONSTANTS.MONTHS.AVAILABLE;

  // Generate day options based on selected month
  const getDaysForMonth = (monthValue: string | undefined) => {
    // Handle null/undefined month, defaulting to August (08)
    const month = monthValue || '08';

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
    // Guard against null/undefined values
    const currentMonth = month || '08';
    const currentDay = day || '01';
    setCurrentDate(`${newYear}${currentMonth}${currentDay}`);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!setCurrentDate) return;
    const newMonth = e.target.value;

    // Guard against null/undefined values
    const currentYear = year || '2016';
    let newDay = day || '01';

    // If changing to October, force day to 01
    if (newMonth === '10') {
      newDay = '01';
    } else if (newMonth === '09' && parseInt(newDay) > 30) {
      // Adjust day if changing to September and day is 31
      newDay = '30';
    }

    setCurrentDate(`${currentYear}${newMonth}${newDay}`);
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!setCurrentDate) return;
    const newDay = e.target.value;
    // Guard against null/undefined values
    const currentYear = year || '2016';
    const currentMonth = month || '08';
    setCurrentDate(`${currentYear}${currentMonth}${newDay}`);
  };

  // Determine if the location is editable (time series and can be edited)
  const isEditable = !!isTimeSeriesLocation && !!setCurrentDate;

  return (
    <HeaderContainer>
      <HeaderPanel>
        {selectedLocation ? (
          <>
            <LocationName variant="body">
              <LocationIcon size={18} />
              {selectedLocation.name}
            </LocationName>

            {isTimeSeriesLocation && (
              <DateContainer>
                <DateSelectorRow>
                  <SelectWrapper isEditable={isEditable}>
                    {isEditable ? (
                      <>
                        <StyledSelect value={month} onChange={handleMonthChange}>
                          {months.map(m => (
                            <option key={m.value} value={m.value}>
                              {m.label}
                            </option>
                          ))}
                        </StyledSelect>
                        <ChevronIcon isEditable={true}>
                          <ChevronDown size={14} />
                        </ChevronIcon>
                      </>
                    ) : (
                      <ReadOnlySelect>{getMonthName(month)}</ReadOnlySelect>
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
                            <option key={d.value} value={d.value}>
                              {d.label}
                            </option>
                          ))}
                        </StyledSelect>
                        <ChevronIcon isEditable={month !== '10'}>
                          <ChevronDown size={14} />
                        </ChevronIcon>
                      </>
                    ) : (
                      <ReadOnlySelect>{parseInt(day)}</ReadOnlySelect>
                    )}
                  </SelectWrapper>

                  <Separator>,</Separator>

                  <SelectWrapper isEditable={isEditable}>
                    {isEditable ? (
                      <>
                        <StyledSelect value={year} onChange={handleYearChange}>
                          {years.map(y => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </StyledSelect>
                        <ChevronIcon isEditable={true}>
                          <ChevronDown size={14} />
                        </ChevronIcon>
                      </>
                    ) : (
                      <ReadOnlySelect>{year}</ReadOnlySelect>
                    )}
                  </SelectWrapper>
                </DateSelectorRow>
              </DateContainer>
            )}
          </>
        ) : (
          <NoSelectionText variant="body">
            <MapPin size={16} style={{ marginRight: '8px' }} />
            Select a location to view footprint data
          </NoSelectionText>
        )}
      </HeaderPanel>
    </HeaderContainer>
  );
};
