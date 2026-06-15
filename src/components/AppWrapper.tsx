'use client';

import { useSplashScreen } from '@/hooks/useSplashScreen';
import SplashScreen from './SplashScreen';
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
      {isLoading && <SplashScreen onComplete={completeLoading} />}
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
