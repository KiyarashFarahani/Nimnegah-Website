export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
}

export interface GallerySet {
  id: string;
  name: string;
  description?: string;
  images: GalleryImage[];
}

// Replace with your own gallery sets
// Each set corresponds to a folder under public/images/
export const gallerySets: GallerySet[] = [
  {
    id: 'gallery-1',
    name: 'Gallery Name 1',
    description: 'Description for gallery 1',
    images: [
      { id: 'g1-1', src: '/images/gallery-1/image-1.jpg', alt: 'Image 1' },
      { id: 'g1-2', src: '/images/gallery-1/image-2.jpg', alt: 'Image 2' },
      { id: 'g1-3', src: '/images/gallery-1/image-3.jpg', alt: 'Image 3' },
    ],
  },
  {
    id: 'gallery-2',
    name: 'Gallery Name 2',
    description: 'Description for gallery 2',
    images: [
      { id: 'g2-1', src: '/images/gallery-2/image-1.jpg', alt: 'Image 1' },
      { id: 'g2-2', src: '/images/gallery-2/image-2.jpg', alt: 'Image 2' },
    ],
  },
];
