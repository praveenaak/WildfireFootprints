import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ErrorBoundary from './components/ErrorBoundary';
import { validateEnvironment } from './utils/envValidation';

// Validate environment before starting the app
const envValidation = validateEnvironment();
if (!envValidation.isValid) {
  console.error('❌ Application startup failed due to environment validation errors:');
  envValidation.errors.forEach(error => console.error(`  • ${error}`));
  
  // Render error message instead of the app
  const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
  root.render(
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif', 
      backgroundColor: '#fee', 
      border: '1px solid #fcc',
      borderRadius: '8px',
      margin: '20px'
    }}>
      <h2 style={{ color: '#c33' }}>Configuration Error</h2>
      <p>The application cannot start due to missing or invalid configuration:</p>
      <ul>
        {envValidation.errors.map((error, index) => (
          <li key={index} style={{ color: '#c33', marginBottom: '4px' }}>{error}</li>
        ))}
      </ul>
      <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
        Please check your environment configuration and reload the page.
      </p>
    </div>
  );
} else {
  const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}

reportWebVitals();
