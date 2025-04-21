import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { colors, typography, spacing, shadows, borderRadius } from '../styles/theme';
import Container from '../components/common/Container';
import { Typography } from '../components/common/Typography';
import { Button } from '../components/common/Button';
import { MapIcon, Info } from 'lucide-react';

const HomeContainer = styled.div`
  padding: ${spacing.lg} 0;
  text-align: center;
`;

const HeroSection = styled.div`
  margin-bottom: ${spacing.xxl};
`;

const Title = styled(Typography)`
  margin-bottom: ${spacing.md};
  color: ${colors.olympicParkObsidian};
`;

const Subtitle = styled(Typography)`
  max-width: 600px;
  margin: 0 auto ${spacing.xl} auto;
  color: ${colors.textSecondary};
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: ${spacing.md};
  margin-top: ${spacing.lg};
`;

const FeaturesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${spacing.lg};
  margin-top: ${spacing.xl};
`;

const FeatureCard = styled.div`
  padding: ${spacing.lg};
  background-color: ${colors.snowbirdWhite};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px solid ${colors.borderSecondary};
`;

const IconContainer = styled.div`
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${colors.moabMahogany}10;
  border-radius: ${borderRadius.round};
  margin-bottom: ${spacing.md};
  color: ${colors.moabMahogany};
`;

const HomePage: React.FC = () => {
  return (
    <HomeContainer>
      <Container>
        <HeroSection>
          <Title variant="h1">Wildfire Footprint Visualization Tool</Title>
          <Subtitle variant="body">
            Explore the atmospheric impact of wildfires across the United States.
            This interactive tool visualizes footprint data and air quality metrics.
          </Subtitle>
          
          <ButtonContainer>
            <Button 
              variant="primary" 
              size="large"
              icon={<MapIcon size={20} />}
            >
              <Link to="/map" style={{ color: 'inherit', textDecoration: 'none' }}>
                View Interactive Map
              </Link>
            </Button>
            
            <Button 
              variant="secondary" 
              size="large"
              icon={<Info size={20} />}
            >
              <Link to="/about" style={{ color: 'inherit', textDecoration: 'none' }}>
                Learn More
              </Link>
            </Button>
          </ButtonContainer>
        </HeroSection>
        
        <Typography variant="h2">Key Features</Typography>
        
        <FeaturesContainer>
          <FeatureCard>
            <IconContainer>
              <MapIcon size={28} />
            </IconContainer>
            <Typography variant="h3">Interactive Visualization</Typography>
            <Typography variant="body">
              Explore wildfire atmospheric footprints across multiple locations with
              interactive controls and filters.
            </Typography>
          </FeatureCard>
          
          <FeatureCard>
            <IconContainer>
              <Info size={28} />
            </IconContainer>
            <Typography variant="h3">Air Quality Metrics</Typography>
            <Typography variant="body">
              View PM2.5 concentrations and understand the relationship between
              wildfires and air quality.
            </Typography>
          </FeatureCard>
          
          <FeatureCard>
            <IconContainer>
              <Info size={28} />
            </IconContainer>
            <Typography variant="h3">Time Series Data</Typography>
            <Typography variant="body">
              Select locations with time series data to animate changes in
              wildfire impacts over time.
            </Typography>
          </FeatureCard>
        </FeaturesContainer>
      </Container>
    </HomeContainer>
  );
};

export default HomePage;