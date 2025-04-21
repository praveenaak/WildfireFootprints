import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { routes } from './routes';
import GlobalStyles from './styles/GlobalStyles';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  const router = createBrowserRouter(routes);

  return (
    <ErrorBoundary>
      <GlobalStyles />
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
};

export default App;