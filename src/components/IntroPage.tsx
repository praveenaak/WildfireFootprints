import React, { useState } from 'react';
import { Info, MapPin, MessageSquare, Play, X, Flame } from 'lucide-react';
import './IntroPage.css';

interface IntroPageProps {
  onComplete: () => void;
}

const IntroPage: React.FC<IntroPageProps> = ({ onComplete }) => {
  const [activeSection, setActiveSection] = useState('about');
  const [showDemoModal, setShowDemoModal] = useState(false);

  const handleOpenDemo = () => {
    setShowDemoModal(true);
  };

  const handleCloseDemo = () => {
    setShowDemoModal(false);
  };

  return (
    <div className="fixed inset-0 font-sora bg-cream flex flex-col">
      {/* Background gradient accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-sage/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-forest/5 rounded-full blur-3xl transform translate-x-1/4 translate-y-1/4"></div>
      </div>

      {/* Main container */}
      <div className="flex-1 w-full p-8 flex flex-col max-h-screen overflow-auto">
        {/* Header with title and tabs */}
        <header className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-8">
            <h1 className="text-5xl font-bold text-obsidian">
              <span className="text-mahogany">Wildfire</span> Footprints Visualization Tool
            </h1>
          </div>

          {/* Enter Map and Demo Buttons */}
          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={onComplete}
              className="bg-mahogany hover:bg-mahogany/90 text-white font-bold text-lg py-3 px-10 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Enter Map
            </button>

            <button
              onClick={handleOpenDemo}
              className="bg-sage hover:bg-sage/90 text-forest font-bold text-lg py-3 px-10 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              <Play className="w-5 h-5 mr-2" />
              Demo
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center mb-6">
            <div className="flex gap-4 p-1 bg-white/50 backdrop-blur-sm rounded-xl shadow-md">
              <button
                onClick={() => setActiveSection('about')}
                className={`py-3 px-8 rounded-lg flex items-center transition-all relative ${
                  activeSection === 'about'
                    ? 'bg-sage/30 text-forest font-semibold shadow-sm'
                    : 'text-forest/70 hover:bg-forest/5'
                }`}
              >
                <Info
                  className={`w-5 h-5 mr-3 ${activeSection === 'about' ? 'text-mahogany' : 'text-forest/60'}`}
                />
                <span>About</span>
                {activeSection === 'about' && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-mahogany rounded-b-lg"></div>
                )}
              </button>

              <button
                onClick={() => setActiveSection('feedback')}
                className={`py-3 px-8 rounded-lg flex items-center transition-all relative ${
                  activeSection === 'feedback'
                    ? 'bg-sage/30 text-forest font-semibold shadow-sm'
                    : 'text-forest/70 hover:bg-forest/5'
                }`}
              >
                <MessageSquare
                  className={`w-5 h-5 mr-3 ${activeSection === 'feedback' ? 'text-mahogany' : 'text-forest/60'}`}
                />
                <span>Feedback</span>
                {activeSection === 'feedback' && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-mahogany rounded-b-lg"></div>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Content container */}
        <div className="flex-1 mb-8 flex justify-center">
          {activeSection === 'about' && (
            <div className="max-w-4xl w-full">
              {/* About This Tool */}
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-forest mb-4">About This Tool</h2>
                <div className="h-1 w-20 bg-mahogany mx-auto mb-8"></div>

                <div className="bg-white/70 backdrop-blur-sm p-12 rounded-xl shadow-lg text-center">
                  <p className="text-xl text-forest-dark mb-6 font-redhat leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                    exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                    irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                    pariatur.
                  </p>

                  <p className="text-xl text-forest-dark font-redhat leading-relaxed">
                    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
                    mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit
                    voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab
                    illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'feedback' && (
            <div className="bg-white/70 backdrop-blur-sm p-8 rounded-xl shadow-lg max-w-4xl w-full">
              <h2 className="text-3xl font-bold text-forest mb-6">Submit Feedback</h2>
              <div className="h-1 w-20 bg-mahogany mb-6"></div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <MessageSquare className="w-6 h-6 text-forest mr-3" />
                  <h4 className="font-medium text-xl text-forest">GitHub Issues</h4>
                </div>

                <p className="text-forest-dark mb-6 font-redhat">
                  For bug reports, feature requests, and technical feedback, please submit a GitHub
                  issue. This helps us track and address your concerns effectively.
                </p>

                <div className="bg-cream border border-sage/50 rounded-lg p-5 flex items-center">
                  <div className="flex-1 text-forest-dark overflow-hidden text-ellipsis font-redhat">
                    github.com/wilkes-center/wildfire-footprints/issues
                  </div>
                  <a
                    href="https://github.com/wilkes-center/wildfire-footprints/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 px-5 py-2 bg-forest text-cream rounded-lg hover:bg-forest-dark transition-colors font-medium flex-shrink-0"
                  >
                    Submit Issue
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-4 px-8" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="text-center">
          <p className="text-white font-redhat text-sm">
            The Wilkes Center for Climate Science & Policy
          </p>
        </div>
      </footer>

      {/* Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-[90vw] h-[90vh] max-w-7xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-obsidian">Interactive Demo</h2>
              <button
                onClick={handleCloseDemo}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 p-6">
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Flame className="w-16 h-16 text-mahogany mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-forest mb-2">Demo Coming Soon</h3>
                  <p className="text-forest-dark font-redhat">
                    An interactive demo of the wildfire footprint visualization tool will be
                    available here.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntroPage;
