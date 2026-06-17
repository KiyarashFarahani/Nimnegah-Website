import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { SplashProvider } from "@/contexts/SplashContext";

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SplashProvider>
      <SmoothScrollProvider>
        <Navigation />
        <PageTransition>{children}</PageTransition>
        <Footer />
      </SmoothScrollProvider>
    </SplashProvider>
  );
}
