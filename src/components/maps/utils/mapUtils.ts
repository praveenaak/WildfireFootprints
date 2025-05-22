import { Location } from '../types';

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
    "-122.8164 45.47019", "-123.0837 44.02631"
  ];
  
  return locationStrings.map(locString => {
    const [lngStr, latStr] = locString.split(" ");
    const lng = parseFloat(lngStr);
    const lat = parseFloat(latStr);
    
    const formattedLng = Math.abs(lng).toString().replace('.', '_');
    const formattedLat = lat.toString().replace('.', '_');
    
    let locationName = `${lat}°N, ${Math.abs(lng)}°W`;
    
    const tilesetId = `pkulandh._${formattedLng}_${formattedLat}_f_16_20_p1`;
    
    return { 
      lat, 
      lng, 
      tilesetId,
      layerName: 'footprints_20162020_p1',
      name: locationName,
      hasTimeSeriesData: true
    };
  });
};

const DEFAULT_DATE = '20160801';

export const formatDate = (dateString: string): string => {
  if (!dateString) {
    console.warn('Null or undefined date string provided to formatDate');
    return '08/01/2016'; // Default formatted date
  }
  
  if (dateString.length !== 8) {
    console.warn('Invalid date format in formatDate:', dateString);
    return '08/01/2016';
  }
  
  return `${dateString.substring(4, 6)}/${dateString.substring(6, 8)}/${dateString.substring(0, 4)}`;
};

