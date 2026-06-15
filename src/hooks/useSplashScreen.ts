'use client';

import { useState, useEffect } from 'react';
import { characterSets } from '@/data/characterSets';
import { storyboardSets } from '@/data/storyboards';

interface UseSplashScreenReturn {
  isLoading: boolean;
  completeLoading: () => void;
}

export const useSplashScreen = (): UseSplashScreenReturn => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const preloadImages = async () => {
      const criticalImages = [
        '/images/profile/photo.jpg',
        '/images/landing.png',
      ];

      const characterImages = characterSets.flatMap(set =>
        set.images.map(img => img.src)
      );

      const storyboardImages = storyboardSets.flatMap(set =>
        set.images.map(img => img.src)
      );

      const allImages = [...criticalImages, ...characterImages, ...storyboardImages];

      const imagePromises = allImages.map((url) => {
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
  }, []);

  const completeLoading = () => {
    setIsLoading(false);
  };

  return {
    isLoading,
    completeLoading,
  };
};
