'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Apply theme on mount
    setTheme(theme);
  }, [theme, setTheme]);

  return <>{children}</>;
}
