import ScrollToTopProvider from "@/components/ScrollToTopProvider";
import Navigation from "@/components/Navigation";
import dynamic from "next/dynamic";
import PageTransition from "@/components/PageTransition";
import { SplashProvider } from "@/contexts/SplashContext";

// Below-fold: defer client-side. Loads after first paint, on demand.
const Footer = dynamic(() => import("@/components/Footer"));

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SplashProvider>
      <ScrollToTopProvider>
        <Navigation />
        <PageTransition>{children}</PageTransition>
        <Footer />
      </ScrollToTopProvider>
    </SplashProvider>
  );
}
