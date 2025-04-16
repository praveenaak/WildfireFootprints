import React from 'react'
import styled from 'styled-components'
import { colors } from '../styles/theme'

type ButtonVariant = 'primary' | 'secondary' | 'tertiary'
type ButtonSize = 'small' | 'medium' | 'large'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

interface StyledButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

const StyledButton = styled.button<StyledButtonProps>`
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  width: ${(props: StyledButtonProps) => props.fullWidth ? '100%' : 'auto'};

  /* Size Variants */
  padding: ${(props: StyledButtonProps) => {
    switch (props.size) {
      case 'small': return '0.5rem 1rem'
      case 'large': return '1rem 2rem'
      default: return '0.75rem 1.5rem'
    }
  }};

  font-size: ${(props: StyledButtonProps) => {
    switch (props.size) {
      case 'small': return '0.875rem'
      case 'large': return '1.125rem'
      default: return '1rem'
    }
  }};

  /* Color Variants */
  ${(props: StyledButtonProps) => {
    switch (props.variant) {
      case 'secondary':
        return `
          background-color: ${colors.canyonlandsTan};
          color: ${colors.olympicParkObsidian};
          &:hover {
            background-color: ${colors.moabMahogany};
            color: ${colors.snowbirdWhite};
          }
        `
      case 'tertiary':
        return `
          background-color: transparent;
          color: ${colors.olympicParkObsidian};
          border: 2px solid ${colors.olympicParkObsidian};
          &:hover {
            background-color: ${colors.olympicParkObsidian};
            color: ${colors.snowbirdWhite};
          }
        `
      default:
        return `
          background-color: ${colors.olympicParkObsidian};
          color: ${colors.snowbirdWhite};
          &:hover {
            background-color: ${colors.greatSaltLakeGreen};
          }
        `
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      {...props}
    >
      {children}
    </StyledButton>
  )
} 