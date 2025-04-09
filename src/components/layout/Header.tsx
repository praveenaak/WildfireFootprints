import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header style={{ 
      padding: '16px 24px',
      borderBottom: '1px solid rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    }}>
      <div className="logo" style={{ fontWeight: 700, fontSize: '22px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#2c3e50' }}>
          Footprint Visualizer
        </Link>
      </div>
      
      <nav>
        <ul style={{ 
          display: 'flex',
          listStyle: 'none',
          gap: '24px',
          margin: 0,
          padding: 0
        }}>
          <li><Link to="/" style={{ textDecoration: 'none', color: '#2c3e50', fontWeight: 500 }}>Home</Link></li>
          <li><Link to="/map" style={{ textDecoration: 'none', color: '#2c3e50', fontWeight: 500 }}>Map</Link></li>
          <li><Link to="/about" style={{ textDecoration: 'none', color: '#2c3e50', fontWeight: 500 }}>About</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
