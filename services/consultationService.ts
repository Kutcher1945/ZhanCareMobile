import api from '@/utils/api';
import { Consultation, ConsultationResponse, ConsultationFilters } from '@/types/consultation';

export const consultationService = {
  /**
   * Get patient's consultations
   */
  getMyConsultations: async (filters?: ConsultationFilters): Promise<Consultation[]> => {
    try {
      const params: any = {};

      if (filters?.status && filters.status.length > 0) {
        params.status = filters.status.join(',');
      }
      if (filters?.type && filters.type.length > 0) {
        params.type = filters.type.join(',');
      }
      if (filters?.searchQuery) {
        params.search = filters.searchQuery;
      }
      if (filters?.dateFrom) {
        params.date_from = filters.dateFrom;
      }
      if (filters?.dateTo) {
        params.date_to = filters.dateTo;
      }

      const response = await api.get<ConsultationResponse>('/consultations/my-consultations/', { params });

      // Handle different response formats (array, paginated, or wrapped)
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data.results) {
        return response.data.results;
      }
      return [];
    } catch (error) {
      console.error('Error fetching consultations:', error);
      throw error;
    }
  },

  /**
   * Get a single consultation by ID
   */
  getConsultationById: async (id: number): Promise<Consultation> => {
    try {
      const response = await api.get<Consultation>(`/consultations/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching consultation:', error);
      throw error;
    }
  },

  /**
   * Create a new consultation
   */
  createConsultation: async (data: {
    symptoms: string;
    type?: 'video' | 'phone' | 'chat';
    consultation_type?: string;
    is_urgent?: boolean;
    scheduled_at?: string;
    doctor_id?: number;
  }): Promise<Consultation> => {
    try {
      const response = await api.post<Consultation>('/consultations/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating consultation:', error);
      throw error;
    }
  },

  /**
   * Cancel a consultation
   */
  cancelConsultation: async (id: number): Promise<void> => {
    try {
      await api.post(`/consultations/${id}/cancel/`);
    } catch (error) {
      console.error('Error cancelling consultation:', error);
      throw error;
    }
  },

  /**
   * Join a consultation (for upcoming/scheduled consultations)
   */
  joinConsultation: async (id: number): Promise<{ meeting_url: string }> => {
    try {
      const response = await api.post<{ meeting_url: string }>(`/consultations/${id}/join/`);
      return response.data;
    } catch (error) {
      console.error('Error joining consultation:', error);
      throw error;
    }
  },

  /**
   * Get available doctors
   */
  getAvailableDoctors: async (specialty?: string): Promise<any[]> => {
    try {
      const params = specialty ? { specialty } : {};
      const response = await api.get('/auth/doctor/available/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching available doctors:', error);
      throw error;
    }
  },
};
