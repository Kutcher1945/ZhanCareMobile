export type ConsultationStatus =
  | "pending"
  | "ongoing"
  | "completed"
  | "cancelled"
  | "missed"
  | "scheduled"
  | "planned";

export type ConsultationType = "video" | "phone" | "chat";

export type ConsultationSpecialty =
  | "general"
  | "cardiology"
  | "psychiatry"
  | "pediatric"
  | "neurology"
  | "dermatology"
  | "orthopedic";

export interface Consultation {
  id: number;
  meeting_id: string;
  patient_name: string;
  patient_email: string | null;
  patient_phone?: string;
  status: ConsultationStatus;
  doctor_id?: number;
  doctor_first_name?: string;
  doctor_last_name?: string;
  doctor_specialization?: string;
  patient_first_name?: string;
  patient_last_name?: string;
  created_at: string;
  started_at?: string;
  ended_at?: string;
  scheduled_at?: string;
  symptoms?: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  is_urgent?: boolean;
  type?: ConsultationType;
  consultation_type?: ConsultationSpecialty;
  duration_minutes?: number;
  cost?: number;
}

export interface ConsultationFilters {
  status?: ConsultationStatus[];
  type?: ConsultationType[];
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
}

export interface ConsultationResponse {
  results?: Consultation[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}
