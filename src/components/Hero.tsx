'use client';

import Image from 'next/image';

const profileImages = [2, 10, 4, 3, 5, 7, 8, 9];

const floatClasses = [
  'hero-float-1', 'hero-float-2', 'hero-float-3', '',
  'hero-float-4', 'hero-float-5', 'hero-float-6', 'hero-float-7',
];

// Image to prioritize as LCP (gets fetchpriority=high, loading=eager).
// Independent of array order so visual stacking is untouched.
const LCP_IMAGE_NUM = 3;

const Hero = () => {
  return (
    <section id="home" dir="ltr" className="relative w-full overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950"></div>

      {/* Fade into next section's background */}
      <div className="absolute bottom-0 left-0 right-0 h-[20vh] bg-gradient-to-b from-transparent via-blue-950 to-blue-950"></div>

      {/* Main content - vertical on mobile, horizontal on desktop */}
      <div className="relative z-20 flex flex-col lg:flex-row w-full min-h-screen">

        {/* Image stack */}
        <div className="relative w-full lg:w-[55%] h-[60vh] sm:h-[70vh] lg:h-screen lg:sticky lg:top-0 overflow-hidden flex items-center justify-center lg:justify-start lg:pl-24">
          {profileImages.map((num, i) => (
            <div
              key={num}
              className={`absolute inset-0 flex items-center justify-center lg:justify-start pl-0 sm:pl-8 lg:pl-24 ${floatClasses[i]}`}
            >
              <Image
                src={`/images/profile/${num}.webp`}
                alt={`Profile ${num}`}
                width={800}
                height={800}
                sizes="(max-width: 1024px) 50vw, 55vw"
                className="object-contain h-[50vh] sm:h-[60vh] lg:h-[90vh] w-auto"
                priority={num === LCP_IMAGE_NUM}
              />
            </div>
          ))}
        </div>

        {/* Text content - below images on mobile, left side on desktop (RTL) */}
        <div className="relative w-full lg:w-[45%] flex flex-col items-center lg:items-end justify-center px-6 sm:px-8 lg:px-12 xl:px-20 pt-2 pb-12 sm:pt-4 sm:pb-16 lg:py-0">
          <div className="hero-fade-in-right text-center lg:text-right flex flex-col items-center lg:items-end w-full max-w-xl" style={{ animationDelay: '0.2s' }}>
            <div className="hero-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-siavash font-bold text-white mb-3">
                آکادمی نیم‌نگاه
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-slate-400 to-slate-500 mx-auto lg:mr-0 mb-4"></div>
            </div>

            <p className="hero-fade-in-up text-xl sm:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto lg:mr-0 leading-relaxed font-vazir" style={{ animationDelay: '0.4s' }}>
                راهنمای تبدیل شدن به یک طراح حرفه ای
              <br />
              <span className="text-lg text-gray-400">
                  تضمین می‌کنم که به خودت افتخار خواهی کرد
              </span>
            </p>

            <div className="hero-fade-in-up flex flex-row gap-4 justify-center lg:justify-end items-center lg:items-end w-full mt-8 lg:mt-0" style={{ animationDelay: '0.5s' }}>
              <a
                href="#about"
                className="px-8 py-4 h-14 border-2 border-slate-400/50 text-slate-200 font-semibold rounded-full hover:border-slate-300/70 hover:bg-slate-500/20 hover:scale-105 active:scale-95 transition-all duration-300 font-vazir flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.75)]"
              >
                درباره نیم‌نگاه
              </a>
              <a
                href="#courses"
                className="px-8 py-4 h-14 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold rounded-full hover:shadow-lg hover:from-slate-500 hover:to-slate-600 hover:scale-105 active:scale-95 transition-all duration-300 font-vazir flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.75)]"
              >
                مشاهده دوره‌ها
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
