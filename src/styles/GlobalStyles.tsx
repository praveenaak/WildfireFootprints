// src/styles/GlobalStyles.tsx
import { createGlobalStyle } from 'styled-components';
import { colors, typography, spacing, transitions } from './theme';

const GlobalStyles = createGlobalStyle`
  /* Import fonts */
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');

  /* CSS Reset */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    height: 100%;
    -webkit-text-size-adjust: 100%;
  }

  body {
    font-family: ${typography.fontFamily};
    font-size: ${typography.sizes.body};
    line-height: ${typography.lineHeights.body};
    color: ${colors.textPrimary};
    background-color: ${colors.backgroundPrimary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    height: 100%;
    overflow: hidden;
    letter-spacing: -0.01em;
  }

  #root {
    height: 100%;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${typography.fontFamily};
    font-weight: ${typography.fontWeights.semiBold};
    line-height: 1.2;
    margin: 0 0 0.5em 0;
    color: ${colors.textPrimary};
  }

  h1 {
    font-size: ${typography.sizes.h1};
    line-height: ${typography.lineHeights.h1};
  }

  h2 {
    font-size: ${typography.sizes.h2};
    line-height: ${typography.lineHeights.h2};
  }

  h3 {
    font-size: ${typography.sizes.h3};
    line-height: ${typography.lineHeights.h3};
  }

  p {
    margin: 0 0 1em 0;
  }

  a {
    color: ${colors.moabMahogany};
    text-decoration: none;
    transition: ${transitions.fast};
  }

  a:hover {
    color: ${colors.greatSaltLakeGreen};
    text-decoration: underline;
  }

  img, svg {
    max-width: 100%;
    height: auto;
    display: block;
  }

  button {
    font-family: ${typography.fontFamily};
    cursor: pointer;
  }

  ul, ol {
    margin: 0 0 1em 1.5em;
    padding: 0;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
    font-size: 0.9em;
    padding: 0.2em 0.4em;
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
  }

  /* Utility Classes */
  .text-center {
    text-align: center;
  }

  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${spacing.md};
  }

  /* Mapbox specific styles */
  .mapbox-container {
    width: 100%;
    height: 100vh;
  }

  /* Style for map controls */
  .mapboxgl-ctrl-group {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  /* Location marker styles */
  .location-marker {
    will-change: transform;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    transition: none; /* No transitions for instant positioning */
    filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.4));
  }

  .location-marker:hover {
    filter: brightness(1.1) drop-shadow(0 3px 5px rgba(0, 0, 0, 0.5));
  }

  .location-marker-selected {
    will-change: transform;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    transition: none;
    filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.6)) !important;
    z-index: 20 !important;
  }

  /* Marker popup styles */
  .mapboxgl-popup-content {
    padding: 12px;
    max-width: 200px;
    border-radius: 8px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-family: ${typography.fontFamily};
    font-size: 13px;
  }

  .location-popup .mapboxgl-popup-content {
    padding: 10px 12px;
    font-size: 13px;
    border-radius: 8px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
    font-weight: 500;
    background-color: rgba(22, 28, 45, 0.9) !important;
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .mapboxgl-popup-close-button {
    font-size: 16px;
    color: #fff !important;
    padding: 4px 8px !important;
    right: 2px !important;
    top: 2px !important;
  }

  .mapboxgl-popup-tip {
    border-top-color: rgba(22, 28, 45, 0.9) !important;
    border-width: 8px !important;
  }

  /* Improve marker performance */
  .mapboxgl-marker {
    transition: none !important;
    will-change: transform;
    transform: translate(-50%, -100%); /* Center the marker correctly */
  }

  /* Custom legend styles */
  #map-legend {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-family: ${typography.fontFamily};
  }

  /* Override default map page padding for full screen */
  .map-page {
    padding: 0 !important;
  }

  /* Media queries for responsive design */
  @media (max-width: 768px) {
    h1 {
      font-size: 28pt;
    }
    
    h2 {
      font-size: 18pt;
    }
    
    h3 {
      font-size: 14pt;
    }
    
    .mapboxgl-popup-content {
      max-width: 180px;
      padding: 10px;
      font-size: 12px;
    }
  }

  @media (max-width: 480px) {
    .map-controls {
      max-width: 260px;
    }
    
    .mapboxgl-popup-content {
      max-width: 160px;
      padding: 8px;
      font-size: 11px;
    }
  }
`;

export default GlobalStyles;