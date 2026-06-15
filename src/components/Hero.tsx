'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useFloatingAnimation } from '@/hooks/useFloatingAnimation';
import { useEffect } from 'react';

const profileImages = [2, 10, 4, 3, 5, 6, 7, 8, 9];

const Hero = () => {
  const img2 = useFloatingAnimation({ duration: 5, intensity: 25, delay: 0 });
  const img3 = useFloatingAnimation({ duration: 5, intensity: 25, delay: 0 });
  const img4 = useFloatingAnimation({ duration: 6, intensity: 28, delay: 0.2 });
  const img5 = useFloatingAnimation({ duration: 5.5, intensity: 26, delay: 0.4 });
  const img6 = useFloatingAnimation({ duration: 6.5, intensity: 22, delay: 0.6 });
  const img7 = useFloatingAnimation({ duration: 5, intensity: 30, delay: 0.8 });
  const img8 = useFloatingAnimation({ duration: 6, intensity: 25, delay: 1.0 });
  const img9 = useFloatingAnimation({ duration: 5.5, intensity: 28, delay: 0.3 });
  const img10 = useFloatingAnimation({ duration: 6, intensity: 26, delay: 0.5 });
  //const img11 = useFloatingAnimation({ duration: 5, intensity: 22, delay: 0.7 });
  //const img12 = useFloatingAnimation({ duration: 6.5, intensity: 30, delay: 0.9 });
  //const img13 = useFloatingAnimation({ duration: 5.5, intensity: 12, delay: 1.1 });

  const floatingHooks = [img2, img3, img4, img5, img6, img7, img8, img9, img10/*, img11, img12, img13*/];

  useEffect(() => {
    floatingHooks.forEach((hook, i) => {
      if (profileImages[i] !== 3) {
        hook.startFloating();
      }
    });
  }, []);

  return (
    <section id="home" className="relative w-full overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950"></div>

      {/* Main content - vertical on mobile, horizontal on desktop */}
      <div className="relative z-20 flex flex-col lg:flex-row w-full min-h-screen">

        {/* Image stack */}
        <div className="relative w-full lg:w-[55%] h-[60vh] sm:h-[70vh] lg:h-screen lg:sticky lg:top-0 overflow-hidden flex items-center justify-center lg:justify-start lg:pl-24">
          {profileImages.map((num, i) => (
            <motion.div
              key={num}
              className="absolute inset-0 flex items-center justify-center lg:justify-start pl-0 sm:pl-8 lg:pl-24"
              animate={num !== 3 ? floatingHooks[i].controls : undefined}
            >
              <Image
                src={`/images/profile/${num}.png`}
                alt={`Profile ${num}`}
                width={1200}
                height={1500}
                className="object-contain h-[50vh] sm:h-[60vh] lg:h-[90vh] w-auto"
                sizes="(max-width: 1024px) 90vw, 55vw"
                priority={num <= 4}
              />
            </motion.div>
          ))}
        </div>

        {/* Text content - below images on mobile, right side on desktop */}
        <div className="relative w-full lg:w-[45%] flex flex-col items-center lg:items-end justify-center px-6 sm:px-8 lg:px-12 xl:px-20 py-12 sm:py-16 lg:py-0">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center lg:text-right flex flex-col items-center lg:items-end w-full max-w-xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-siavash font-bold text-white mb-6">
                آکادمی نیم‌نگاه
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-slate-400 to-slate-500 mx-auto lg:mr-0 mb-8"></div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto lg:mr-0 leading-relaxed font-editorial-pro"
            >
              یه سری متن
              <br />
              <span className="text-lg text-gray-400">
                یه سری متن دیگه و این چیزا
              </span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="flex flex-row gap-4 justify-center lg:justify-end items-center lg:items-end w-full"
            >
              <motion.a
                href="#about"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 h-14 border-2 border-slate-400/50 text-slate-200 font-semibold rounded-full hover:border-slate-300/70 hover:bg-slate-500/20 transition-all duration-300 font-editorial-pro flex items-center justify-center"
              >
                درباره نیم‌نگاه
              </motion.a>
              <motion.a
                href="#galleries"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 h-14 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold rounded-full hover:shadow-lg hover:from-slate-500 hover:to-slate-600 transition-all duration-300 font-editorial-pro flex items-center justify-center"
              >
                مشاهده دوره ها
              </motion.a>
            </motion.div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
