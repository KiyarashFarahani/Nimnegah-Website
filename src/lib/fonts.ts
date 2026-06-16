import localFont from 'next/font/local';

// Custom font configuration - replace with your own fonts
// Place your .ttf/.woff2 files in public/fonts/
export const customFont = localFont({
  src: [
    {
      path: '../../public/fonts/siavash.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-siavash',
  display: 'swap',
});

// Vazirmatn - Modern Persian body font
export const vazirmatn = localFont({
  src: [
    {
      path: '../../public/fonts/Vazirmatn-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Vazirmatn-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Vazirmatn-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Vazirmatn-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-vazir',
  display: 'swap',
});
