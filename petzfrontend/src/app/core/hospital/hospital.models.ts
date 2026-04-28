export interface HospitalResponse {
  id: string;
  name: string;
  address: string;
  city: string;
  contactPhone: string;
  contactEmail: string;
  operatingHours: string;
  isVerified: boolean;
  emergencyReady: boolean;
  isOpenNow: boolean;
}

export interface HospitalServiceResponse {
  id: string;
  hospitalId: string;
  serviceName: string;
  description: string;
  serviceType: string;
  emergencyDedicated: boolean;
  active: boolean;
}

export interface DoctorResponse {
  id: string;
  hospitalId: string;
  hospitalName: string;
  name: string;
  specialization: string;
  availability: string;
  isActive: boolean;
}

export interface DoctorSlotResponse {
  id: string;
  doctorId: string;
  doctorName: string;
  serviceId: string;
  serviceName: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  available: boolean;
  slotType: 'ROUTINE' | 'EMERGENCY';
}
