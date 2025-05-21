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
  // Center in western US
  defaultCenter: [
    parseFloat(getEnvVariable('MAPBOX_CENTER_LNG') || '-115'), 
    parseFloat(getEnvVariable('MAPBOX_CENTER_LAT') || '40')
  ] as [number, number],
  defaultZoom: parseFloat(getEnvVariable('MAPBOX_ZOOM') || '4.5'),
  styleUrl: getEnvVariable('MAPBOX_STYLE') || 'mapbox://styles/pkulandh/cm9iyi6qq00jo01rce7xjcfay'
};