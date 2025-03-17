// Convert coordinate string to a formatted coordinate object
export interface Coordinate {
    latitude: number;
    longitude: number;
    tilesetId: string;
    layerId: string;
  }
  
  // Format coordinates by restoring minus signs where needed
  export const parseCoordinates = (coordinateStrings: string[]): Coordinate[] => {
    return coordinateStrings.map(coordStr => {
      const [longStr, latStr] = coordStr.trim().split(' ');
      
      // Parse longitude and latitude as numbers
      const longitude = parseFloat(longStr);
      const latitude = parseFloat(latStr);
      
      // Format for tileset ID: remove minus sign and replace decimal with underscore
      const formattedLong = Math.abs(longitude).toString().replace('.', '_');
      const formattedLat = Math.abs(latitude).toString().replace('.', '_');
      
      // Create the tileset ID and layer ID
      const baseId = `wf_${formattedLong}_${formattedLat}`;
      const tilesetId = `pkulandh.${baseId}`;
      const layerId = baseId;
      
      return {
        latitude,
        longitude,
        tilesetId,
        layerId
      };
    });
  };
  
  // Predefined list of coordinates
  export const PREDEFINED_COORDINATES = [
    '-101.8504 33.59076',
    '-104.8286 38.84801',
    '-104.9876 39.75118',
    '-105.0797 40.57129',
    '-105.2634 40.0211',
    '-106.5012 31.76829',
    '-106.5852 35.1343',
    '-110.9823 32.29515',
    '-111.8722 40.73639',
    '-112.0958 33.50383',
    '-115.0529 36.0487',
    '-116.2703 43.63611',
    '-116.541 33.85275',
    '-117.1497 32.70149',
    '-117.3255 34.51096',
    '-117.331 33.67649',
    '-117.4263 47.69978',
    '-118.1305 34.66974',
    '-118.5284 34.38344',
    '-119.0626 35.35661',
    '-119.1432 34.25239',
    '-119.2042 46.21835',
    '-119.7164 36.81945',
    '-119.8077 39.52508',
    '-120.9942 37.64216',
    '-121.265 38.74643',
    '-121.2685 37.95074',
    '-121.8949 37.3485',
    '-122.3086 47.56824',
    '-122.7102 38.4435',
    '-122.8164 45.47019'
  ];
  
  // Get coordinates data
  export const getAllCoordinates = (): Coordinate[] => {
    return parseCoordinates(PREDEFINED_COORDINATES);
  };