'use client';

import { useState, useEffect } from 'react';

const SPLASH_KEY = 'splash-shown';

interface UseSplashScreenReturn {
  isLoading: boolean;
  completeLoading: () => void;
}

export const useSplashScreen = (): UseSplashScreenReturn => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem(SPLASH_KEY)) {
      setIsLoading(false);
      return;
    }

    const preloadImages = async () => {
        const criticalImages = [
            '/images/logo/logo.webp',
            '/images/profile/3.webp'
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
      if ('fonts' in document) {
        try {
          await document.fonts.ready;
        } catch (error) {
          console.warn('Font loading failed:', error);
        }
      }
    };

    const start = performance.now();
    let minDelayTimer: ReturnType<typeof setTimeout> | null = null;
    let maxDelayTimer: ReturnType<typeof setTimeout> | null = null;

    const minDelay = new Promise<void>((resolve) => {
      minDelayTimer = setTimeout(resolve, 1000);
    });
    const maxDelay = new Promise<void>((resolve) => {
      maxDelayTimer = setTimeout(resolve, 2000);
    });

    const initializeApp = async () => {
      await Promise.race([
        Promise.all([preloadImages(), preloadFonts(), minDelay]),
        maxDelay,
      ]);
      if (minDelayTimer) clearTimeout(minDelayTimer);
      if (maxDelayTimer) clearTimeout(maxDelayTimer);
      if (process.env.NODE_ENV !== 'production') {
        console.debug(`splash visible for ${Math.round(performance.now() - start)}ms`);
      }
      sessionStorage.setItem(SPLASH_KEY, '1');
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  const completeLoading = () => {
    sessionStorage.setItem(SPLASH_KEY, '1');
    setIsLoading(false);
  };

  return {
    isLoading,
    completeLoading,
  };
};
