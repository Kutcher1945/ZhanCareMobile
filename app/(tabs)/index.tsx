import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { useEffect } from 'react';
import HomePage from '@/components/screens/HomePage';
import { View, Text, ActivityIndicator } from 'react-native';

export default function Index() {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  // Show loading if not authenticated yet
  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
        <ActivityIndicator size="large" color="#3772ff" />
      </View>
    );
  }

  // Render HomePage when authenticated
  return <HomePage />;
}
