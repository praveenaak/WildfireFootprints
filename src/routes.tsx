import { RouteObject } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import AboutPage from './pages/AboutPage';
import Layout from './components/layout/Layout';
import ErrorPage from './components/ErrorPage';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'map',
        element: <MapPage />
      },
      {
        path: 'about',
        element: <AboutPage />
      }
    ]
  },
  {
    path: '*',
    element: <ErrorPage />
  }
];