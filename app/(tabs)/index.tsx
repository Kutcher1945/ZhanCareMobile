import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  return null; // or a loading spinner
}
