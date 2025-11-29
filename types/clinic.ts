export interface Clinic {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  description?: string;
  working_hours?: string;
  image_url?: string;
  rating?: number;
  services?: string[];
}

export interface ClinicResponse {
  results: Clinic[];
  count: number;
  next: string | null;
  previous: string | null;
}
