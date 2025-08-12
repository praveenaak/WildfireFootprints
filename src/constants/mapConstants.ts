// Map Configuration Constants
export const MAP_CONSTANTS = {
  // Animation settings
  ANIMATION_DELAY: 1000,
  MAP_STYLE_LOAD_TIMEOUT: 100,

  // Date ranges
  DATE_RANGES: {
    START_DATE: new Date('2016-08-01'),
    END_DATE: new Date('2020-10-01'),
    DEFAULT_DATE: '20160801',
  },

  // Map settings
  ZOOM: {
    MIN: 3,
    MAX: 18,
    DEFAULT: 8,
  },

  // Thresholds
  FOOTPRINT_THRESHOLD: {
    DEFAULT: 0.3,
    MIN: 0,
    MAX: 1,
    STEP: 0.1,
  },

  // Special coordinates for locations
  COORDINATES: {
    SALT_LAKE: { lng: -111.8722, lat: 40.73639 },
    OREGON: { lng: -123.0837, lat: 44.02631 },
    CALIFORNIA: { lng: -120.9942, lat: 37.64216 },
  },

  // Color values for map visualization
  COLORS: {
    MARKER_ACTIVE: '#751d0c',
    MARKER_INACTIVE: '#99aa88',
    MARKER_LIGHT_MAROON: '#C85450', // Light maroon for unselected markers
    FOOTPRINT_LOW: 'rgba(117, 29, 12, 0.3)',
    FOOTPRINT_HIGH: 'rgba(117, 29, 12, 0.8)',
  },

  // Layer names
  LAYER_IDS: {
    FOOTPRINT: 'footprint-layer',
    PM25: 'pm25-layer',
    MARKERS: 'markers-layer',
  },

  // Month configurations
  MONTHS: {
    AVAILABLE: [
      { value: '08', label: 'August' },
      { value: '09', label: 'September' },
      { value: '10', label: 'October' },
    ],
    NAMES: {
      '01': 'January',
      '02': 'February',
      '03': 'March',
      '04': 'April',
      '05': 'May',
      '06': 'June',
      '07': 'July',
      '08': 'August',
      '09': 'September',
      '10': 'October',
      '11': 'November',
      '12': 'December',
    },
  },

  // Years available
  YEARS: ['2016', '2017', '2018', '2019', '2020'],
};

// Size constants for UI elements
export const UI_CONSTANTS = {
  BUTTON_SIZES: {
    SMALL: { padding: '8px 16px', fontSize: '14px' },
    MEDIUM: { padding: '12px 24px', fontSize: '16px' },
    LARGE: { padding: '16px 32px', fontSize: '18px' },
  },

  ICON_SIZES: {
    SMALL: 16,
    MEDIUM: 20,
    LARGE: 24,
  },

  CONTAINER_MAX_WIDTHS: {
    SM: '576px',
    MD: '768px',
    LG: '992px',
    XL: '1200px',
  },
};

// Performance constants
export const PERFORMANCE_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  MAX_MARKERS: 1000,
  CHUNK_SIZE: 50,
};
