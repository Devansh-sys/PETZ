export interface Appointment {
  id: number;
  userId: number;
  petId?: number;
  hospitalId: number;
  doctorId: number;
  apptDate: string;
  apptTime: string;
  reason?: string;
  status: string;
  notes?: string;
  createdAt?: string;
  // Enriched fields from backend DTO
  hospitalName?: string;
  hospitalCity?: string;
  hospitalAddress?: string;
  hospitalPhone?: string;
  doctorName?: string;
  doctorSpecialization?: string;
  petName?: string;
  petSpecies?: string;
  petBreed?: string;
}

export interface AppointmentRequest {
  hospitalId: number;
  doctorId: number;
  petId?: number;
  apptDate: string;
  apptTime: string;
  reason?: string;
}

export interface SlotResponse {
  time: string;
  available: boolean;
}
