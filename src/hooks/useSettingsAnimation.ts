
import { useState, useEffect } from 'react';

export const useSettingsAnimation = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Simulate loading delay for animation
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Animation classes generator
  const getAnimationClass = (delay: number) => {
    return isLoaded 
      ? `opacity-100 translate-y-0 transition-all duration-500 delay-${delay}`
      : 'opacity-0 translate-y-8';
  };
  
  return { isLoaded, getAnimationClass };
};
