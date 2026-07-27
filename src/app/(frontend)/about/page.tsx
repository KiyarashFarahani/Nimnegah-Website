import AboutAcademy from '@/components/AboutAcademy';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'درباره ما | رسانه هنری نیم‌نگاه',
  description: 'درباره رسانه هنری نیم‌نگاه، تخصص در طراحی گرافیک مذهبی، هویت بصری و آموزش طراحی پوستر',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <AboutAcademy />
    </main>
  );
}