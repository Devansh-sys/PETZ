export type UrgencyLevel = 'CRITICAL' | 'MODERATE' | 'LOW';

export type ReportStatus =
  | 'REPORTED'
  | 'REJECTED'
  | 'DISPATCHED'
  | 'ON_SITE'
  | 'TRANSPORTING'
  | 'COMPLETE'
  | 'MISSION_COMPLETE'
  | 'FLAGGED'
  | 'CLOSED';

export type MediaType = 'PHOTO' | 'VIDEO';

export interface SosReportCreateRequest {
  reporterId: string;
  latitude: number;
  longitude: number;
  urgencyLevel: UrgencyLevel;
  description?: string;
}

export interface SosMediaResponse {
  id: string;
  fileUrl: string;
  mediaType: MediaType;
}

export interface SosReportResponse {
  id: string;
  reporterId: string;
  reporterName?: string;
  latitude: number;
  longitude: number;
  urgencyLevel: UrgencyLevel;
  currentStatus: ReportStatus;
  description?: string;
  reportedAt: string;
  media: SosMediaResponse[];
}

export interface RescueMissionResponse {
  id: string;
  sosReportId: string;
  assignedNgoUserId?: string;
  assignedNgoUserName?: string;
  rescueStatus: ReportStatus;
  etaMinutes?: number;
  dispatchedAt?: string;
  onSiteAt?: string;
  transportingAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MissionSummaryResponse {
  id: string;
  rescueMissionId: string;
  outcome: string;
  timeline?: string;
  notes?: string;
  submittedByUserId: string;
  submittedByUserName?: string;
  submittedAt: string;
}

export type AssessmentDecision = 'TRANSPORT_TO_HOSPITAL' | 'RELEASE' | 'CANNOT_LOCATE';

export interface ArrivalRequest {
  volunteerId: string;
  currentLatitude: number;
  currentLongitude: number;
}

export interface OnSiteAssessmentRequest {
  volunteerId: string;
  animalCondition: string;
  injuryDescription?: string;
  decision: AssessmentDecision;
  decisionJustification: string;
}

export interface OnSiteAssessmentResponse {
  assessmentId: string;
  sosReportId: string;
  decision: AssessmentDecision;
  animalCondition: string;
  assessedAt: string;
  nextStep: 'HOSPITAL_SELECTION' | 'RELEASE_CONFIRMATION' | 'CANNOT_LOCATE';
}

export interface NearbyHospitalResponse {
  hospitalId: string;
  name: string;
  distanceKm: number;
  services: string;
  emergencyReady: boolean;
}

export interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

export interface NavigationDTO {
  lat: number;
  lon: number;
  eta: string;
}

export interface HandoverResponse {
  handoverId: string;
  sosReportId: string;
  hospitalId: string;
  handoverAt: string;
  rescueStatus: string;
}

export interface RescueHistoryResponse {
  sosId: string;
  reportedAt: string;
  latitude: number;
  longitude: number;
  urgencyLevel: UrgencyLevel;
  status: ReportStatus;
  description: string;
  outcome: string;
}

export interface NgoAssignment {
  assignmentId?: string;
  sosReportId: string;
  description?: string;
  latitude: number;
  longitude: number;
  urgencyLevel: UrgencyLevel;
  sosStatus: ReportStatus;
  assignmentStatus: 'OPEN' | 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'ARRIVED' | 'REASSIGNED';
  reporterName?: string;
  reporterPhone?: string;
  reportedAt: string;
  assignedAt?: string;
}
