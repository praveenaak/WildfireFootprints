import React from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { routes } from './routes';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Routes component that uses the routes configuration
const Routes = () => {
  const element = useRoutes(routes);
  return element;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main>
          <Routes />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;