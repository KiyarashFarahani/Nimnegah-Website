import type { Metadata } from "next";
import { customFont, vazirmatn } from "@/lib/fonts";
import "./globals.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://nimnegah.com";

export const metadata: Metadata = {
  title: {
    default: "آکادمی نیم‌نگاه | Nimnegah Academy",
    template: "%s | نیم‌نگاه",
  },
  description: "آکادمی نیم‌نگاه — دوره‌های آموزشی تخصصی هنر و طراحی با بهترین اساتید",
  keywords: ["آموزش", "دوره آنلاین", "هنر", "طراحی", "نیم‌نگاه", "آکادمی"],
  authors: [{ name: "نیم‌نگاه" }],
  creator: "نیم‌نگاه",
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: APP_URL,
    siteName: "آکادمی نیم‌نگاه",
    title: "آکادمی نیم‌نگاه | Nimnegah Academy",
    description: "دوره‌های آموزشی تخصصی هنر و طراحی با بهترین اساتید",
  },
  twitter: {
    card: "summary_large_image",
    title: "آکادمی نیم‌نگاه | Nimnegah Academy",
    description: "دوره‌های آموزشی تخصصی هنر و طراحی با بهترین اساتید",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: APP_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`${customFont.variable} ${vazirmatn.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
