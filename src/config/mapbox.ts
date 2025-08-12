// Safe access to environment variables for CRA
const getEnvVariable = (key: string): string => {
  const fullKey = `REACT_APP_${key}`;
  if (process.env[fullKey] === undefined) {
    console.warn(`Environment variable ${fullKey} is not defined`);
    return '';
  }
  return process.env[fullKey] as string;
};

// Secure token validation - no hardcoded fallbacks
const getRequiredEnvVariable = (key: string): string => {
  const value = getEnvVariable(key);
  if (!value || value.trim() === '') {
    throw new Error(`Required environment variable REACT_APP_${key} is not defined or empty`);
  }
  return value;
};

export const MAPBOX_CONFIG = {
  accessToken: getRequiredEnvVariable('MAPBOX_TOKEN'),
  defaultCenter: [
    parseFloat(getEnvVariable('MAPBOX_CENTER_LNG') || '-115'),
    parseFloat(getEnvVariable('MAPBOX_CENTER_LAT') || '40'),
  ] as [number, number],
  defaultZoom: parseFloat(getEnvVariable('MAPBOX_ZOOM') || '4'),
  styleUrl: getEnvVariable('MAPBOX_STYLE') || 'mapbox://styles/pkulandh/cm9iyi6qq00jo01rce7xjcfay',
};
