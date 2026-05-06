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
  updatedAt?: string;
  // Enriched NGO fields
  ngoName?: string;
  ngoPhone?: string;
  ngoEmail?: string;
  ngoCity?: string;
  ngoAddress?: string;
}

export interface RescueRequest {
  animalType?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  criticality?: string;
}
