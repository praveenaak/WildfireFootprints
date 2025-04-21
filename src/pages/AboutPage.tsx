import React from 'react';
import styled from 'styled-components';
import { colors, typography, spacing, borderRadius } from '../styles/theme';
import Container from '../components/common/Container';
import { Typography } from '../components/common/Typography';

const AboutContainer = styled.div`
  padding: ${spacing.lg} 0;
`;

const Section = styled.section`
  margin-bottom: ${spacing.xl};
`;

const SectionTitle = styled(Typography)`
  position: relative;
  padding-bottom: ${spacing.sm};
  margin-bottom: ${spacing.md};
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background-color: ${colors.moabMahogany};
  }
`;

const AboutPage: React.FC = () => {
  return (
    <AboutContainer>
      <Container maxWidth="lg">
        <SectionTitle variant="h2">About</SectionTitle>
      </Container>
    </AboutContainer>
  );
};

export default AboutPage;