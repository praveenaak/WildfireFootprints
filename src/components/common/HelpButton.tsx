import React from 'react';
import styled from 'styled-components';
import { HelpCircle } from 'lucide-react';
import { colors, shadows, transitions } from '../../styles/theme';

const HelpButtonContainer = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: ${colors.moabMahogany};
  border: none;
  box-shadow: ${shadows.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: ${transitions.medium};
  z-index: 1000;

  &:hover {
    background-color: ${colors.rockyMountainRust};
    transform: scale(1.1);
    box-shadow: ${shadows.xl};
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    color: white;
    width: 24px;
    height: 24px;
  }
`;

const Tooltip = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  padding: 8px 12px;
  background-color: ${colors.olympicParkObsidian};
  color: white;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: ${transitions.fast};

  ${HelpButtonContainer}:hover & {
    opacity: 1;
    visibility: visible;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 100%;
    right: 16px;
    border: 4px solid transparent;
    border-bottom-color: ${colors.olympicParkObsidian};
  }
`;

interface HelpButtonProps {
  onClick: () => void;
}

const HelpButton: React.FC<HelpButtonProps> = ({ onClick }) => {
  return (
    <HelpButtonContainer onClick={onClick} aria-label="Show help and intro">
      <HelpCircle />
      <Tooltip>Show Intro</Tooltip>
    </HelpButtonContainer>
  );
};

export default HelpButton;
