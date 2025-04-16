import React, { useEffect } from 'react';
import './IntroPage.css';
import { MapPin, Clock, Wind, AlertTriangle, BarChart2, Github } from 'lucide-react';

interface IntroPageProps {
  onComplete: () => void;
}

const IntroPage: React.FC<IntroPageProps> = ({ onComplete }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "//gc.zgo.at/count.js";
    script.async = true;
    script.dataset.goatcounter = "https://wilkes-wildfire-smoke.goatcounter.com/count";
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="intro-page">
      <div className="intro-content">
        <div className="header-section">
          <div className="title-wrapper">
            <h1>
              <span>Wildfire</span> Smoke Map Tool
            </h1>
            <div className="title-underline"></div>
          </div>
          
          <button 
            className="enter-button"
            onClick={onComplete}
          >
            <MapPin className="mr-2" size={20} />
            Explore Map
          </button>
        </div>
        
        <div className="intro-section">
          <h2>
            <Wind className="mr-2 text-mahogany" size={24} />
             Smoke Tracking
          </h2>
          <p>

          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="icon-container">
                <BarChart2 size={24} className="text-green" />
              </div>
              <p></p>
            </div>
            <div className="feature-card">
              <div className="icon-container">
                <Clock size={24} className="text-sage" />
              </div>
              <p></p>
            </div>
            <div className="feature-card">
              <div className="icon-container">
                <AlertTriangle size={24} className="text-mahogany" />
              </div>
              <p>Real-time air quality alerts and health recommendations</p>
            </div>
          </div>
        </div>
        
        <div className="intro-section">
          <h2>
            <MapPin className="mr-2 text-green" size={24} />
            Interactive Features
          </h2>
          <ul className="list-disc pl-5">

          </ul>
        </div>
        
        
        
        <div className="intro-section">
          <h2>
            <Github className="mr-2 text-blue" size={24} />
            Open Source & Feedback
          </h2>
          <p>
            This tool is part of an open-source initiative by the Wilkes Center for Climate Science & Policy. 
            We welcome contributions and feedback to improve our service.
          </p>
          <div className="mt-4 flex items-center">
            <Github size={20} className="mr-2 text-obsidian" />
            <a 
              href="https://github.com/wilkes-center/wildfire-smoke-tool/issues" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-obsidian hover:text-sage"
            >
              Submit feedback: github.com/wilkes-center/wildfire-smoke-tool/issues
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroPage; 