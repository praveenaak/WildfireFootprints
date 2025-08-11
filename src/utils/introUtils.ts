const INTRO_STORAGE_KEY = 'wildfire-footprints-intro-seen';

// Secure localStorage access with error handling
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return null;
      }
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage access failed:', error);
      return null;
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('localStorage write failed:', error);
      return false;
    }
  },
  
  removeItem: (key: string): boolean => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('localStorage remove failed:', error);
      return false;
    }
  }
};

export const hasSeenIntro = (): boolean => {
  const value = safeLocalStorage.getItem(INTRO_STORAGE_KEY);
  return value === 'true';
};

export const markIntroSeen = (): void => {
  const success = safeLocalStorage.setItem(INTRO_STORAGE_KEY, 'true');
  if (!success) {
    console.warn('Failed to save intro preference');
  }
};

export const resetIntroPreference = (): void => {
  const success = safeLocalStorage.removeItem(INTRO_STORAGE_KEY);
  if (success) {
    console.log('Intro preference reset successfully');
  } else {
    console.warn('Failed to reset intro preference');
  }
};

// Remove global window assignment for security
// Users can access this function through the module import instead
