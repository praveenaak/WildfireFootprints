import React from 'react';
import styled from 'styled-components';
import { colors, typography, spacing } from '../../styles/theme';
import { Typography } from '../common/Typography';

const FooterContainer = styled.footer`
  padding: ${spacing.md};
  border-top: 1px solid ${colors.borderSecondary};
  background-color: ${colors.snowbirdWhite};
  text-align: center;
  margin-top: ${spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;

const FooterLogoContainer = styled.div`
  max-width: 200px;
  margin: 0 auto ${spacing.md} auto;
`;

const FooterLogo = styled.img`
  width: 100%;
`;

const CopyrightText = styled(Typography)`
  margin: 0;
  font-size: 11px;
  color: ${colors.textSecondary};
`;

const LinksContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: ${spacing.md};
  margin-bottom: ${spacing.md};
  
  a {
    color: ${colors.moabMahogany};
    text-decoration: none;
    font-size: 12px;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <FooterLogoContainer>
        {/* You can add a logo image here if needed */}
      </FooterLogoContainer>
      
      <LinksContainer>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Use</a>
        <a href="#">Contact Us</a>
      </LinksContainer>
      
      <CopyrightText variant="small">
        © {currentYear} Wildfire Footprint Visualizer. All rights reserved.
      </CopyrightText>
      
      <CopyrightText variant="small">
        Developed by the Wilkes Center for Climate Science & Policy
      </CopyrightText>
    </FooterContainer>
  );
};

export default Footer;