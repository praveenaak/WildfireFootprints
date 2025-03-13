import { RouteObject } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import AboutPage from './pages/AboutPage';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/map',
    element: <MapPage />
  },
  {
    path: '/about',
    element: <AboutPage />
  }
];