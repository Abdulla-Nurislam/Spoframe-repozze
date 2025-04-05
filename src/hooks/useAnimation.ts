import { AnimationControls, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

interface AnimationConfig {
  initial?: object;
  animate?: object;
  exit?: object;
  transition?: object;
}

export const defaultAnimations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },
  slideIn: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
    transition: { duration: 0.3 },
  },
  scaleIn: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
    transition: { duration: 0.3 },
  },
};

export const useCustomAnimation = (
  config: AnimationConfig = defaultAnimations.fadeIn
): [AnimationControls, () => void] => {
  const controls = useAnimation();

  const startAnimation = async () => {
    if (config.initial) {
      await controls.start(config.initial);
    }
    if (config.animate) {
      await controls.start(config.animate);
    }
  };

  useEffect(() => {
    startAnimation();
  }, []);

  return [controls, startAnimation];
}; 