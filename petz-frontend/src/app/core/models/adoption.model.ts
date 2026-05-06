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
  isAdoptionReady?: boolean;
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
  updatedAt?: string;
  // Enriched animal fields
  animalName?: string;
  animalSpecies?: string;
  animalBreed?: string;
  animalAgeMonths?: number;
  animalGender?: string;
  animalPhotoUrl?: string;
  animalIsVaccinated?: boolean;
  animalIsNeutered?: boolean;
  animalCity?: string;
  // Enriched NGO fields
  ngoName?: string;
  ngoPhone?: string;
  ngoEmail?: string;
  ngoCity?: string;
}
