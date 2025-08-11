const INTRO_STORAGE_KEY = 'wildfire-footprints-intro-seen';

export const hasSeenIntro = (): boolean => {
  return localStorage.getItem(INTRO_STORAGE_KEY) === 'true';
};

export const markIntroSeen = (): void => {
  localStorage.setItem(INTRO_STORAGE_KEY, 'true');
};

export const resetIntroPreference = (): void => {
  localStorage.removeItem(INTRO_STORAGE_KEY);
  console.log('Intro preference reset (note: intro is now always the landing page)');
};

if (typeof window !== 'undefined') {
  (window as any).resetIntro = resetIntroPreference;
} 