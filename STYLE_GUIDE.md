# Style Guide - Wildfire Footprints Application

This document outlines the design system and styling conventions used across the Wildfire Footprints application. Use this guide to maintain a consistent visual language when building new features or integrating styles into another application.

## Table of Contents
1. [Design Tokens](#design-tokens)
   - [Colors](#colors)
   - [Typography](#typography)
   - [Spacing](#spacing)
   - [Shadows](#shadows)
   - [Border Radius](#border-radius)
   - [Transitions](#transitions)
   - [Breakpoints](#breakpoints)
   - [Z-Indices](#z-indices)
2. [Global Styles and Resets](#global-styles-and-resets)
3. [Utility Classes](#utility-classes)
4. [Styled Components Setup](#styled-components-setup)
5. [Mapbox Specific Styles](#mapbox-specific-styles)
6. [Usage and Integration](#usage-and-integration)
7. [File Structure](#file-structure)
8. [Naming Conventions](#naming-conventions)

## Design Tokens

### Colors
| Token                   | Value    | Usage                       |
|-------------------------|----------|-----------------------------|
| olympicParkObsidian     | #1a1a1a  | Primary text, icons         |
| snowbirdWhite           | #f9f6ef  | Background primary          |
| canyonlandsTan          | #cea25d  | Accent, warnings            |
| moabMahogany            | #751d0c  | Primary actions, links      |
| spiralJettySage         | #99aa88  | Secondary accents           |
| greatSaltLakeGreen      | #2d5954  | Success states              |
| bonnevilleSaltFlatsBlue | #789ba8  | Info states                 |
| rockyMountainRust       | #dd3b00  | Error states                |
| backgroundSecondary     | #ffffff  | Card backgrounds            |
| backgroundTertiary      | #f8f9fa  | Panels                      |
| textSecondary           | #4a4a4a  | Subtext, captions           |
| textTertiary            | #767676  | Disabled text               |
| borderPrimary           | #751d0c  | Borders, dividers           |
| borderSecondary         | #e0e0e0  | Secondary borders           |
| **Footprint Scale**     | Array    | Sequential pink-red hues    |
| **PM2.5 Scale**         | Array    | Green-yellow-red hues       |

### Typography
- **Font Family**: Sora, sans-serif
- **Weights**:
  - Regular (400)
  - Medium (500)
  - SemiBold (600)
  - Bold (700)
- **Sizes**:
  - h1: 36pt
  - h2: 20pt
  - h3: 15pt
  - body: 9pt
  - small: 8pt
  - button: 10pt
- **Line Heights**:
  - h1: 1.2
  - h2: 1.3
  - h3: 1.4
  - body: 1.5

### Spacing
| Token | Value |
|-------|-------|
| xxs   | 4px   |
| xs    | 8px   |
| sm    | 12px  |
| md    | 16px  |
| lg    | 24px  |
| xl    | 32px  |
| xxl   | 48px  |

### Shadows
| Token | Value                          |
|-------|--------------------------------|
| sm    | 0 1px 2px rgba(0,0,0,0.05)     |
| md    | 0 4px 6px rgba(0,0,0,0.1)      |
| lg    | 0 10px 15px rgba(0,0,0,0.1)    |
| xl    | 0 20px 25px rgba(0,0,0,0.15)   |

### Border Radius
| Token | Value |
|-------|-------|
| sm    | 4px   |
| md    | 8px   |
| lg    | 12px  |
| xl    | 16px  |
| round | 50%   |

### Transitions
| Token  | Value             |
|--------|-------------------|
| fast   | all 0.2s ease     |
| medium | all 0.3s ease     |
| slow   | all 0.5s ease     |

### Breakpoints
| Token | Min Width |
|-------|-----------|
| xs    | 320px     |
| sm    | 576px     |
| md    | 768px     |
| lg    | 992px     |
| xl    | 1200px    |

### Z-Indices
| Token       | Value |
|-------------|-------|
| base        | 0     |
| mapControls | 10    |
| mapOverlays | 20    |
| popups      | 30    |
| modals      | 40    |
| tooltips    | 50    |

## Global Styles and Resets
- Implemented via `createGlobalStyle` (styled-components).
- CSS Reset: universal `box-sizing`, margin, padding.
- Base typography and background on `<body>`.
- Responsive image, button, link reset.
- Heading (h1–h6) consistent margins, font, weight.

## Utility Classes
- `.text-center`: centers text.
- `.container`: max-width 1200px, auto horizontal margin, padding `${spacing.md}`.
- `.mapbox-container`, `.mapboxgl-ctrl-group`, etc., for Mapbox.

## Styled Components Setup
Wrap app with ThemeProvider:
```tsx
import { ThemeProvider } from 'styled-components';
import GlobalStyles from './styles/GlobalStyles';
import theme from './styles/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      {/* ... */}
    </ThemeProvider>
  );
}
```

## Mapbox Specific Styles
- Markers: `.location-marker`, `.location-marker-selected` (performance, shadows).
- Popups: `.mapboxgl-popup-content`, `.mapboxgl-popup-close-button`, `.mapboxgl-popup-tip`.
- Legend: `#map-legend` shadows and borders.

## Usage and Integration
1. Install styled-components.
2. Copy `src/styles/theme.ts` and `src/styles/GlobalStyles.tsx`.
3. Wrap root component with `ThemeProvider` and include `<GlobalStyles />`.
4. Use theme tokens in styled components:
   ```tsx
   const Button = styled.button`
     background: ${({ theme }) => theme.colors.moabMahogany};
     color: ${({ theme }) => theme.colors.snowbirdWhite};
     padding: ${({ theme }) => theme.spacing.sm};
     border-radius: ${({ theme }) => theme.borderRadius.md};
     transition: ${({ theme }) => theme.transitions.fast};
   `;
   ```

## File Structure
```
src/
  styles/
    theme.ts
    GlobalStyles.tsx
    global.css (optional)
```

## Naming Conventions
- Design tokens: `camelCase`, descriptive.
- Utility classes: `kebab-case`.
- Styled components: `ComponentNameStyled`.
