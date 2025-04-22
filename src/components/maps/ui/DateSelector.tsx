import React from 'react';
import styled from 'styled-components';
import { ChevronDown } from 'lucide-react';
import { colors, spacing, borderRadius, shadows, zIndices, typography } from '../../../styles/theme';

interface DateSelectorProps {
  currentDate: string;
  setCurrentDate: (date: string) => void;
  isTimeSeriesLocation: boolean;
}

const SelectorContainer = styled.div`
  position: absolute;
  bottom: ${spacing.lg};
  left: 50%;
  transform: translateX(-50%);
  z-index: ${zIndices.mapControls};
  background-color: ${colors.snowbirdWhite};
  border-radius: ${borderRadius.lg};
  border: 2px solid ${colors.moabMahogany};
  box-shadow: ${shadows.md};
  padding: ${spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
  min-width: 320px;
`;

const Title = styled.div`
  font-family: ${typography.fontFamily};
  font-weight: ${typography.fontWeights.semiBold};
  font-size: ${typography.sizes.body};
  color: ${colors.olympicParkObsidian};
  margin-bottom: ${spacing.xs};
  text-align: center;
`;

const SelectorRow = styled.div`
  display: flex;
  gap: ${spacing.md};
  align-items: center;
  justify-content: center;
`;

const SelectWrapper = styled.div`
  position: relative;
  min-width: 100px;
`;

const StyledSelect = styled.select`
  appearance: none;
  background-color: ${colors.backgroundTertiary};
  border: 2px solid ${colors.borderSecondary};
  border-radius: ${borderRadius.md};
  padding: ${spacing.sm} ${spacing.md};
  padding-right: ${spacing.lg};
  font-family: ${typography.fontFamily};
  font-size: ${typography.sizes.small};
  color: ${colors.textPrimary};
  cursor: pointer;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: ${colors.moabMahogany};
  }
`;

const ChevronIcon = styled.div`
  position: absolute;
  right: ${spacing.sm};
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: ${colors.textSecondary};
`;

/**
 * Date selector component that allows users to select dates from 2016-2020 
 * for August, September, and October 1st
 */
export const DateSelector: React.FC<DateSelectorProps> = ({ 
  currentDate,
  setCurrentDate,
  isTimeSeriesLocation
}) => {
  if (!isTimeSeriesLocation) {
    return null;
  }

  // Parse the current date
  const year = currentDate.substring(0, 4);
  const month = currentDate.substring(4, 6);
  const day = currentDate.substring(6, 8);
  
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
    const newYear = e.target.value;
    setCurrentDate(`${newYear}${month}${day}`);
  };
  
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
    const newDay = e.target.value;
    setCurrentDate(`${year}${month}${newDay}`);
  };
  
  return (
    <SelectorContainer>
      <Title>Select Date</Title>
      <SelectorRow>
        <SelectWrapper>
          <StyledSelect value={year} onChange={handleYearChange}>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </StyledSelect>
          <ChevronIcon>
            <ChevronDown size={16} />
          </ChevronIcon>
        </SelectWrapper>
        
        <SelectWrapper>
          <StyledSelect value={month} onChange={handleMonthChange}>
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </StyledSelect>
          <ChevronIcon>
            <ChevronDown size={16} />
          </ChevronIcon>
        </SelectWrapper>
        
        <SelectWrapper>
          <StyledSelect 
            value={day} 
            onChange={handleDayChange}
            disabled={month === '10'} // Disable day selection for October
          >
            {days.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </StyledSelect>
          <ChevronIcon>
            <ChevronDown size={16} />
          </ChevronIcon>
        </SelectWrapper>
      </SelectorRow>
    </SelectorContainer>
  );
}; 