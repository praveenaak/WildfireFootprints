import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer style={{ 
      padding: '20px',
      borderTop: '1px solid #eee',
      marginTop: '40px',
      textAlign: 'center'
    }}>
      <p>Atmospheric Footprint Visualization Tool &copy; {new Date().getFullYear()}</p>
    </footer>
  );
};

export default Footer;
