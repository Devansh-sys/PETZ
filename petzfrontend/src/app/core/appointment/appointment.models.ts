export interface PetResponse {
  id: string;
  ownerId: string;
  name: string;
  species: string;
  breed: string;
  dateOfBirth: string;
  active: boolean;
}

export interface PetCreateRequest {
  ownerId: string;
  name: string;
  species: string;
  breed?: string;
  dateOfBirth?: string;
}

export interface SlotLockResponse {
  lockId: string;
  slotId: string;
  expiresAt: string;
  remainingSeconds: number;
}

export interface AppointmentCreateRequest {
  userId: string;
  petId: string;
  hospitalId: string;
  serviceId: string;
  doctorId: string;
  slotId: string;
}

export interface BookingConfirmationResponse {
  appointmentId: string;
  status: string;
  appointmentType: string;
  petName: string;
  petSpecies: string;
  hospitalName: string;
  hospitalAddress: string;
  hospitalPhone: string;
  doctorName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentStartTime: string;
  appointmentEndTime: string;
  confirmationMessage: string;
}

export interface AppointmentResponse {
  id: string;
  petName: string;
  petSpecies: string;
  hospitalName: string;
  hospitalAddress: string;
  hospitalPhone: string;
  serviceName: string;
  doctorName: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  appointmentType: string;
  status: string;
  bookedAt: string;
}

export interface BookingState {
  hospitalId?: string;
  hospitalName?: string;
  hospitalAddress?: string;
  hospitalPhone?: string;
  serviceId?: string;
  serviceName?: string;
  serviceType?: string;
  doctorId?: string;
  doctorName?: string;
  doctorSpecialization?: string;
  slotId?: string;
  slotDate?: string;
  slotStart?: string;
  slotEnd?: string;
  lockId?: string;
  petId?: string;
  petName?: string;
  petSpecies?: string;
}
