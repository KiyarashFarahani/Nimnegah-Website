'use client';

import { useState, useEffect } from 'react';

const SPLASH_KEY = 'splash-shown';

interface UseSplashScreenReturn {
  isLoading: boolean;
  completeLoading: () => void;
}

export const useSplashScreen = (): UseSplashScreenReturn => {
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !sessionStorage.getItem(SPLASH_KEY);
  });

  useEffect(() => {
    if (!isLoading) return;

    const preloadImages = async () => {
      const criticalImages = [
        '/images/profile/photo.jpg',
        '/images/landing.png',
      ];

      const imagePromises = criticalImages.map((url) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = () => resolve(undefined);
          img.src = url;
        });
      });

      try {
        await Promise.all(imagePromises);
      } catch (error) {
        console.warn('Some images failed to preload:', error);
      }
    };

    const preloadFonts = async () => {
      if (typeof window !== 'undefined' && 'fonts' in document) {
        try {
          await document.fonts.ready;
        } catch (error) {
          console.warn('Font loading failed:', error);
        }
      }
    };

    const initializeApp = async () => {
      await Promise.all([
        preloadImages(),
        preloadFonts(),
        new Promise(resolve => setTimeout(resolve, 3000))
      ]);
    };

    initializeApp();
  }, [isLoading]);

  const completeLoading = () => {
    sessionStorage.setItem(SPLASH_KEY, '1');
    setIsLoading(false);
  };

  return {
    isLoading,
    completeLoading,
  };
};
