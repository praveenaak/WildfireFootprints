import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { routes } from './routes';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Component to conditionally render the layout
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isMapPage = location.pathname === '/map';

  // If on map page, render without header, footer, and padding
  if (isMapPage) {
    return <>{children}</>;
  }

  // Otherwise render with normal layout
  return (
    <>
      <Header />
      <main style={{ padding: '20px' }}>
        {children}
      </main>
      <Footer />
    </>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <AppLayout>
                  {route.element}
                </AppLayout>
              }
            />
          ))}
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;