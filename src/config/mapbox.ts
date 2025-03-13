// Safe access to environment variables for CRA
const getEnvVariable = (key: string): string => {
  const fullKey = `REACT_APP_${key}`;
  if (process.env[fullKey] === undefined) {
    console.warn(`Environment variable ${fullKey} is not defined`);
    return '';
  }
  return process.env[fullKey] as string;
};

export const MAPBOX_CONFIG = {
  accessToken: getEnvVariable('MAPBOX_TOKEN') || 'your_default_token_here',
  defaultTileset: getEnvVariable('MAPBOX_TILESET') || 'pkulandh.29zewnmz',
  // Default center coordinates - these look unusual, check if [-111, 37] is meant instead
  defaultCenter: [
    parseFloat(getEnvVariable('MAPBOX_CENTER_LNG') || '-111'), 
    parseFloat(getEnvVariable('MAPBOX_CENTER_LAT') || '37')
  ] as [number, number],
  defaultZoom: parseInt(getEnvVariable('MAPBOX_ZOOM') || '5'),
  styleUrl: getEnvVariable('MAPBOX_STYLE') || 'mapbox://styles/mapbox/dark-v11'
};