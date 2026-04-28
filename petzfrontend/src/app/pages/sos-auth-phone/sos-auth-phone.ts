import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { FirebasePhoneService } from '../../core/auth/firebase-phone.service';

const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/;

@Component({
  selector: 'petz-sos-auth-phone',
  imports: [FormsModule, Navbar, RouterLink],
  templateUrl: './sos-auth-phone.html',
  styleUrl: './sos-auth-phone.scss'
})
export class SosAuthPhone {
  private firebasePhone = inject(FirebasePhoneService);
  private router = inject(Router);

  phone = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  notice = signal<string | null>(null);

  constructor() {
    const pending = sessionStorage.getItem('petz.pendingPhone');
    if (pending) this.phone.set(pending.replace(/^\+91/, ''));
    const msg = sessionStorage.getItem('petz.authNotice');
    if (msg) {
      this.notice.set(msg);
      sessionStorage.removeItem('petz.authNotice');
    }
  }

  get canSubmit(): boolean {
    return PHONE_REGEX.test(this.phone().trim());
  }

  normalize(): string {
    const raw = this.phone().trim();
    if (raw.startsWith('+')) return raw;
    if (raw.length === 10) return `+91${raw}`;
    return raw;
  }

  async requestOtp(): Promise<void> {
    if (!this.canSubmit || this.loading()) return;
    this.error.set(null);
    this.loading.set(true);
    const phone = this.normalize();
    try {
      await this.firebasePhone.sendOtp(phone);
      sessionStorage.setItem('petz.pendingPhone', phone);
      this.router.navigate(['/sos/auth/otp']);
    } catch (e: any) {
      this.error.set(this.readableError(e));
    } finally {
      this.loading.set(false);
    }
  }

  useMissedCall(): void {
    if (!this.canSubmit) return;
    sessionStorage.setItem('petz.pendingPhone', this.normalize());
    this.router.navigate(['/sos/auth/missed-call']);
  }

  private readableError(e: any): string {
    const code = e?.code ?? '';
    if (code === 'auth/invalid-phone-number')    return 'That phone number looks invalid. Include country code.';
    if (code === 'auth/too-many-requests')       return 'Too many attempts. Please wait and try again.';
    if (code === 'auth/quota-exceeded')          return 'SMS quota exceeded on this Firebase project.';
    if (code === 'auth/invalid-app-credential')  return 'reCAPTCHA failed. Refresh the page and try again.';
    if (code === 'auth/captcha-check-failed')    return 'reCAPTCHA check failed. Refresh the page.';
    if (code === 'auth/billing-not-enabled')     return 'Firebase billing not enabled. Enable Blaze plan, or add a test phone number in the Firebase console.';
    if (code === 'auth/operation-not-allowed')   return 'Phone sign-in is not enabled in Firebase. Enable it under Authentication → Sign-in method.';
    if (code === 'auth/unauthorized-domain')     return 'This domain is not authorized in Firebase. Add it under Authentication → Settings → Authorized domains.';
    return e?.message ?? 'Could not send OTP. Please try again.';
  }
}
