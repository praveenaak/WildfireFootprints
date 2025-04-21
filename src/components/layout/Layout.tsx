import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Header from './Header';
import Footer from './Footer';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const ContentContainer = styled.main`
  flex: 1;
`;

const Layout: React.FC = () => {
  const location = useLocation();
  const isMapPage = location.pathname === '/map';
  
  return (
    <PageContainer>
      {!isMapPage && <Header />}
      <ContentContainer>
        <Outlet />
      </ContentContainer>
      {!isMapPage && <Footer />}
    </PageContainer>
  );
};

export default Layout;