import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="about-page">
      <h1>About This Project</h1>
      <p>This application visualizes atmospheric footprint data using Mapbox.</p>
      <p>The data represents where air at a specific location came from, and potential pollutant concentrations.</p>
    </div>
  );
};

export default AboutPage;
