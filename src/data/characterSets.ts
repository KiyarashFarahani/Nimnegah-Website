export interface CharacterImage {
  id: string;
  src: string;
  alt: string;
}

export interface CharacterSet {
  id: string;
  name: string;
  description: string;
  images: CharacterImage[];
}

// Replace with your own character sets
export const characterSets: CharacterSet[] = [
  {
    id: 'character-1',
    name: 'Character Name 1',
    description: 'Description of character set 1.',
    images: [
      { id: 'c1-1', src: '/images/characters/character-1/image-1.jpg', alt: 'Character 1 - Image 1' },
      { id: 'c1-2', src: '/images/characters/character-1/image-2.jpg', alt: 'Character 1 - Image 2' },
    ]
  },
  {
    id: 'character-2',
    name: 'Character Name 2',
    description: 'Description of character set 2.',
    images: [
      { id: 'c2-1', src: '/images/characters/character-2/image-1.jpg', alt: 'Character 2 - Image 1' },
    ]
  }
];
