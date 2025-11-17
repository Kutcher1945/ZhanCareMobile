import { AuthProvider } from '@/context/AuthContext';
import AuthGuard from '@/components/auth/AuthGuard';
import { Slot } from 'expo-router';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGuard>
        <Slot />
      </AuthGuard>
    </AuthProvider>
  );
}
