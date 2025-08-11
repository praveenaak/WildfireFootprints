import React, { useState } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { routes } from './routes';
import GlobalStyles from './styles/GlobalStyles';
import ErrorBoundary from './components/ErrorBoundary';
import IntroPage from './components/IntroPage';
import HelpButton from './components/common/HelpButton';

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const router = createBrowserRouter(routes);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  const handleShowIntro = () => {
    setShowIntro(true);
  };

  if (showIntro) {
    return (
      <ErrorBoundary>
        <GlobalStyles />
        <IntroPage onComplete={handleIntroComplete} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <GlobalStyles />
      <RouterProvider router={router} />
      <HelpButton onClick={handleShowIntro} />
    </ErrorBoundary>
  );
};

export default App;
