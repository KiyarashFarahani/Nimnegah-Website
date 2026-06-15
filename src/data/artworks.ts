export interface Artwork {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  year: string;
}

// Replace with your own artworks
export const artworks: Artwork[] = [
  {
    id: 1,
    title: "Artwork Title 1",
    description: "Description of your first artwork.",
    image: "/images/artworks/artwork-1.jpg",
    category: "Category A",
    year: "2024"
  },
  {
    id: 2,
    title: "Artwork Title 2",
    description: "Description of your second artwork.",
    image: "/images/artworks/artwork-2.jpg",
    category: "Category B",
    year: "2024"
  },
  {
    id: 3,
    title: "Artwork Title 3",
    description: "Description of your third artwork.",
    image: "/images/artworks/artwork-3.jpg",
    category: "Category A",
    year: "2024"
  }
];
