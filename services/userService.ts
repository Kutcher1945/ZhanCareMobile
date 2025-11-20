import api from '@/utils/api';
import { User } from '@/types/user';

export const userService = {
  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    try {
      const response = await api.get<User>('/user-profile/');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<User>): Promise<User> => {
    try {
      const response = await api.patch<User>('/user-profile/profile/', data);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  /**
   * Upload profile picture
   */
  uploadProfilePicture: async (file: FormData): Promise<{ profile_picture: string }> => {
    try {
      const response = await api.post<{ profile_picture: string }>(
        '/user-profile/upload-picture/',
        file,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  },
};
