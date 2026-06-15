export interface StoryboardImage {
  id: string;
  src: string;
  alt: string;
}

export interface StoryboardSet {
  id: string;
  name: string;
  description: string;
  images: StoryboardImage[];
}

// Replace with your own storyboard sets
export const storyboardSets: StoryboardSet[] = [
  {
    id: 'storyboard-1',
    name: 'Storyboard Name 1',
    description: 'Description for storyboard 1',
    images: [
      { id: 'sb1-1', src: '/images/storyboards/storyboard-1/frame-1.jpg', alt: 'Frame 1' },
      { id: 'sb1-2', src: '/images/storyboards/storyboard-1/frame-2.jpg', alt: 'Frame 2' },
      { id: 'sb1-3', src: '/images/storyboards/storyboard-1/frame-3.jpg', alt: 'Frame 3' },
    ],
  },
  {
    id: 'storyboard-2',
    name: 'Storyboard Name 2',
    description: 'Description for storyboard 2',
    images: [
      { id: 'sb2-1', src: '/images/storyboards/storyboard-2/frame-1.jpg', alt: 'Frame 1' },
      { id: 'sb2-2', src: '/images/storyboards/storyboard-2/frame-2.jpg', alt: 'Frame 2' },
    ],
  },
];
