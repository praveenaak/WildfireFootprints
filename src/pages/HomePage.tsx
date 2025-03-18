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
      <h1>Wildfire Footprint Visualization Tool</h1>
      
     
      
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
      
     
    </div>
  );
};

export default HomePage;