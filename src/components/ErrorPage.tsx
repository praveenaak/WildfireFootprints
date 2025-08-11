import React from 'react';
import { useNavigate, isRouteErrorResponse, useRouteError } from 'react-router-dom';

interface ErrorPageProps {
  error?: Error | null;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ error }) => {
  const navigate = useNavigate();
  const routeError = useRouteError();

  const is404 = isRouteErrorResponse(routeError) && routeError.status === 404;

  const errorMessage =
    error?.message ||
    (isRouteErrorResponse(routeError) ? routeError.statusText : 'An unexpected error occurred');

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center' as const,
      padding: '0 20px',
    },
    heading: {
      color: '#e53e3e',
      marginBottom: '16px',
    },
    message: {
      marginBottom: '24px',
      maxWidth: '600px',
    },
    actions: {
      display: 'flex',
      gap: '12px',
    },
    button: {
      padding: '10px 16px',
      backgroundColor: '#4a5568',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 500,
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>
        {is404 ? '404 - Page Not Found' : 'Oops! Something went wrong'}
      </h1>
      <p style={styles.message}>{errorMessage}</p>
      <div style={styles.actions}>
        <button style={styles.button} onClick={() => navigate('/')}>
          Return to Home
        </button>
        <button style={styles.button} onClick={() => window.location.reload()}>
          Refresh Page
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
