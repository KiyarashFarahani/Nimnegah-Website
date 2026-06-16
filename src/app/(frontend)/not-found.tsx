import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center px-6">
      <Image
        src="/images/logo/logo.png"
        alt="نیم‌نگاه"
        width={160}
        height={160}
        className="h-32 w-auto mb-10 invert"
        priority
      />

      <h1 className="text-4xl sm:text-5xl font-bold text-white/90 font-siavash mb-4">
        ۴۰۴
      </h1>

      <p className="text-xl sm:text-2xl text-gray-300 font-vazir mb-10 text-center">
        صفحه‌ای که دنبالش می‌گردی پیدا نشد
      </p>

      <Link
        href="/"
        className="px-8 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold rounded-full hover:shadow-lg hover:from-slate-500 hover:to-slate-600 transition-all duration-300 font-vazir"
      >
        بازگشت به صفحه اصلی
      </Link>
    </div>
  );
}
