import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { FirebasePhoneService } from '../../core/auth/firebase-phone.service';

const OTP_TTL_SECONDS = 300;

@Component({
  selector: 'petz-sos-auth-otp',
  imports: [FormsModule, Navbar, RouterLink],
  templateUrl: './sos-auth-otp.html',
  styleUrl: './sos-auth-otp.scss'
})
export class SosAuthOtp implements OnInit, OnDestroy {
  private firebasePhone = inject(FirebasePhoneService);
  private router = inject(Router);

  phone = signal('');
  otp = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  resendCooldown = signal(30);
  expiresIn = signal(OTP_TTL_SECONDS);

  private cooldownTimer?: number;
  private expiryTimer?: number;

  ngOnInit(): void {
    const stored = sessionStorage.getItem('petz.pendingPhone');
    if (!stored) {
      this.router.navigate(['/sos/auth']);
      return;
    }
    // If the page was refreshed (or HMR reloaded the service), the in-memory
    // Firebase ConfirmationResult is gone. Send the user back so they can
    // request a fresh OTP — otherwise verifyOtp would throw cryptically.
    if (!this.firebasePhone.hasPendingConfirmation()) {
      sessionStorage.setItem(
        'petz.authNotice',
        'Your verification session was reset. Please request a new OTP.'
      );
      this.router.navigate(['/sos/auth']);
      return;
    }
    this.phone.set(stored);
    this.startTimers();
  }

  ngOnDestroy(): void {
    clearInterval(this.cooldownTimer);
    clearInterval(this.expiryTimer);
  }

  get maskedPhone(): string {
    const p = this.phone();
    if (p.length < 6) return p;
    return `${p.slice(0, 3)} ••••• ${p.slice(-2)}`;
  }

  get canSubmit(): boolean {
    return /^\d{6}$/.test(this.otp());
  }

  get canResend(): boolean {
    return this.resendCooldown() === 0 && !this.loading();
  }

  onOtpInput(value: string): void {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    this.otp.set(digits);
    if (digits.length === 6) {
      this.verify();
    }
  }

  async verify(): Promise<void> {
    if (!this.canSubmit || this.loading()) return;
    this.error.set(null);
    this.loading.set(true);
    try {
      await this.firebasePhone.verifyOtp(this.otp());
      sessionStorage.removeItem('petz.pendingPhone');
      this.firebasePhone.reset();
      this.router.navigate(['/sos/success']);
    } catch (e: any) {
      this.error.set(this.readableError(e));
      this.otp.set('');
    } finally {
      this.loading.set(false);
    }
  }

  async resend(): Promise<void> {
    if (!this.canResend) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      this.firebasePhone.reset();
      await this.firebasePhone.sendOtp(this.phone());
      this.resendCooldown.set(30);
      this.expiresIn.set(OTP_TTL_SECONDS);
      this.startTimers();
    } catch (e: any) {
      this.error.set(this.readableError(e));
    } finally {
      this.loading.set(false);
    }
  }

  useMissedCall(): void {
    this.router.navigate(['/sos/auth/missed-call']);
  }

  private startTimers(): void {
    clearInterval(this.cooldownTimer);
    clearInterval(this.expiryTimer);
    this.cooldownTimer = window.setInterval(() => {
      const next = this.resendCooldown() - 1;
      if (next <= 0) {
        this.resendCooldown.set(0);
        clearInterval(this.cooldownTimer);
      } else {
        this.resendCooldown.set(next);
      }
    }, 1000);

    this.expiryTimer = window.setInterval(() => {
      const next = this.expiresIn() - 1;
      if (next <= 0) {
        this.expiresIn.set(0);
        clearInterval(this.expiryTimer);
      } else {
        this.expiresIn.set(next);
      }
    }, 1000);
  }

  formatExpiry(): string {
    const s = this.expiresIn();
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  }

  private readableError(e: any): string {
    const code = e?.code ?? '';
    if (code === 'auth/invalid-verification-code') return 'That code is incorrect. Please try again.';
    if (code === 'auth/code-expired') return 'This code has expired. Request a new one.';
    if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait and try again.';
    return e?.message ?? 'Invalid or expired OTP. Try again.';
  }
}
