'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return <>{children}</>;
}
