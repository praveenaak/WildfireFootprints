import React from 'react'
import styled from 'styled-components'
import { colors } from '../styles/theme'

type TypographyVariant = 'h1' | 'h2' | 'h3' | 'body'
type TextAlign = 'left' | 'center' | 'right'

interface TypographyProps {
  variant?: TypographyVariant
  color?: string
  align?: TextAlign
  children: React.ReactNode
  className?: string
}

const StyledTypography = styled.div<TypographyProps>`
  color: ${props => props.color || colors.olympicParkObsidian};
  text-align: ${props => props.align || 'left'};
  font-family: 'Sora', sans-serif;

  ${props => {
    switch (props.variant) {
      case 'h1':
        return `
          font-size: 36pt;
          font-weight: 600;
          line-height: 1.2;
        `
      case 'h2':
        return `
          font-size: 20pt;
          font-weight: 600;
          line-height: 1.3;
        `
      case 'h3':
        return `
          font-size: 15pt;
          font-weight: 600;
          line-height: 1.4;
        `
      default:
        return `
          font-size: 9pt;
          font-weight: 400;
          line-height: 1.5;
        `
    }
  }}

  @media (max-width: 768px) {
    ${props => {
      switch (props.variant) {
        case 'h1':
          return 'font-size: 28pt;'
        case 'h2':
          return 'font-size: 18pt;'
        case 'h3':
          return 'font-size: 14pt;'
        default:
          return ''
      }
    }}
  }
`

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color,
  align,
  children,
  className
}) => {
  const Component = variant === 'body' ? 'p' : variant
  
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
  )
} 