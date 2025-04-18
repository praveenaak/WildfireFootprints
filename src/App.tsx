import React, { useState } from 'react';
import IntroPage from './components/IntroPage';
import MultiLocationMapbox from './components/maps/MultiLocationMapbox';
import { MAPBOX_CONFIG } from './config/mapbox';
import GlobalStyles from './styles/GlobalStyles';

// Main App component that handles routing between intro and map
const App: React.FC = () => {
  const [showMap, setShowMap] = useState(false);

  const handleIntroComplete = () => {
    setShowMap(true);
  };

  if (!showMap) {
    return <IntroPage onComplete={handleIntroComplete} />;
  }

  return (
    <>
      <GlobalStyles />
      <MultiLocationMapbox
        accessToken={MAPBOX_CONFIG.accessToken}
        center={[-110.0, 39.5]}
        zoom={4.5}
      />
    </>
  );
};

export default App;