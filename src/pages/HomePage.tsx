import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="home-page" style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      textAlign: 'center' 
    }}>
      <h1>Atmospheric Footprint Visualization Tool</h1>
      
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px',
        margin: '20px 0',
        textAlign: 'left'
      }}>
        <h2>Explore Wildfire Impacts on Air Quality</h2>
        <p>
          Welcome to the atmospheric footprint visualization tool. This application helps you 
          explore how wildfires contribute to air quality issues across Western North America.
        </p>
        <p>
          Our interactive map displays data for multiple locations, showing both:
        </p>
        <ul>
          <li><strong>Atmospheric Footprints:</strong> Where air comes from before reaching specific locations</li>
          <li><strong>PM2.5 Contributions:</strong> How wildfires impact particulate matter concentrations</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <Link to="/map">
          <button style={{
            padding: '12px 24px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}>
            View Interactive Map
          </button>
        </Link>
        
        <Link to="/about">
          <button style={{
            padding: '12px 24px',
            backgroundColor: '#f1f1f1',
            color: '#333',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginLeft: '15px'
          }}>
            Learn More
          </button>
        </Link>
      </div>
      
      <div style={{ marginTop: '40px', fontSize: '14px', color: '#666' }}>
        <p>
          Based on research by Wilmot et al. (2022) and Mallia et al. (2015)
        </p>
      </div>
    </div>
  );
};

export default HomePage;