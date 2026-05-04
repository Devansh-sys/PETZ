
export type ApplicationStatus =
  | 'DRAFT' | 'PENDING' | 'SUBMITTED' | 'UNDER_REVIEW'
  | 'CLARIFICATION_REQUESTED' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';

export interface AdoptablePet {
  id: string;
  ngoId: string;
  ngoName: string;
  name: string;
  species: string;
  breed?: string;
  ageMonths?: number;
  gender?: string;
  locationCity?: string;
  isAdoptionReady?: boolean;
  status?: string;
  primaryImageUrl?: string;
  distanceKm?: number;
  // Detail-only fields (optional — not returned in browse/search list)
  description?: string;
  temperament?: string;
  medicalSummary?: string;
  vaccinationStatus?: string;
  specialNeeds?: boolean;
  specialNeedsNotes?: string;
  sizeCategory?: string;
  color?: string;
  ngoContactPhone?: string;
  ngoContactEmail?: string;
  media?: PetMedia[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PetMedia {
  id: string;
  fileUrl: string;
  fileName?: string;
  mediaType: 'PHOTO' | 'VIDEO';
  isPrimary: boolean;
  displayOrder: number;
  adoptablePetId?: string;
  uploadedAt?: string;
}

export interface AdoptablePetPage {
  content: AdoptablePet[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface AdoptionApplication {
  id: string;
  adoptablePetId?: string;
  petName?: string;
  adopterId?: string;
  adopterName?: string;
  ngoId?: string;
  status: ApplicationStatus;
  currentStep?: string;
  submittedAt?: string;
  lastActivityAt?: string;
  pendingDocCount?: number;
  // Personal section
  fullName?: string;
  email?: string;
  phone?: string;
  addressLine?: string;
  city?: string;
  pincode?: string;
  // Lifestyle section
  housingType?: string;
  hasYard?: boolean;
  otherPetsCount?: number;
  workScheduleHours?: number;
  // Experience section
  prevPetOwnership?: boolean;
  prevPetDetails?: string;
  vetSupport?: string;
  // Consent section
  consentHomeVisit?: boolean;
  consentFollowUp?: boolean;
  consentBackgroundCheck?: boolean;
  // NGO fields
  ngoComments?: string;
  documents?: ApplicationDocument[];
}

export interface ApplicationDocument {
  id: string;
  documentType: 'ID_PROOF' | 'ADDRESS_PROOF' | 'OTHER';
  fileName: string;
  fileUrl?: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
}

export interface NgoListingCreateRequest {
  name: string;
  species: string;
  breed?: string;
  ageMonths?: number;
  gender?: string;
  description?: string;
  temperament?: string;
  medicalSummary?: string;
  vaccinationStatus?: string;
  specialNeeds?: boolean;
  specialNeedsNotes?: string;
  locationCity: string;
  isAdoptionReady: boolean;
}

export interface NgoReviewRequest {
  reason?: string;
  questions?: string[];
}
