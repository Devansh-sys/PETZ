import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthSession,
  MissedCallInitiateResponse,
  MissedCallVerifyRequest,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest
} from './auth.models';

const TOKEN_KEY = 'petz.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/auth`;

  private readonly _session = signal<AuthSession | null>(this.loadFromStorage());
  readonly session = this._session.asReadonly();
  readonly isAuthenticated = computed(() => !!this._session());
  readonly token = computed(() => this._session()?.accessToken ?? null);

  sendOtp(phone: string): Observable<SendOtpResponse> {
    const body: SendOtpRequest = { phone };
    return this.http.post<SendOtpResponse>(`${this.base}/send-otp`, body);
  }

  verifyOtp(phone: string, otp: string): Observable<AuthSession> {
    const body: VerifyOtpRequest = { phone, otp };
    return this.http
      .post<AuthSession>(`${this.base}/verify-otp`, body)
      .pipe(tap(session => this.setSession({ ...session, phone })));
  }

  initiateMissedCall(phone: string): Observable<MissedCallInitiateResponse> {
    return this.http.post<MissedCallInitiateResponse>(`${this.base}/missed-call/initiate`, { phone });
  }

  verifyMissedCall(phone: string, verificationToken: string): Observable<AuthSession> {
    const body: MissedCallVerifyRequest = { phone, verificationToken };
    return this.http
      .post<AuthSession>(`${this.base}/missed-call/verify`, body)
      .pipe(tap(session => this.setSession({ ...session, phone })));
  }

  logout(): void {
    this._session.set(null);
    localStorage.removeItem(TOKEN_KEY);
  }

  /** Creates a local session from an externally-verified identity (e.g. Firebase Phone Auth). */
  setExternalSession(params: { uid: string; phone: string; idToken: string }): AuthSession {
    const session: AuthSession = {
      accessToken: params.idToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
      userId: params.uid,
      role: 'REPORTER',
      isTemporarySession: true,
      message: 'Verified via Firebase Phone Auth',
      phone: params.phone
    };
    this.setSession(session);
    return session;
  }

  private setSession(session: AuthSession): void {
    this._session.set(session);
    localStorage.setItem(TOKEN_KEY, JSON.stringify(session));
  }

  private loadFromStorage(): AuthSession | null {
    try {
      const raw = localStorage.getItem(TOKEN_KEY);
      return raw ? (JSON.parse(raw) as AuthSession) : null;
    } catch {
      return null;
    }
  }
}
