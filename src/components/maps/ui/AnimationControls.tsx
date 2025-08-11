import React from 'react';
import styled from 'styled-components';
import { Play, Pause } from 'lucide-react';
import { colors } from '../../../styles/theme';

interface AnimationControlsProps {
  isPlaying: boolean;
  onToggle: () => void;
}

const AnimationButton = styled.div`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  border: 3px solid white;
  z-index: 10000;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const PauseButton = styled(AnimationButton)`
  background-color: ${colors.moabMahogany};

  &:hover {
    background-color: ${colors.rockyMountainRust};
  }
`;

const PlayButton = styled(AnimationButton)`
  background-color: ${colors.greatSaltLakeGreen};

  &:hover {
    background-color: ${colors.spiralJettySage};
  }
`;

export const AnimationControls: React.FC<AnimationControlsProps> = ({ isPlaying, onToggle }) => {
  return isPlaying ? (
    <PauseButton onClick={onToggle}>
      <Pause size={24} />
    </PauseButton>
  ) : (
    <PlayButton onClick={onToggle}>
      <Play size={24} />
    </PlayButton>
  );
};
