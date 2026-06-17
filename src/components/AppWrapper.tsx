'use client';

import { useEffect, useState } from 'react';
import { useSplashScreen } from '@/hooks/useSplashScreen';
import SplashScreen from './SplashScreen';
import { AnimatePresence } from 'framer-motion';
import { useSplash } from '@/contexts/SplashContext';
import Hero from './Hero';
import FeaturedCourses from './FeaturedCourses';
import AboutAcademy from './AboutAcademy';
import CTA from './CTA';

export default function AppWrapper() {
  const { isLoading, completeLoading } = useSplashScreen();
  const { splashDone, completeSplash } = useSplash();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !splashDone) {
      completeSplash();
    }
  }, [mounted, isLoading, splashDone, completeSplash]);

  const handleSplashComplete = () => {
    completeLoading();
    completeSplash();
  };

  const showSplash = mounted && isLoading;
  const contentReady = mounted && !isLoading;

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>
      <main className={`min-h-screen transition-opacity duration-1000 ${contentReady ? 'opacity-100' : 'opacity-0'}`}>
        <Hero />
        <FeaturedCourses />
        <AboutAcademy />
        <CTA />
      </main>
    </>
  );
}
