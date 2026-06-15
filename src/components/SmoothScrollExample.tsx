'use client';

import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { motion } from 'framer-motion';

const SmoothScrollExample = () => {
  const { scrollToTop, scrollToBottom } = useSmoothScroll();

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-3xl font-bold">Smooth Scroll Example</h2>
      <p className="text-gray-600">
        This component demonstrates smooth scrolling using Lenis.
      </p>
      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Scroll to Top
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToBottom}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Scroll to Bottom
        </motion.button>
      </div>
    </div>
  );
};

export default SmoothScrollExample;
