# Artist Portfolio Template

A modern Next.js portfolio website template for artists, illustrators, and creatives. Features smooth animations, responsive design, and optimized performance.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=for-the-badge&logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-ff0055?style=for-the-badge&logo=framer)

## Features

- **Modern Design** - Clean layout with custom fonts
- **Responsive** - Works on all devices
- **Fast** - Next.js 15 + Turbopack + optimized images
- **Smooth Animations** - Framer Motion + Lenis smooth scroll
- **Image Gallery** - Masonry/grid layout with lightbox
- **Storyboard Section** - Showcase storyboard sequences
- **Character Gallery** - Auto-sliding character showcase
- **Splash Screen** - Beautiful loading animation
- **Accessible** - WCAG compliant

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Customization

### 1. Replace Content

Edit the data files in `src/data/`:

- `galleries.ts` - Your gallery sets and images
- `storyboards.ts` - Your storyboard sequences
- `characterSets.ts` - Your character collections
- `artworks.ts` - Your artwork pieces

### 2. Update Personal Info

Search and replace these placeholder strings across the codebase:

| Placeholder | Where to Replace |
|-------------|------------------|
| `Your Name` | Navigation, Hero, Footer, Splash Screen |
| `Your Title / Subtitle` | Hero section |
| `your-email@example.com` | Contact component |
| `+1 234 567 890` | Contact component |
| `Your City, Country` | Contact component |
| `https://instagram.com/yourusername` | Contact component |
| `https://linkedin.com/in/yourprofile` | Contact component |
| `https://t.me/yourusername` | Contact component |
| `https://github.com/yourusername` | Footer component |

### 3. Add Your Images

Place your images in `public/images/`:

```
public/
├── images/
│   ├── profile/
│   │   └── photo.jpg          # Your profile photo
│   ├── landing.png            # Hero section image
│   ├── galleries/             # Your gallery images
│   │   ├── gallery-1/
│   │   └── gallery-2/
│   ├── storyboards/           # Your storyboard frames
│   │   ├── storyboard-1/
│   │   └── storyboard-2/
│   └── characters/            # Your character images
│       ├── character-1/
│       └── character-2/
```

### 4. Add Your Fonts

Place your font files in `public/fonts/` and update `src/lib/fonts.ts` to configure them.

### 5. Update Metadata

Edit `src/app/layout.tsx` to update the page title, description, and SEO metadata.

## Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout with fonts & metadata
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/             # React components
│   │   ├── AppWrapper.tsx     # Main app wrapper
│   │   ├── Navigation.tsx     # Fixed navigation bar
│   │   ├── Hero.tsx           # Hero/landing section
│   │   ├── ImageGallery.tsx   # Storyboard gallery
│   │   ├── Galleries.tsx      # Image galleries
│   │   ├── CharacterGallery.tsx # Character showcase
│   │   ├── About.tsx          # About me section
│   │   ├── Contact.tsx        # Contact section
│   │   ├── Footer.tsx         # Footer
│   │   └── SplashScreen.tsx   # Loading screen
│   ├── data/                   # Content data files
│   ├── hooks/                  # Custom React hooks
│   └── lib/                    # Utility libraries
└── public/                     # Static assets
```

## Tech Stack

- **Framework**: Next.js 15 (App Router + Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Smooth Scroll**: Lenis
- **Icons**: Lucide React

## License

MIT
