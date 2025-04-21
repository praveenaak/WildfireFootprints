import React from 'react';
import styled from 'styled-components';
import { colors, typography } from '../../styles/theme';

type TypographyVariant = 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'caption';
type TextAlign = 'left' | 'center' | 'right';

interface TypographyProps {
  variant?: TypographyVariant;
  color?: string;
  align?: TextAlign;
  children: React.ReactNode;
  className?: string;
}

const StyledTypography = styled.div<TypographyProps>`
  color: ${props => props.color || colors.olympicParkObsidian};
  text-align: ${props => props.align || 'left'};
  font-family: ${typography.fontFamily};

  ${props => {
    switch (props.variant) {
      case 'h1':
        return `
          font-size: ${typography.sizes.h1};
          font-weight: ${typography.fontWeights.semiBold};
          line-height: ${typography.lineHeights.h1};
        `;
      case 'h2':
        return `
          font-size: ${typography.sizes.h2};
          font-weight: ${typography.fontWeights.semiBold};
          line-height: ${typography.lineHeights.h2};
        `;
      case 'h3':
        return `
          font-size: ${typography.sizes.h3};
          font-weight: ${typography.fontWeights.semiBold};
          line-height: ${typography.lineHeights.h3};
        `;
      case 'small':
        return `
          font-size: ${typography.sizes.small};
          font-weight: ${typography.fontWeights.regular};
          line-height: ${typography.lineHeights.body};
        `;
      case 'caption':
        return `
          font-size: ${typography.sizes.small};
          font-weight: ${typography.fontWeights.medium};
          line-height: ${typography.lineHeights.body};
          opacity: 0.8;
        `;
      default: // body
        return `
          font-size: ${typography.sizes.body};
          font-weight: ${typography.fontWeights.regular};
          line-height: ${typography.lineHeights.body};
        `;
    }
  }}

  @media (max-width: 768px) {
    ${props => {
      switch (props.variant) {
        case 'h1':
          return 'font-size: 28pt;';
        case 'h2':
          return 'font-size: 18pt;';
        case 'h3':
          return 'font-size: 14pt;';
        default:
          return '';
      }
    }}
  }
`;

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color,
  align,
  children,
  className
}) => {
  const Component = variant === 'body' || variant === 'small' || variant === 'caption' ? 'p' : variant;
  
  return (
    <StyledTypography
      as={Component}
      variant={variant}
      color={color}
      align={align}
      className={className}
    >
      {children}
    </StyledTypography>
  );
};