// Format date for filter
export const formatDateForFilter = (dateString: string): string => {
  // Handle null or undefined input
  if (!dateString) {
    console.warn('Null or undefined date string provided');
    return '2016-08-01';
  }
  
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

export const formatInitialDate = (timestamp: string): string => {
  try {
    // Handle null or undefined input
    if (!timestamp) {
      console.warn('Null or undefined timestamp provided');
      return DEFAULT_DATE;
    }
    
    // Check if timestamp is already in YYYYMMDD format
    if (timestamp.length === 8 && !timestamp.includes('-') && !timestamp.includes(' ')) {
      return timestamp;
    }
    
    // Handle MM-DD-YYYY format
    const parts = timestamp.split(' ')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}${parts[0]}${parts[1]}`; // Format MM-DD-YYYY to YYYYMMDD
    }
    

    if (parts.length === 2) {
      return `2016${parts[0].padStart(2, '0')}${parts[1].padStart(2, '0')}`;
    }
    
    return DEFAULT_DATE; 
  } catch (e) {
    console.warn('Error parsing timestamp:', e);
    return DEFAULT_DATE;
  }
};

// Determine which data part (p1-p8) should be used based on date
export const determineFootprintCoordinate = (dateString: string): string => {
  // Handle null or undefined input
  if (!dateString) {
    console.warn('Null or undefined date string provided');
    return 'p1'; // Default to p1
  }
  
  // Parse date from YYYYMMDD format
  if (dateString.length !== 8) {
    console.warn('Invalid date format for determining special coordinate part:', dateString);
    return 'p1'; //Default to p1
  }
  
  const year = parseInt(dateString.substring(0, 4), 10);
  const month = parseInt(dateString.substring(4, 6), 10);
  const day = parseInt(dateString.substring(6, 8), 10);
  
  // Part 1: 2016-08-01 to 2016-09-07
  // Part 2: 2016-09-08 to 2017-08-14
  // Part 3: 2017-08-15 to 2017-09-21
  // Part 4: 2017-09-22 to 2018-08-28
  // Part 5: 2018-08-29 to 2019-08-04
  // Part 6: 2019-08-05 to 2019-09-11
  // Part 7: 2019-09-12 to 2020-08-18
  // Part 8: 2020-08-19 to 2020-10-01
  
  
  let partNum = 1;
  
  if (year === 2016) {
    if (month === 8) {
      partNum = 1;
    } else if (month === 9 && day <= 7) {
      partNum = 1;
    } else if (month === 9 && day >= 8) {
      partNum = 2;
    } else if (month >= 10) {
      partNum = 2;
    }
  } else if (year === 2017) {
    if (month < 8 || (month === 8 && day <= 14)) {
      partNum = 2;
    } else if (month === 8 && day >= 15) {
      partNum = 3;
    } else if (month === 9 && day <= 21) {
      partNum = 3;
    } else if (month === 9 && day >= 22) {
      partNum = 4;
    } else if (month >= 10) {
      partNum = 4;
    }
  } else if (year === 2018) {
    if (month < 8 || (month === 8 && day <= 28)) {
      partNum = 4;
    } else if (month === 8 && day >= 29) {
      partNum = 5;
    } else if (month >= 9) {
      partNum = 5;
    }
  } else if (year === 2019) {
    if (month < 8 || (month === 8 && day <= 4)) {
      partNum = 5;
    } else if (month === 8 && day >= 5) {
      partNum = 6;
    } else if (month === 9 && day <= 11) {
      partNum = 6;
    } else if (month === 9 && day >= 12) {
      partNum = 7;
    } else if (month >= 10) {
      partNum = 7;
    }
  } else if (year === 2020) {
    if (month < 8 || (month === 8 && day <= 18)) {
      partNum = 7;
    } else if (month === 8 && day >= 19 || month > 8) {
      partNum = 8;
    }
  }
  
  return `p${partNum}`;
};

// Determine which data part (p1-p3) should be used for PM2.5 data
export const determineConvolvedPart = (dateString: string): string => {
  // Handle null or undefined input
  if (!dateString) {
    console.warn('Null or undefined date string provided');
    return 'p1'; // Default to p1
  }
  
  // Parse date from YYYYMMDD format
  if (dateString.length !== 8) {
    console.warn('Invalid date format for determining special coordinate convolved part:', dateString);
    return 'p1'; // Default to p1
  }
  
  const year = parseInt(dateString.substring(0, 4), 10);
  const month = parseInt(dateString.substring(4, 6), 10);
  const day = parseInt(dateString.substring(6, 8), 10);
  
  // Part 1/3 date range: 2016-08-01 to 2017-09-08
  // Part 2/3 date range: 2017-09-09 to 2019-08-21
  // Part 3/3 date range: 2019-08-22 to 2020-10-01
  
  if (year === 2016 || (year === 2017 && (month < 9 || (month === 9 && day <= 8)))) {
    return 'p1';
  } else if ((year === 2017 && (month === 9 && day >= 9)) || 
             year === 2018 || 
             (year === 2019 && (month < 8 || (month === 8 && day <= 21)))) {
    return 'p2';
  } else {
    return 'p3';
  }
};

export const isSpecialCoordinate = (lng: number, lat: number): boolean => {
  return true; 
};

// Get the appropriate part determination function for a special coordinate
export const getSpecialCoordinatePartFunction = (lng: number, lat: number): ((date: string) => string) => {
  return determineFootprintCoordinate;
};

// Get the appropriate convolved part determination function for a special coordinate
export const getSpecialCoordinateConvolvedPartFunction = (lng: number, lat: number): ((date: string) => string) => {
  return determineConvolvedPart;
};

// Format a tileset ID for a special coordinate
export const formatSpecialCoordinateTilesetId = (lng: number, lat: number, partNum: number): string => {
  // Format lng and lat with full precision
  const formattedLng = Math.abs(lng).toString().replace('.', '_');
  const formattedLat = lat.toString().replace('.', '_');
  
  // For all coordinates, apply the special coordinate format with their own coordinates
  return `pkulandh._${formattedLng}_${formattedLat}_f_16_20_p${partNum}`;
};

// Format a PM2.5 tileset ID for a special coordinate
export const formatSpecialCoordinateConvolvedTilesetId = (lng: number, lat: number, partNum: number): string => {
  // Extract the integer part of longitude
  const absLng = Math.abs(lng);
  const lngInteger = Math.floor(absLng);
  
  // For coordinates -118.1305 34.66974, we want "346" for the lat portion
  // This appears to be the first 3 digits of the latitude
  const latStr = lat.toString().replace('.', '');
  const latFirstThreeDigits = latStr.substring(0, 3);
  
  // Create the source name with the format: pkulandh.c-118_346_p1 (example)
  return `pkulandh.c-${lngInteger}_${latFirstThreeDigits}_p${partNum}`;
};

// Get the layer name for convolved data
export const getConvolvedLayerName = (lng: number, lat: number, partNum: number): string => {
  // Format coordinates without any decimal points
  const absLng = Math.abs(lng);
  const lngStr = absLng.toString().replace('.', '');
  const latStr = lat.toString().replace('.', '');
  
  // Create the layer name following the convention: convolved_1181305_3466974_20162020_p{number}
  return `convolved_${lngStr}_${latStr}_20162020_p${partNum}`;
};