// src/styles/theme.ts
export const colors = {
  // Brand Colors from design system
  olympicParkObsidian: '#1a1a1a',
  snowbirdWhite: '#f9f6ef',
  canyonlandsTan: '#cea25d',
  moabMahogany: '#751d0c',
  spiralJettySage: '#99aa88',
  greatSaltLakeGreen: '#2d5954',
  bonnevilleSaltFlatsBlue: '#789ba8',
  rockyMountainRust: '#dd3b00',
  
  // UI Colors
  backgroundPrimary: '#f9f6ef',
  backgroundSecondary: '#ffffff',
  backgroundTertiary: '#f8f9fa',
  textPrimary: '#1a1a1a',
  textSecondary: '#4a4a4a',
  textTertiary: '#767676',
  borderPrimary: '#751d0c',
  borderSecondary: '#e0e0e0',
  
  // Functional colors
  success: '#2d5954',
  warning: '#cea25d',
  error: '#dd3b00',
  info: '#789ba8',
  
  // Footprint Scale
  footprintScale: [
    '#FFE6E0', // Lightest pink
    '#FFCDC4', 
    '#F7A597',
    '#EE7D6A',
    '#D6553E',
    '#B32D16', // Darker mahogany
  ],
  
  // PM2.5 Scale
  pm25Scale: [
    '#e6ffed',
    '#b7eb8f',
    '#ffe58f',
    '#ffbb96',
    '#ff7875',
    '#ff4d4f'
  ]
};

export const typography = {
  fontFamily: "'Sora', sans-serif",
  fontWeights: {
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700
  },
  sizes: {
    h1: '36pt',
    h2: '20pt',
    h3: '15pt',
    body: '9pt',
    small: '8pt',
    button: '10pt'
  },
  lineHeights: {
    h1: 1.2,
    h2: 1.3,
    h3: 1.4,
    body: 1.5
  }
};

export const spacing = {
  xxs: '4px',
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px'
};

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.15)'
};

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  round: '50%'
};

export const transitions = {
  fast: 'all 0.2s ease',
  medium: 'all 0.3s ease',
  slow: 'all 0.5s ease'
};

export const breakpoints = {
  xs: '320px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px'
};

export const zIndices = {
  base: 0,
  mapControls: 10,
  mapOverlays: 20,
  popups: 30,
  modals: 40,
  tooltips: 50
};