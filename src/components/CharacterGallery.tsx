'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface CharacterImage {
  id: string;
  src: string;
  alt: string;
}

interface CharacterSet {
  id: string;
  name: string;
  description: string;
  images: CharacterImage[];
}

interface CharacterGalleryProps {
  characterSets: CharacterSet[];
}

const CharacterGallery = ({ characterSets }: CharacterGalleryProps) => {
  const [selectedImages, setSelectedImages] = useState<{ [key: string]: number }>({});
  const [autoSlideStates, setAutoSlideStates] = useState<{ [key: string]: boolean }>({});
  const [slideDirections, setSlideDirections] = useState<{ [key: string]: 'next' | 'prev' | 'auto' }>({});
  const [isTransitioning, setIsTransitioning] = useState<{ [key: string]: boolean }>({});
  const intervalRefs = useRef<{ [key: string]: NodeJS.Timeout | null }>({});

  const sectionColors: { [key: string]: { primary: string; secondary: string; tertiary: string } } = {
    'character-1': { primary: '#8a7a6b', secondary: '#7a6b5d', tertiary: '#6a5c4f' },
    'character-2': { primary: '#c49a5a', secondary: '#b08a4f', tertiary: '#9c7a44' },
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const blendColors = (color1: string, color2: string, ratio: number = 0.5) => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    if (!rgb1 || !rgb2) return color1;
    const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * ratio);
    const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * ratio);
    const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * ratio);
    return rgbToHex(r, g, b);
  };

  const getTransitionColor = (currentIndex: number, nextIndex: number) => {
    if (nextIndex >= characterSets.length) return '#ffffff';
    const currentColors = sectionColors[characterSets[currentIndex].id];
    const nextColors = sectionColors[characterSets[nextIndex].id];
    if (!currentColors || !nextColors) return '#ffffff';
    return blendColors(currentColors.tertiary, nextColors.primary, 0.5);
  };

  useEffect(() => {
    const initialSelectedImages: { [key: string]: number } = {};
    const initialAutoSlideStates: { [key: string]: boolean } = {};
    const initialSlideDirections: { [key: string]: 'next' | 'prev' | 'auto' } = {};
    const initialIsTransitioning: { [key: string]: boolean } = {};

    characterSets.forEach(set => {
      initialSelectedImages[set.id] = 0;
      initialAutoSlideStates[set.id] = true;
      initialSlideDirections[set.id] = 'auto';
      initialIsTransitioning[set.id] = false;
    });

    setSelectedImages(initialSelectedImages);
    setAutoSlideStates(initialAutoSlideStates);
    setSlideDirections(initialSlideDirections);
    setIsTransitioning(initialIsTransitioning);
  }, [characterSets]);

  const selectImage = useCallback((setId: string, index: number, direction: 'next' | 'prev' | 'auto' = 'auto') => {
    setIsTransitioning(prev => ({ ...prev, [setId]: true }));
    setSelectedImages(prev => ({ ...prev, [setId]: index }));
    setAutoSlideStates(prev => ({ ...prev, [setId]: false }));
    setSlideDirections(prev => ({ ...prev, [setId]: direction }));
    setTimeout(() => {
      setIsTransitioning(prev => ({ ...prev, [setId]: false }));
    }, 350);
  }, []);

  const navigateToNext = useCallback((setId: string) => {
    const currentIndex = selectedImages[setId] || 0;
    const characterSet = characterSets.find(set => set.id === setId);
    if (characterSet) {
      const nextIndex = (currentIndex + 1) % characterSet.images.length;
      selectImage(setId, nextIndex, 'next');
    }
  }, [selectedImages, characterSets, selectImage]);

  const navigateToPrev = useCallback((setId: string) => {
    const currentIndex = selectedImages[setId] || 0;
    const characterSet = characterSets.find(set => set.id === setId);
    if (characterSet) {
      const prevIndex = (currentIndex - 1 + characterSet.images.length) % characterSet.images.length;
      selectImage(setId, prevIndex, 'prev');
    }
  }, [selectedImages, characterSets, selectImage]);

  useEffect(() => {
    const currentIntervalRefs = intervalRefs.current;

    characterSets.forEach(set => {
      if (autoSlideStates[set.id] && set.images.length > 1) {
        currentIntervalRefs[set.id] = setInterval(() => {
          const currentIndex = selectedImages[set.id] || 0;
          const nextIndex = (currentIndex + 1) % set.images.length;
          selectImage(set.id, nextIndex, 'auto');
        }, 3000);
      } else {
        if (currentIntervalRefs[set.id]) {
          clearInterval(currentIntervalRefs[set.id] as NodeJS.Timeout);
          currentIntervalRefs[set.id] = null;
        }
      }
    });

    return () => {
      Object.values(currentIntervalRefs).forEach(interval => {
        if (interval) clearInterval(interval as NodeJS.Timeout);
      });
    };
  }, [autoSlideStates, characterSets, selectedImages, selectImage]);

  const handleMouseEnter = (setId: string) => {
    setAutoSlideStates(prev => ({ ...prev, [setId]: false }));
  };

  const handleMouseLeave = (setId: string) => {
    setAutoSlideStates(prev => ({ ...prev, [setId]: true }));
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        const activeGallery = document.querySelector('.gallery-container:hover');
        if (activeGallery) {
          const setId = activeGallery.getAttribute('data-set-id');
          if (setId && characterSets.find(set => set.id === setId)) {
            if (event.key === 'ArrowLeft') {
              navigateToPrev(setId);
            } else {
              navigateToNext(setId);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImages, characterSets, navigateToNext, navigateToPrev]);

  return (
    <section id="character-gallery" className="relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center py-20 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-siavash font-bold text-gray-900 mb-6">
            Characters
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-slate-400 to-slate-500 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 font-editorial-pro max-w-3xl mx-auto">
            A collection of character designs, each telling its own unique story
          </p>
        </div>
      </motion.div>

      <div className="relative">
        {characterSets.map((characterSet, setIndex) => {
          const colors = sectionColors[characterSet.id] || { primary: '#666', secondary: '#555', tertiary: '#444' };
          const isLast = setIndex === characterSets.length - 1;
          const isFirst = setIndex === 0;

          const topTransitionColor = isFirst ? '#ffffff' : getTransitionColor(setIndex - 1, setIndex);
          const bottomTransitionColor = isLast ? '#ffffff' : getTransitionColor(setIndex, setIndex + 1);

          const topRgb = hexToRgb(topTransitionColor);
          const bottomRgb = hexToRgb(bottomTransitionColor);

          return (
            <div
              key={characterSet.id}
              className="relative w-full"
              style={{
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.tertiary} 100%)`
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-16 z-20 pointer-events-none"
                style={{
                  background: isFirst
                    ? `linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.6) 40%, rgba(255,255,255,0.2) 70%, transparent 100%)`
                    : topRgb
                      ? `linear-gradient(to bottom, rgba(${topRgb.r},${topRgb.g},${topRgb.b},1) 0%, rgba(${topRgb.r},${topRgb.g},${topRgb.b},0.6) 40%, rgba(${topRgb.r},${topRgb.g},${topRgb.b},0.2) 70%, transparent 100%)`
                      : 'transparent'
                }}
              ></div>

              <div
                className="absolute bottom-0 left-0 right-0 h-16 z-20 pointer-events-none"
                style={{
                  background: isLast
                    ? `linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.6) 40%, rgba(255,255,255,0.2) 70%, transparent 100%)`
                    : bottomRgb
                      ? `linear-gradient(to top, rgba(${bottomRgb.r},${bottomRgb.g},${bottomRgb.b},1) 0%, rgba(${bottomRgb.r},${bottomRgb.g},${bottomRgb.b},0.6) 40%, rgba(${bottomRgb.r},${bottomRgb.g},${bottomRgb.b},0.2) 70%, transparent 100%)`
                      : 'transparent'
                }}
              ></div>

              <div className="relative z-10 py-32 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-siavash font-bold text-white mb-2">
                      {characterSet.name}
                    </h3>
                  </div>

                  <div
                    className="gallery-container flex flex-col lg:flex-row gap-6 items-start"
                    data-set-id={characterSet.id}
                    onMouseEnter={() => handleMouseEnter(characterSet.id)}
                    onMouseLeave={() => handleMouseLeave(characterSet.id)}
                  >
                    {/* Left: Thumbnail Column */}
                    <div className="hidden lg:block flex-shrink-0">
                      <div className="space-y-2 max-h-[32rem] overflow-y-auto scrollbar-none">
                        {characterSet.images.map((image, index) => (
                          <motion.div
                            key={image.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`cursor-pointer rounded-lg overflow-hidden transition-all duration-300 ${
                              selectedImages[characterSet.id] === index
                                ? 'ring-2 ring-white shadow-lg'
                                : 'opacity-60 hover:opacity-100'
                            }`}
                            onClick={() => selectImage(characterSet.id, index)}
                          >
                            <div className="relative w-20 h-20">
                              <Image
                                src={image.src}
                                alt={image.alt}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Center: Main Image */}
                    <div className="flex-1 w-full">
                      <div className="relative aspect-[4/3] max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`${characterSet.id}-${selectedImages[characterSet.id]}`}
                            initial={{
                              opacity: 0,
                              x: slideDirections[characterSet.id] === 'next' ? 100 : slideDirections[characterSet.id] === 'prev' ? -100 : 0
                            }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{
                              opacity: 0,
                              x: slideDirections[characterSet.id] === 'next' ? -100 : slideDirections[characterSet.id] === 'prev' ? 100 : 0
                            }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="absolute inset-0"
                          >
                            <Image
                              src={characterSet.images[selectedImages[characterSet.id] || 0]?.src || ''}
                              alt={characterSet.images[selectedImages[characterSet.id] || 0]?.alt || ''}
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 100vw, 75vw"
                            />
                          </motion.div>
                        </AnimatePresence>

                        {/* Navigation Arrows */}
                        <button
                          onClick={() => navigateToPrev(characterSet.id)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-all duration-300 z-10"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        </button>
                        <button
                          onClick={() => navigateToNext(characterSet.id)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-all duration-300 z-10"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        </button>
                      </div>

                      {/* Mobile Thumbnail Strip */}
                      <div className="flex lg:hidden justify-center gap-2 mt-4 overflow-x-auto scrollbar-none pb-2">
                        {characterSet.images.map((image, index) => (
                          <motion.div
                            key={image.id}
                            whileTap={{ scale: 0.95 }}
                            className={`cursor-pointer rounded-lg overflow-hidden flex-shrink-0 transition-all duration-300 ${
                              selectedImages[characterSet.id] === index
                                ? 'ring-2 ring-white shadow-lg'
                                : 'opacity-60 hover:opacity-100'
                            }`}
                            onClick={() => selectImage(characterSet.id, index)}
                          >
                            <div className="relative w-16 h-16">
                              <Image
                                src={image.src}
                                alt={image.alt}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CharacterGallery;
