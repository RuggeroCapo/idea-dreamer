'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { LoadingScreen } from '@/components/ui/loading-screen';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <LoadingScreen message="Preparing your journal..." />;
  }

  return <>{children}</>;
}
