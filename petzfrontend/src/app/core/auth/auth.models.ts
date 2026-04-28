export interface SendOtpRequest { phone: string; }
export interface SendOtpResponse {
  message: string;
  expiresInSeconds: number;
  authMethod: 'OTP';
}

export interface VerifyOtpRequest { phone: string; otp: string; }

export interface MissedCallInitiateResponse {
  message: string;
  callbackNumber: string;
  timeoutSeconds: number;
  authMethod: 'MISSED_CALL';
}

export interface MissedCallVerifyRequest {
  phone: string;
  verificationToken: string;
}

export interface AuthSession {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  userId: string;
  role: 'REPORTER' | string;
  isTemporarySession: boolean;
  message: string;
  phone?: string;
}

export interface ApiError {
  status: number;
  error: string;
  message: string;
  path?: string;
  timestamp?: string;
  retryAfterSeconds?: number;
}
