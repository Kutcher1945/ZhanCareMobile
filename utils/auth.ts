// utils/auth.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Alert } from 'react-native';

/**
 * Logs out the user: clears tokens, optionally shows a message, and navigates to a route.
 */
export const logoutUser = async (message?: string, redirectPath: string = '/login') => {
  try {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token']);

    if (message) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      Alert.alert('Внимание', message, [
        {
          text: 'Ок',
          onPress: () => {
            router.replace(redirectPath as any); // ✅ cast to `any` to suppress TS error
          },
        },
      ]);
    } else {
      router.replace(redirectPath as any);
    }
  } catch (err) {
    console.warn('Logout failed:', err);
    router.replace(redirectPath as any);
  }
};
