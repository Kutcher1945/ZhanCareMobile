export type UserRole = "patient" | "doctor" | "admin";
export type Gender = "male" | "female" | "other";
export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role?: UserRole;
  birth_date?: string;
  gender?: Gender;
  address?: string;
  city?: string;
  blood_type?: BloodType;
  fluorography_status?: "normal" | "abnormal" | "pending" | "expired";
  immunization_status?: "up_to_date" | "partial" | "expired" | "none";
  allergies?: string[];
  chronic_diseases?: string[];
  medications?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  profile_picture?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Doctor {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  specialization: string;
  experience_years?: number;
  bio?: string;
  profile_picture?: string;
  is_available: boolean;
  rating?: number;
  consultations_count?: number;
  education?: string;
  certifications?: string[];
  languages?: string[];
}
