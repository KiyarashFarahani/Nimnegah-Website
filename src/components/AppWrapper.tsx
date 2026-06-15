'use client';

import { useSplashScreen } from '@/hooks/useSplashScreen';
import SplashScreen from './SplashScreen';
import { AnimatePresence } from 'framer-motion';
import Navigation from './Navigation';
import Hero from './Hero';
import ImageGallery from './ImageGallery';
import Galleries from './Galleries';
import About from './About';
import Contact from './Contact';
import Footer from './Footer';
import { storyboardSets } from '@/data/storyboards';
import { gallerySets } from '@/data/galleries';

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
        <ImageGallery storyboardSets={storyboardSets} />
        <Galleries gallerySets={gallerySets} />
        <About />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
