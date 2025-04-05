import { useEffect } from 'react';

interface UseScrollEffectOptions {
  threshold?: number;
  onScroll?: (scrolled: boolean) => void;
}

export const useScrollEffect = ({
  threshold = 50,
  onScroll = (scrolled: boolean) => {
    const header = document.querySelector('header');
    if (header) {
      if (scrolled) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  },
}: UseScrollEffectOptions = {}) => {
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > threshold;
      onScroll(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold, onScroll]);
}; 