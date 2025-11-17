import { useAuth } from '@/context/AuthContext';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && inAuthGroup) {
      // Redirect to login if not authenticated and trying to access protected routes
      router.replace('/login');
    } else if (isAuthenticated && !inAuthGroup) {
      // Redirect to tabs if authenticated and not in protected area
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);

  return <>{children}</>;
}