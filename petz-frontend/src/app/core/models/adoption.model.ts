export interface AdoptableAnimal {
  id: number;
  ngoId: number;
  name: string;
  species?: string;
  breed?: string;
  ageMonths?: number;
  gender?: string;
  description?: string;
  photoUrl?: string;
  city?: string;
  isVaccinated: boolean;
  isNeutered: boolean;
  status: string;
  createdAt?: string;
}

export interface AdoptionApplication {
  id: number;
  animalId: number;
  applicantId: number;
  ngoId: number;
  reason?: string;
  experience?: string;
  housingType?: string;
  hasOtherPets?: boolean;
  status: string;
  adminNotes?: string;
  appliedAt?: string;
}
