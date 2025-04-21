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
  // Center in western North America to show all marker locations
  defaultCenter: [
    parseFloat(getEnvVariable('MAPBOX_CENTER_LNG') || '-111'), 
    parseFloat(getEnvVariable('MAPBOX_CENTER_LAT') || '39')
  ] as [number, number],
  defaultZoom: parseInt(getEnvVariable('MAPBOX_ZOOM') || '4'),
  styleUrl: getEnvVariable('MAPBOX_STYLE') || 'mapbox://styles/pkulandh/cm9iyi6qq00jo01rce7xjcfay'
};