import { Location } from '../types';

// Parse coordinates string into Location objects
export const parseCoordinates = (): Location[] => {
  const locationStrings = [
    "-101.8504 33.59076", "-104.8286 38.84801", "-104.9876 39.75118", 
    "-105.0797 40.57129", "-105.2634 40.0211", "-106.5012 31.76829", 
    "-106.5852 35.1343", "-110.9823 32.29515", "-111.8722 40.73639", 
    "-112.0958 33.50383", "-115.0529 36.0487", "-116.2703 43.63611", 
    "-116.541 33.85275", "-117.1497 32.70149", "-117.3255 34.51096", 
    "-117.331 33.67649", "-117.4263 47.69978", "-118.1305 34.66974", 
    "-118.5284 34.38344", "-119.0626 35.35661", "-119.1432 34.25239", 
    "-119.2042 46.21835", "-119.7164 36.81945", "-119.8077 39.52508", 
    "-120.9942 37.64216", "-121.265 38.74643", "-121.2685 37.95074", 
    "-121.8949 37.3485", "-122.3086 47.56824", "-122.7102 38.4435", 
    "-122.8164 45.47019"
  ];
  
  return locationStrings.map(locString => {
    const [lngStr, latStr] = locString.split(" ");
    const lng = parseFloat(lngStr);
    const lat = parseFloat(latStr);
    
    // Special case for the time series data location (Texas)
    if (lng === -101.8504 && lat === 33.59076) {
      return { 
        lat, 
        lng, 
        tilesetId: 'pkulandh.8veldf0e', 
        layerName: 'tmp_zu_cizy',
        name: 'Muleshoe, TX'
      };
    }
    
    // Special case for the second time series data location (Salt Lake City)
    if (lng === -111.8722 && lat === 40.73639) {
      return {
        lat,
        lng,
        tilesetId: 'pkulandh._111_8722_40_73639_f_16_p1',
        layerName: 'tmpk4z4r2mi_footprints_2016_p1',
        name: 'Salt Lake City, UT'
      };
    }
    
    // Format the tilesetId according to the convention for other locations
    const formattedLng = Math.abs(lng).toString().replace('.', '_');
    const formattedLat = lat.toString().replace('.', '_');
    const tilesetId = `pkulandh.wf_${formattedLng}_${formattedLat}`;
    const layerName = `wf_${formattedLng}_${formattedLat}`;
    
    return { 
      lat, 
      lng, 
      tilesetId, 
      layerName,
      name: `${lat.toFixed(4)}°N, ${Math.abs(lng).toFixed(4)}°W`
    };
  });
};

// Date constants
const DEFAULT_DATE = '20160801';

// Format date for display
export const formatDate = (dateString: string): string => {
  if (!dateString || dateString.length !== 8) {
    return '';
  }
  return `${dateString.substring(4, 6)}/${dateString.substring(6, 8)}/${dateString.substring(0, 4)}`;
};

// Format date for filter
export const formatDateForFilter = (dateString: string): string => {
  // Handle ISO format (YYYY-MM-DD)
  if (dateString.includes('-') && dateString.length === 10) {
    return dateString;
  }
  
  // Handle YYYYMMDD format
  if (dateString.length === 8) {
    return `${dateString.substring(0, 4)}-${dateString.substring(4, 6)}-${dateString.substring(6, 8)}`;
  }
  
  // Invalid format
  console.warn('Invalid date format:', dateString);
  return '2016-08-01';
};

// Parse initial timestamp
export const formatInitialDate = (timestamp: string): string => {
  try {
    // Check if timestamp is already in YYYYMMDD format
    if (timestamp.length === 8 && !timestamp.includes('-') && !timestamp.includes(' ')) {
      return timestamp;
    }
    
    // Handle MM-DD-YYYY format
    const parts = timestamp.split(' ')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}${parts[0]}${parts[1]}`; // Format MM-DD-YYYY to YYYYMMDD
    }
    
    return DEFAULT_DATE; // Fallback to default
  } catch (e) {
    console.warn('Error parsing timestamp:', e);
    return DEFAULT_DATE;
  }
};