import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <h1>Atmospheric Data Visualizer</h1>
      <p>Welcome to the atmospheric footprint visualization tool.</p>
      
      <div style={{ marginTop: '20px' }}>
        <Link to="/map">
          <button>View Map</button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
