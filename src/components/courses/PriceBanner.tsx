import { Megaphone } from 'lucide-react';
import { toPersianDigits } from '@/lib/course-utils';

export default function PriceBanner({ text, className = '' }: { text?: string | null; className?: string }) {
  const content = text?.trim();
  if (!content) return null;

  return (
    <div
      className={`flex items-start gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-emerald-200 text-xs font-vazir leading-6 ${className}`}
    >
      <Megaphone size={14} className="mt-1 shrink-0 text-emerald-400" />
      <span>{toPersianDigits(content)}</span>
    </div>
  );
}
