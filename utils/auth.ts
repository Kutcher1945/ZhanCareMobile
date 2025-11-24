// utils/auth.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { DeviceEventEmitter } from 'react-native';
import { FORCE_LOGOUT_EVENT } from '@/context/AuthContext';

/**
 * Logs out the user: clears tokens and user data, and navigates to login.
 */
export const logoutUser = async (_message?: string, redirectPath: string = '/login') => {
  try {
    // Clear all auth data including user
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);

    // Emit event to update AuthContext state
    DeviceEventEmitter.emit(FORCE_LOGOUT_EVENT);

    // Redirect to login immediately
    router.replace(redirectPath as any);
  } catch (err) {
    console.warn('Logout failed:', err);
    router.replace(redirectPath as any);
  }
};
