import api from '@/utils/api';
import { Clinic, ClinicResponse } from '@/types/clinic';

interface AISearchParams {
  query: string;
  city_name?: string;
  lat?: number;
  lng?: number;
}

interface AISearchResponse {
  success: boolean;
  explanation: string;
  matched_categories: string[];
  keywords: string[];
  clinics: Clinic[];
  total_found: number;
}

export const clinicService = {
  /**
   * Get all clinics
   */
  getClinics: async (): Promise<Clinic[]> => {
    try {
      const response = await api.get<ClinicResponse>('/clinics/');

      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data.results) {
        return response.data.results;
      }
      return [];
    } catch (error) {
      console.error('Error fetching clinics:', error);
      throw error;
    }
  },

  /**
   * Get a single clinic by ID
   */
  getClinicById: async (id: number): Promise<Clinic> => {
    try {
      const response = await api.get<Clinic>(`/clinics/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching clinic:', error);
      throw error;
    }
  },

  /**
   * AI-powered search for clinics using natural language
   */
  aiSearch: async (params: AISearchParams): Promise<AISearchResponse> => {
    try {
      const response = await api.post<AISearchResponse>('/clinics/ai-search/', params);
      return response.data;
    } catch (error) {
      console.error('Error in AI search:', error);
      throw error;
    }
  },

  /**
   * Get nearest clinics based on user location
   */
  getNearestClinics: async (lat: number, lng: number, radius: number = 50): Promise<Clinic[]> => {
    try {
      const response = await api.get<ClinicResponse>('/clinics/', {
        params: {
          lat,
          lng,
          radius,
          page_size: 20,
        }
      });

      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data.results) {
        return response.data.results;
      }
      return [];
    } catch (error) {
      console.error('Error fetching nearest clinics:', error);
      throw error;
    }
  },
};
