import type { Metadata } from "next";
import { Inter, Playfair_Display, Barriecito, Londrina_Outline } from "next/font/google";
import { customFont, editorialPro } from "@/lib/fonts";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const barriecito = Barriecito({
  variable: "--font-barriecito",
  subsets: ["latin"],
  weight: "400",
});

const londrinaOutline = Londrina_Outline({
  variable: "--font-londrina-outline",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Your Name | Artist Portfolio",
  description: "A stunning portfolio showcasing artistic works with beautiful design and smooth animations",
  keywords: "artist, portfolio, gallery, art, creative, design",
  authors: [{ name: "Your Name" }],
  openGraph: {
    title: "Your Name | Artist Portfolio",
    description: "A stunning portfolio showcasing artistic works",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${playfair.variable} ${barriecito.variable} ${londrinaOutline.variable} ${customFont.variable} ${editorialPro.variable} font-sans antialiased bg-white text-gray-900`}
      >
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
