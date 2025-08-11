import React from 'react';
import styled from 'styled-components';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndices,
} from '../../../styles/theme';

interface TimestampIndicatorProps {
  timestamp: string;
}

const TimestampContainer = styled.div`
  position: absolute;
  top: ${spacing.lg};
  right: ${spacing.lg};
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${borderRadius.md};
  box-shadow: ${shadows.sm};
  border: 1px solid ${colors.borderSecondary};
  z-index: ${zIndices.mapOverlays};

  font-family: ${typography.fontFamily};
  font-size: ${typography.sizes.small};
  font-weight: ${typography.fontWeights.medium};
  color: ${colors.textPrimary};
  letter-spacing: 0.5px;

  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 1);
    box-shadow: ${shadows.md};
  }
`;

const TimestampLabel = styled.div`
  font-size: ${typography.sizes.small};
  color: ${colors.textSecondary};
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const TimestampIndicator: React.FC<TimestampIndicatorProps> = ({ timestamp }) => {
  return (
    <TimestampContainer>
      <TimestampLabel>Current Date</TimestampLabel>
      {timestamp}
    </TimestampContainer>
  );
};
