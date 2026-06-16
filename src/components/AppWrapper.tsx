'use client';

import { useSplashScreen } from '@/hooks/useSplashScreen';
import SplashScreen from './SplashScreen';
import { AnimatePresence } from 'framer-motion';
import Navigation from './Navigation';
import Hero from './Hero';
import FeaturedCourses from './FeaturedCourses';
import AboutAcademy from './AboutAcademy';
import CTA from './CTA';
import Footer from './Footer';

export default function AppWrapper() {
  const { isLoading, completeLoading } = useSplashScreen();

  return (
    <>
      <AnimatePresence>
        {isLoading && <SplashScreen onComplete={completeLoading} />}
      </AnimatePresence>
      <main className={`min-h-screen transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        <Navigation />
        <Hero />
        <FeaturedCourses />
        <AboutAcademy />
        <CTA />
        <Footer />
      </main>
    </>
  );
}
