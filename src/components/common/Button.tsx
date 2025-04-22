import React from 'react';
import styled, { css } from 'styled-components';
import { colors, typography, spacing, borderRadius, transitions } from '../../styles/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isActive?: boolean;
}

interface StyledButtonProps {
  variant: ButtonVariant;
  size: ButtonSize;
  fullWidth: boolean;
  hasIcon: boolean;
  iconPosition: 'left' | 'right';
  isActive: boolean;
}

const getButtonStyles = (props: StyledButtonProps) => {
  // Base styles
  let styles = `
    font-family: ${typography.fontFamily};
    font-weight: ${typography.fontWeights.semiBold};
    border-radius: ${borderRadius.md};
    cursor: pointer;
    transition: ${transitions.medium};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: ${props.fullWidth ? '100%' : 'auto'};
    line-height: 1;
    letter-spacing: -0.01em;
  `;

  // Size variants
  switch (props.size) {
    case 'small':
      styles += `
        padding: ${spacing.xs} ${spacing.sm};
        font-size: ${typography.sizes.small};
        gap: ${spacing.xs};
      `;
      break;
    case 'large':
      styles += `
        padding: ${spacing.md} ${spacing.lg};
        font-size: ${typography.sizes.button};
        gap: ${spacing.sm};
      `;
      break;
    default: // medium
      styles += `
        padding: ${spacing.sm} ${spacing.md};
        font-size: ${typography.sizes.body};
        gap: ${spacing.xs};
      `;
  }

  // Color variants
  switch (props.variant) {
    case 'secondary':
      styles += `
        background-color: ${props.isActive ? colors.canyonlandsTan : colors.snowbirdWhite};
        color: ${colors.olympicParkObsidian};
        border: 2px solid ${colors.moabMahogany};
        &:hover {
          background-color: ${colors.canyonlandsTan};
        }
        &:active {
          background-color: ${colors.canyonlandsTan};
          transform: translateY(1px);
        }
      `;
      break;
    case 'tertiary':
      styles += `
        background-color: transparent;
        color: ${colors.olympicParkObsidian};
        border: 2px solid ${colors.borderSecondary};
        &:hover {
          background-color: ${colors.backgroundTertiary};
          border-color: ${colors.textTertiary};
        }
        &:active {
          background-color: ${colors.backgroundTertiary};
          transform: translateY(1px);
        }
      `;
      break;
    case 'text':
      styles += `
        background-color: transparent;
        color: ${colors.moabMahogany};
        border: none;
        padding-left: ${spacing.xs};
        padding-right: ${spacing.xs};
        &:hover {
          background-color: rgba(117, 29, 12, 0.05);
          text-decoration: underline;
        }
        &:active {
          transform: translateY(1px);
        }
      `;
      break;
    default: // primary
      styles += `
        background-color: ${props.isActive ? colors.greatSaltLakeGreen : colors.moabMahogany};
        color: ${colors.snowbirdWhite};
        border: 2px solid ${colors.moabMahogany};
        &:hover {
          background-color: ${colors.greatSaltLakeGreen};
        }
        &:active {
          background-color: ${colors.greatSaltLakeGreen};
          transform: translateY(1px);
        }
      `;
  }

  // Disabled state
  styles += `
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }
  `;

  return styles;
};

const StyledButton = styled.button<StyledButtonProps>`
  ${props => getButtonStyles(props)}
`;

const IconWrapper = styled.span<{ position: 'left' | 'right' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  order: ${props => (props.position === 'left' ? -1 : 1)};
`;

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  isActive = false,
  ...props
}) => {
  const hasIcon = !!icon;

  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      hasIcon={hasIcon}
      iconPosition={iconPosition}
      isActive={isActive}
      {...props}
    >
      {hasIcon && <IconWrapper position={iconPosition}>{icon}</IconWrapper>}
      {children}
    </StyledButton>
  );
};