import React from 'react'
import styled, { css } from 'styled-components'
import { colors, typography } from '../styles/theme'

type TypographyVariant = 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'caption'
type TextAlign = 'left' | 'center' | 'right'
type FontWeight = 'regular' | 'medium' | 'semiBold' | 'bold'
type Color = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'white'

interface TypographyProps {
  variant?: TypographyVariant
  align?: TextAlign
  weight?: FontWeight
  color?: Color
  gutterBottom?: boolean
  truncate?: boolean
  as?: React.ElementType
  className?: string
  children: React.ReactNode
}

const variantStyles = {
  h1: css`
    font-size: ${typography.sizes.h1};
    line-height: ${typography.lineHeights.h1};
    font-weight: ${typography.fontWeights.semiBold};
  `,
  h2: css`
    font-size: ${typography.sizes.h2};
    line-height: ${typography.lineHeights.h2};
    font-weight: ${typography.fontWeights.semiBold};
  `,
  h3: css`
    font-size: ${typography.sizes.h3};
    line-height: ${typography.lineHeights.h3};
    font-weight: ${typography.fontWeights.semiBold};
  `,
  body: css`
    font-size: ${typography.sizes.body};
    line-height: ${typography.lineHeights.body};
    font-weight: ${typography.fontWeights.regular};
  `,
  small: css`
    font-size: ${typography.sizes.small};
    line-height: ${typography.lineHeights.body};
    font-weight: ${typography.fontWeights.regular};
  `,
  caption: css`
    font-size: ${typography.sizes.small};
    line-height: ${typography.lineHeights.body};
    font-weight: ${typography.fontWeights.medium};
    letter-spacing: 0.02em;
  `,
}

const colorStyles = {
  primary: css`
    color: ${colors.textPrimary};
  `,
  secondary: css`
    color: ${colors.textSecondary};
  `,
  tertiary: css`
    color: ${colors.textTertiary};
  `,
  accent: css`
    color: ${colors.moabMahogany};
  `,
  white: css`
    color: ${colors.snowbirdWhite};
  `,
}

const weightStyles = {
  regular: css`
    font-weight: ${typography.fontWeights.regular};
  `,
  medium: css`
    font-weight: ${typography.fontWeights.medium};
  `,
  semiBold: css`
    font-weight: ${typography.fontWeights.semiBold};
  `,
  bold: css`
    font-weight: ${typography.fontWeights.bold};
  `,
}

const TextElement = styled.span<{
  $variant: TypographyVariant
  $align: TextAlign
  $weight: FontWeight
  $color: Color
  $gutterBottom: boolean
  $truncate: boolean
}>`
  font-family: ${typography.fontFamily};
  margin: 0;
  ${props => variantStyles[props.$variant]};
  ${props => colorStyles[props.$color]};
  ${props => weightStyles[props.$weight]};
  text-align: ${props => props.$align};
  margin-bottom: ${props => (props.$gutterBottom ? '0.5em' : '0')};
  
  ${props => props.$truncate && css`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
  `}
`

const defaultComponentMap: Record<TypographyVariant, React.ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  body: 'p',
  small: 'span',
  caption: 'span',
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  align = 'left',
  weight,
  color = 'primary',
  gutterBottom = false,
  truncate = false,
  as,
  className,
  children,
}) => {
  const finalWeight = weight || (
    variant.startsWith('h') ? 'semiBold' : 'regular'
  )
  
  const component = as || defaultComponentMap[variant]
  
  return (
    <TextElement
      as={component}
      $variant={variant}
      $align={align}
      $weight={finalWeight}
      $color={color}
      $gutterBottom={gutterBottom}
      $truncate={truncate}
      className={className}
    >
      {children}
    </TextElement>
  )
}

export default Typography 