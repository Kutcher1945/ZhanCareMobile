import { useAuth } from '@/context/AuthContext';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(tabs)';
    const currentRoute = segments.join('/');

    // Whitelist of routes that authenticated users can access outside of tabs
    const allowedRoutes = ['book-consultation', 'video-call', 'medical-history'];
    const isAllowedRoute = allowedRoutes.some(route => currentRoute.includes(route));

    if (!isAuthenticated && inAuthGroup) {
      // Redirect to login if not authenticated and trying to access protected routes
      router.replace('/login');
    } else if (isAuthenticated && !inAuthGroup && !isAllowedRoute) {
      // Redirect to tabs if authenticated and not in protected area (unless it's an allowed route)
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);

  return <>{children}</>;
}