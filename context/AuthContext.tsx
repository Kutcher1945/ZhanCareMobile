import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import LoadingScreen from '@/components/screens/LoadingScreen';
import { DeviceEventEmitter } from 'react-native';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

// Event name for force logout
export const FORCE_LOGOUT_EVENT = 'FORCE_LOGOUT';

const AuthContext = createContext<{
  isAuthenticated: boolean;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();

    // Listen for force logout events from outside React context
    const subscription = DeviceEventEmitter.addListener(FORCE_LOGOUT_EVENT, () => {
      setIsAuthenticated(false);
      setUser(null);
    });

    return () => subscription.remove();
  }, []);

  const checkAuthState = async () => {
    const startTime = Date.now();
    const minLoadingTime = 2000; // Minimum 2 seconds loading screen

    try {
      const token = await AsyncStorage.getItem('access_token');
      const userData = await AsyncStorage.getItem('user');

      if (token && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.log('Error checking auth state:', error);
    } finally {
      // Ensure loading screen shows for at least minLoadingTime
      const elapsedTime = Date.now() - startTime;
      const remainingTime = minLoadingTime - elapsedTime;

      if (remainingTime > 0) {
        setTimeout(() => setIsLoading(false), remainingTime);
      } else {
        setIsLoading(false);
      }
    }
  };

  const login = async (userData: User) => {
    setIsAuthenticated(true);
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setUser(null);
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
