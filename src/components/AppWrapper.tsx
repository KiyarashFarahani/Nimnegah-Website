'use client';

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
  const { completeSplash } = useSplash();

  const handleSplashComplete = () => {
    completeLoading();
    completeSplash();
  };

  return (
    <>
      <AnimatePresence>
        {isLoading && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>
      <main className={`min-h-screen transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        <Hero />
        <FeaturedCourses />
        <AboutAcademy />
        <CTA />
      </main>
    </>
  );
}
