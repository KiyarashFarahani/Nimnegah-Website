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

// Editorial Pro font for regular text
export const editorialPro = localFont({
  src: [
    {
      path: '../../public/fonts/EditorialPro-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/EditorialPro-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-editorial-pro',
  display: 'swap',
});
