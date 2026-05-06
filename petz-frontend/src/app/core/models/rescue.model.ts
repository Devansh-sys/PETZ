export interface RescueReport {
  id: number;
  reporterId: number;
  assignedNgo?: number;
  animalType?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  photoUrl?: string;
  status: string;
  criticality: string;
  resolutionNotes?: string;
  reportedAt?: string;
}

export interface RescueRequest {
  animalType?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  criticality?: string;
}
