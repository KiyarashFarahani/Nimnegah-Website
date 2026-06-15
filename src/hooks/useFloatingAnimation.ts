import { useAnimation } from 'framer-motion';

interface FloatingAnimationOptions {
  duration?: number;
  intensity?: number;
  delay?: number;
  ease?: string;
}

export const useFloatingAnimation = (options: FloatingAnimationOptions = {}) => {
  const {
    duration = 4,
    intensity = 20,
    delay = 0
  } = options;

  const controls = useAnimation();

  const startFloating = () => {
    controls.start({
      y: [0, -intensity * 0.6, 0, intensity * 0.6, 0],
      x: [intensity * 0.3, 0, -intensity * 0.3, 0, intensity * 0.3],
      rotate: [0, 0.5, 0, -0.5, 0],
      transition: {
        duration: duration * 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
        times: [0, 0.25, 0.5, 0.75, 1]
      }
    });
  };

  const stopFloating = () => {
    controls.stop();
    controls.set({
      y: 0,
      x: 0,
      rotate: 0
    });
  };

  return {
    controls,
    startFloating,
    stopFloating
  };
};
