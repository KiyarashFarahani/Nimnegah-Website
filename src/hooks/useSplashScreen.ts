'use client';

import { useState, useEffect } from 'react';

const SPLASH_KEY = 'splash-shown';

interface UseSplashScreenReturn {
  isLoading: boolean;
  completeLoading: () => void;
}

// Mirror of `images.deviceSizes` / `images.imageSizes` in next.config.ts.
// Used to replicate the exact `/_next/image` URL that <Image> will request,
// so the splash preload warms the same browser cache the hero will read from
// (otherwise the raw /public path and the optimizer path are cached separately → double download).
const DEVICE_SIZES = [640, 768, 1024, 1280];
const IMAGE_SIZES = [16, 32, 48, 64, 96, 128, 256];

// Params must match the <Image> usage in Hero.tsx / SplashScreen.tsx exactly,
// otherwise the preloaded URL won't match the one <Image> later requests.
const HERO_IMAGE = { sizes: '(max-width: 1024px) 50vw, 55vw' } as const;
const LOGO_IMAGE = { sizes: '100vw' } as const;

const PROFILE_NUMS = ['2', '10', '4', '3', '5', '7', '8', '9'];

// Evaluate a `sizes` attribute against the current viewport, returning the
// matched layout width in CSS pixels (same logic the browser uses for srcset).
function resolveSizesWidth(sizes: string): number {
  const clauses = sizes
    .split(',')
    .map((clause) => clause.trim())
    .filter(Boolean);

  let length = '100vw';
  for (const clause of clauses) {
    const match = clause.match(/^(.*?)\s+(\S+)$/);
    if (!match) {
      length = clause;
      break;
    }
    const [, media, value] = match;
    if (!media.startsWith('(')) {
      length = value;
      break;
    }
    if (window.matchMedia(media).matches) {
      length = value;
      break;
    }
  }

  if (length.endsWith('vw')) return (parseFloat(length) / 100) * window.innerWidth;
  if (length.endsWith('vh')) return (parseFloat(length) / 100) * window.innerHeight;
  if (length.endsWith('px')) return parseFloat(length);
  return window.innerWidth;
}

// Build the same optimizer URL <Image> would generate for the current client:
// picks the smallest configured size >= layoutWidth * DPR, matching the
// `w` descriptor the browser selects from the srcset.
function getOptimizedSrc(src: string, sizes: string, quality = 75): string {
  const allSizes = [...DEVICE_SIZES, ...IMAGE_SIZES];
  const target = resolveSizesWidth(sizes) * (window.devicePixelRatio || 1);
  const candidates = allSizes.filter((size) => size >= target);
  const w = candidates.length ? Math.min(...candidates) : Math.max(...allSizes);
  return `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${quality}`;
}

function preload(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}

export const useSplashScreen = (): UseSplashScreenReturn => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem(SPLASH_KEY)) {
      setIsLoading(false);
      return;
    }

    // Preload the exact URLs <Image> will request. The logo is what the splash
    // actually shows, so it is awaited first — the splash never hides before it
    // is ready. The hero profile images are then warmed in parallel so they are
    // already in cache when Hero mounts (no second fetch from /public).
    const preloadImages = async () => {
      await preload(getOptimizedSrc('/images/logo/logo.webp', LOGO_IMAGE.sizes));
      await Promise.all(
        PROFILE_NUMS.map((n) =>
          preload(getOptimizedSrc(`/images/profile/${n}.webp`, HERO_IMAGE.sizes)),
        ),
      );
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
      minDelayTimer = setTimeout(resolve, 500);
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
