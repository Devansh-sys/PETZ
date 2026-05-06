export interface Pet {
  id: number;
  ownerId: number;
  name: string;
  species?: string;
  breed?: string;
  ageYears?: number;
  gender?: string;
  weightKg?: number;
  photoUrl?: string;
  notes?: string;
  createdAt?: string;
}

export interface PetRequest {
  name: string;
  species?: string;
  breed?: string;
  ageYears?: number;
  gender?: string;
  weightKg?: number;
  notes?: string;
}
