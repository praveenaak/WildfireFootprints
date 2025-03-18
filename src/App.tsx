import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { routes } from './routes';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

function App() {
  // Get the base path for GitHub Pages deployment
  // When deployed to GitHub Pages, the app is served from /repository-name
  const basePath = process.env.NODE_ENV === 'production' 
    ? '/WildfireFootprints' 
    : '';

  return (
    <div className="app">
      <BrowserRouter basename={basePath}>
        <Header />
        <main>
          <Routes>
            {routes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                element={route.element}
              />
            ))}
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;