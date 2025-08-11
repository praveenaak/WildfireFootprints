import React from 'react';
import styled from 'styled-components';
import { Play, Pause } from 'lucide-react';

interface AnimationButtonProps {
  isPlaying: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const AnimationButtonBase = styled.div`
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    
    &:hover {
      transform: none;
    }
  }
`;

const PauseButton = styled(AnimationButtonBase)`
  background-color: #b32d16;

  &:hover {
    background-color: #8b2010;
  }
`;

const PlayButton = styled(AnimationButtonBase)`
  background-color: #2d7638;

  &:hover {
    background-color: #1f5828;
  }
`;

export const AnimationButton: React.FC<AnimationButtonProps> = React.memo(({ 
  isPlaying, 
  onClick, 
  disabled = false 
}) => {
  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  if (isPlaying) {
    return (
      <PauseButton onClick={handleClick} style={{ opacity: disabled ? 0.6 : 1 }}>
        <Pause size={24} />
      </PauseButton>
    );
  }

  return (
    <PlayButton onClick={handleClick} style={{ opacity: disabled ? 0.6 : 1 }}>
      <Play size={24} />
    </PlayButton>
  );
});

AnimationButton.displayName = 'AnimationButton';