import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import { customFont, vazirmatn } from "@/lib/fonts";
import "../globals.css";

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={`${customFont.variable} ${vazirmatn.variable}`}>
      <body className="antialiased">
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
