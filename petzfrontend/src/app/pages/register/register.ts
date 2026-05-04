import { Component, signal, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../shared/navbar/navbar';
import { FirebasePhoneService } from '../../core/auth/firebase-phone.service';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';
import {
  PHONE_RE,
  EMAIL_RE,
  STRONG_PASSWORD_RE,
  passwordWeakness,
  normalizePhone,
} from '../../core/auth/validation';

type Step = 'PHONE' | 'OTP' | 'PROFILE';

@Component({
  selector: 'petz-register',
  imports: [NgIf, FormsModule, Navbar, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private fp = inject(FirebasePhoneService);
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);

  step = signal<Step>('PHONE');
  phone = signal('');
  otp = signal('');
  fullName = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  passwordVisible = signal(false);
  confirmVisible = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  resendCooldown = signal(0);
  private cooldownTimer?: number;

  togglePasswordVisibility(): void { this.passwordVisible.update(v => !v); }
  toggleConfirmVisibility(): void { this.confirmVisible.update(v => !v); }

  get normalizedPhone(): string { return normalizePhone(this.phone()); }

  // ─── Inline validation hints (null = no error) ───
  get phoneHint(): string | null {
    if (!this.phone().trim()) return null;
    return PHONE_RE.test(this.normalizedPhone)
      ? null
      : 'Enter a valid 10-digit Indian mobile number (starting with 6–9).';
  }

  get emailHint(): string | null {
    const v = this.email().trim();
    if (!v) return null;
    return EMAIL_RE.test(v) ? null : 'Enter a valid email like name@example.com.';
  }

  get nameHint(): string | null {
    const v = this.fullName().trim();
    if (!v) return null;
    return v.length >= 2 ? null : 'Name must be at least 2 characters.';
  }

  /** Inline guidance for the password field (uses passwordWeakness helper). */
  get passwordHint(): string | null { return passwordWeakness(this.password()); }

  get confirmHint(): string | null {
    if (!this.confirmPassword()) return null;
    return this.passwordsMatch ? null : 'Passwords do not match.';
  }

  get canPhone(): boolean { return PHONE_RE.test(this.normalizedPhone); }
  get canOtp(): boolean { return /^\d{6}$/.test(this.otp()); }
  get passwordsMatch(): boolean { return this.password() === this.confirmPassword(); }
  get canProfile(): boolean {
    return this.fullName().trim().length >= 2
      && EMAIL_RE.test(this.email().trim())
      && STRONG_PASSWORD_RE.test(this.password())
      && this.passwordsMatch;
  }

  async sendOtp(): Promise<void> {
    if (!this.canPhone || this.loading()) return;
    this.error.set(null);
    this.loading.set(true);
    try {
      await this.fp.sendOtp(this.normalizedPhone);
      this.step.set('OTP');
      this.startCooldown();
    } catch (e: any) {
      this.error.set(e?.message ?? 'Could not send OTP. Please try again.');
    } finally { this.loading.set(false); }
  }

  async verifyOtp(): Promise<void> {
    if (!this.canOtp || this.loading()) return;
    this.error.set(null);
    this.loading.set(true);
    try {
      await this.fp.verifyOtp(this.otp());
      this.fp.reset();
      const session = this.auth.session();
      if (session?.isTemporarySession) {
        this.step.set('PROFILE');
      } else {
        this.router.navigate(['/']);
      }
    } catch (e: any) {
      this.error.set(e?.message ?? 'Invalid or expired OTP.');
      this.otp.set('');
    } finally { this.loading.set(false); }
  }

  onOtpInput(v: string): void {
    const d = v.replace(/\D/g, '').slice(0, 6);
    this.otp.set(d);
    if (d.length === 6) this.verifyOtp();
  }

  saveProfile(): void {
    if (!this.canProfile || this.loading()) return;
    const session = this.auth.session();
    if (!session) return;
    this.loading.set(true);
    this.error.set(null);
    this.http.post<any>(
      `${environment.apiBaseUrl}/auth/convert-session?userId=${session.userId}`,
      { fullName: this.fullName().trim(), email: this.email().trim(), password: this.password() }
    ).subscribe({
      next: (res) => {
        this.auth.updateSession({
          accessToken: res.accessToken ?? session.accessToken,
          isTemporarySession: false
        });
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (e) => { this.loading.set(false); this.error.set(e?.error?.message ?? 'Could not save profile.'); }
    });
  }

  back(): void { this.step.set('PHONE'); this.otp.set(''); this.error.set(null); }

  async resend(): Promise<void> {
    if (this.resendCooldown() > 0) return;
    this.loading.set(true);
    this.fp.reset();
    try { await this.fp.sendOtp(this.normalizedPhone); this.startCooldown(); }
    catch (e: any) { this.error.set(e?.message ?? 'Could not resend.'); }
    finally { this.loading.set(false); }
  }

  private startCooldown(): void {
    this.resendCooldown.set(30);
    clearInterval(this.cooldownTimer);
    this.cooldownTimer = window.setInterval(() => {
      const n = this.resendCooldown() - 1;
      if (n <= 0) { this.resendCooldown.set(0); clearInterval(this.cooldownTimer); }
      else this.resendCooldown.set(n);
    }, 1000);
  }

  get maskedPhone(): string {
    const p = this.normalizedPhone;
    return p.length >= 6 ? `${p.slice(0, 3)} ••••• ${p.slice(-2)}` : p;
  }
}
