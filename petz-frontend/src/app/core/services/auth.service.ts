import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'petz_token';
  private readonly USER_KEY  = 'petz_user';

  currentUser$ = new BehaviorSubject<AuthResponse | null>(this.getStoredUser());

  constructor(private http: HttpClient, private router: Router) {}

  register(data: { name: string; email: string; password: string; phone?: string; role?: string }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/register`, data).pipe(
      // Only store auth if a real token was issued (NGO/HOSPITAL pending approval get token=null)
      tap(res => { if (res.success && res.data?.token) this.storeAuth(res.data); })
    );
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => { if (res.success) this.storeAuth(res.data); })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser$.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && token !== 'null'; // guard against localStorage storing the string "null"
  }

  getRole(): string | null {
    return this.currentUser$.value?.role ?? null;
  }

  getUserId(): number | null {
    return this.currentUser$.value?.userId ?? null;
  }

  private storeAuth(data: AuthResponse): void {
    if (data.token) localStorage.setItem(this.TOKEN_KEY, data.token); // never store null as "null" string
    localStorage.setItem(this.USER_KEY, JSON.stringify(data));
    this.currentUser$.next(data);
  }

  private getStoredUser(): AuthResponse | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
