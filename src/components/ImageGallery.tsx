'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { StoryboardSet, StoryboardImage } from '@/data/storyboards';

interface ImageGalleryProps {
  storyboardSets: StoryboardSet[];
}

const ImageGallery = ({ storyboardSets }: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<StoryboardImage | null>(null);
  const [selectedStoryboardSet, setSelectedStoryboardSet] = useState<StoryboardSet | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const allImages: (StoryboardImage & { storyboardSetId: string; storyboardSetName: string })[] = [];
  storyboardSets.forEach(set => {
    set.images.forEach(image => {
      allImages.push({
        ...image,
        storyboardSetId: set.id,
        storyboardSetName: set.name
      });
    });
  });

  const openLightbox = (image: StoryboardImage, storyboardSet: StoryboardSet, index: number) => {
    setSelectedImage(image);
    setSelectedStoryboardSet(storyboardSet);
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    setSelectedStoryboardSet(null);
  };

  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % allImages.length;
    setCurrentIndex(nextIndex);
    const nextImageData = allImages[nextIndex];
    setSelectedImage(nextImageData);
    const nextStoryboardSet = storyboardSets.find(set => set.id === nextImageData.storyboardSetId);
    setSelectedStoryboardSet(nextStoryboardSet || null);
  };

  const prevImage = () => {
    const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    setCurrentIndex(prevIndex);
    const prevImageData = allImages[prevIndex];
    setSelectedImage(prevImageData);
    const prevStoryboardSet = storyboardSets.find(set => set.id === prevImageData.storyboardSetId);
    setSelectedStoryboardSet(prevStoryboardSet || null);
  };

  return (
    <section id="storyboards" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-siavash font-bold text-gray-900 mb-4">
            Storyboards
          </h2>
        </motion.div>

        {/* Storyboard Sets Grid */}
        <div className="space-y-16">
          {storyboardSets.map((storyboardSet, setIndex) => (
            <motion.div
              key={storyboardSet.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: setIndex * 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl shadow-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8">
                <h3 className="text-3xl font-siavash font-bold text-gray-900 mb-4 text-center">
                  {storyboardSet.name}
                </h3>
                <p className="text-gray-600 text-center max-w-4xl mx-auto leading-relaxed font-editorial-pro">
                  {storyboardSet.description}
                </p>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                  {storyboardSet.images.map((image, imageIndex) => {
                    const globalIndex = allImages.findIndex(
                      img => img.id === image.id && img.storyboardSetId === storyboardSet.id
                    );

                    return (
                      <motion.div
                        key={image.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: imageIndex * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -8, scale: 1.05 }}
                        className="cursor-pointer group"
                        onClick={() => openLightbox(image, storyboardSet, globalIndex)}
                      >
                        <div className="relative overflow-hidden rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300">
                          <div className="relative aspect-[16/9]">
                            <Image
                              src={image.src}
                              alt={image.alt}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <p className="text-white text-sm font-medium font-editorial-pro">
                              {storyboardSet.name}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && selectedStoryboardSet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10010] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeLightbox}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
              >
                <X size={32} />
              </button>

              <div className="relative h-[65vh] sm:h-[70vh] md:h-[75vh] rounded-2xl overflow-hidden">
                <Image
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  fill
                  className="object-contain"
                  sizes="90vw"
                />
                <button
                  onClick={prevImage}
                  className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/20 backdrop-blur-sm rounded-full items-center justify-center text-white hover:bg-black/40 hover:scale-110 transition-all duration-300 z-10 border border-white/20"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImage}
                  className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/20 backdrop-blur-sm rounded-full items-center justify-center text-white hover:bg-black/40 hover:scale-110 transition-all duration-300 z-10 border border-white/20"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="mt-6 text-center text-white">
                <h3 className="text-2xl font-siavash font-bold mb-2">
                  {selectedStoryboardSet.name}
                </h3>
                <p className="text-gray-300 mb-4 font-editorial-pro text-center">
                  {currentIndex + 1} of {allImages.length}
                </p>
                <p className="text-gray-400 max-w-2xl mx-auto font-editorial-pro">
                  {selectedStoryboardSet.description}
                </p>
              </div>

              <div className="mt-4 flex md:hidden items-center justify-center gap-4">
                <button
                  onClick={prevImage}
                  aria-label="Previous"
                  className="w-12 h-12 rounded-full bg-white/10 text-white border border-white/20 backdrop-blur-sm active:scale-95 transition flex items-center justify-center"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImage}
                  aria-label="Next"
                  className="w-12 h-12 rounded-full bg-white/10 text-white border border-white/20 backdrop-blur-sm active:scale-95 transition flex items-center justify-center"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ImageGallery;
