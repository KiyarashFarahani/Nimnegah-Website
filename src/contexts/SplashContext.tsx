'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface SplashContextValue {
  splashDone: boolean;
  completeSplash: () => void;
}

const SplashContext = createContext<SplashContextValue>({
  splashDone: true,
  completeSplash: () => {},
});

export function useSplash() {
  return useContext(SplashContext);
}

export function SplashProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [splashDone, setSplashDone] = useState(pathname !== '/');

  const completeSplash = useCallback(() => {
    setSplashDone(true);
  }, []);

  return (
    <SplashContext.Provider value={{ splashDone, completeSplash }}>
      {children}
    </SplashContext.Provider>
  );
}
