import ContactUs from '@/components/ContactUs';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تماس با ما | رسانه هنری نیم‌نگاه',
  description: 'تماس با رسانه هنری نیم‌نگاه برای سفارش طراحی گرافیک، پوستر مذهبی، هویت بصری و مشاوره',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <ContactUs />
    </main>
  );
}