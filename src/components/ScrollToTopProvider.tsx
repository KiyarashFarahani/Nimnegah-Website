'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface ScrollToTopProviderProps {
  children: React.ReactNode;
}

export default function ScrollToTopProvider({ children }: ScrollToTopProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return <>{children}</>;
}
