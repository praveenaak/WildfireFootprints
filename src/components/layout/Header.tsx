import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header style={{ 
      padding: '20px',
      borderBottom: '1px solid #eee',
      display: 'flex',
      justifyContent: 'space-between'
    }}>
      <div className="logo">
        <Link to="/">Footprint Visualizer</Link>
      </div>
      
      <nav>
        <ul style={{ 
          display: 'flex',
          listStyle: 'none',
          gap: '20px'
        }}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/map">Map</Link></li>
          <li><Link to="/about">About</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
