'use client';

import { motion } from 'framer-motion';

const CustomFontExample = () => {
  return (
    <div className="p-8 space-y-4">
      <h2 className="text-3xl font-siavash font-bold">Custom Font Example (Siavash)</h2>
      <p className="font-editorial-pro text-lg">
        This text uses the Editorial Pro font family.
      </p>
      <p className="font-playfair text-lg">
        This text uses the Playfair Display font family.
      </p>
      <p className="font-barriecito text-lg">
        This text uses the Barriecito font family.
      </p>
      <p className="font-londrina-outline text-lg">
        This text uses the Londrina Outline font family.
      </p>
    </div>
  );
};

export default CustomFontExample;
