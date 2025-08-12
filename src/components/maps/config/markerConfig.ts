/**
 * Marker configuration for Mapbox markers
 * Contains SVG definitions and styling for selected and unselected marker states
 */

export interface MarkerConfig {
  width: string;
  height: string;
  backgroundImage: string;
}

/**
 * SVG marker for unselected state - transparent with light maroon edge
 */
const UNSELECTED_MARKER_SVG = `data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2225%22%20height%3D%2241%22%3E%3Cpath%20fill%3D%22transparent%22%20stroke%3D%22%23C85450%22%20stroke-width%3D%222%22%20d%3D%22M12.5%200C5.596%200%200%205.596%200%2012.5c0%203.662%203.735%2011.08%208.302%2019.271.44.788.859%201.536%201.26%202.263C10.714%2036.357%2011.496%2038%2012.5%2038c1.004%200%201.786-1.643%202.938-3.966.401-.727.82-1.475%201.26-2.263C21.265%2023.58%2025%2016.162%2025%2012.5%2025%205.596%2019.404%200%2012.5%200zm0%2018a5.5%205.5%200%20110-11%205.5%205.5%200%20010%2011z%22%2F%3E%3C%2Fsvg%3E`;

/**
 * SVG marker for selected state - filled with mahogany color
 */
const SELECTED_MARKER_SVG = `data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2225%22%20height%3D%2241%22%3E%3Cpath%20fill%3D%22%23751d0c%22%20d%3D%22M12.5%200C5.596%200%200%205.596%200%2012.5c0%203.662%203.735%2011.08%208.302%2019.271.44.788.859%201.536%201.26%202.263C10.714%2036.357%2011.496%2038%2012.5%2038c1.004%200%201.786-1.643%202.938-3.966.401-.727.82-1.475%201.26-2.263C21.265%2023.58%2025%2016.162%2025%2012.5%2025%205.596%2019.404%200%2012.5%200zm0%2018a5.5%205.5%200%20110-11%205.5%205.5%200%20010%2011z%22%2F%3E%3C%2Fsvg%3E`;

/**
 * Marker configurations for different states
 */
export const MARKER_CONFIGS = {
  unselected: {
    width: '25px',
    height: '41px',
    backgroundImage: `url('${UNSELECTED_MARKER_SVG}')`,
  },
  selected: {
    width: '25px',
    height: '41px',
    backgroundImage: `url('${SELECTED_MARKER_SVG}')`,
  },
} as const;

/**
 * Common marker element styles
 */
export const MARKER_BASE_STYLES = {
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center bottom',
  cursor: 'pointer',
  pointerEvents: 'auto',
  zIndex: '10',
  transition: 'filter 0.2s ease',
} as const;

/**
 * Get marker configuration based on selection state
 */
export function getMarkerConfig(isSelected: boolean): MarkerConfig {
  return isSelected ? MARKER_CONFIGS.selected : MARKER_CONFIGS.unselected;
}

/**
 * Apply base styles to marker element
 */
export function applyMarkerBaseStyles(element: HTMLElement): void {
  Object.assign(element.style, MARKER_BASE_STYLES);
}

/**
 * Apply marker configuration to element
 */
export function applyMarkerConfig(element: HTMLElement, config: MarkerConfig): void {
  element.style.width = config.width;
  element.style.height = config.height;
  element.style.backgroundImage = config.backgroundImage;
}