import { Component, signal, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { FirebasePhoneService } from '../../core/auth/firebase-phone.service';
import { AuthService } from '../../core/auth/auth.service';

type Step = 'PHONE' | 'OTP';
const PHONE_RE = /^\+?[1-9]\d{7,14}$/;

@Component({
  selector: 'petz-login',
  imports: [NgIf, FormsModule, Navbar, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private fp = inject(FirebasePhoneService);
  private auth = inject(AuthService);
  private router = inject(Router);

  step = signal<Step>('PHONE');
  phone = signal('');
  otp = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  resendCooldown = signal(0);

  private cooldownTimer?: number;

  get normalizedPhone(): string {
    const raw = this.phone().trim();
    if (raw.startsWith('+')) return raw;
    if (raw.length === 10) return `+91${raw}`;
    return raw;
  }

  get canSubmitPhone(): boolean { return PHONE_RE.test(this.normalizedPhone); }
  get canSubmitOtp(): boolean { return /^\d{6}$/.test(this.otp()); }

  async sendOtp(): Promise<void> {
    if (!this.canSubmitPhone || this.loading()) return;
    this.error.set(null);
    this.loading.set(true);
    try {
      await this.fp.sendOtp(this.normalizedPhone);
      this.step.set('OTP');
      this.startCooldown();
    } catch (e: any) {
      this.error.set(e?.message ?? 'Could not send OTP. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  async verifyOtp(): Promise<void> {
    if (!this.canSubmitOtp || this.loading()) return;
    this.error.set(null);
    this.loading.set(true);
    try {
      await this.fp.verifyOtp(this.otp());
      this.fp.reset();
      const session = this.auth.session();
      if (session?.role === 'ADMIN') { this.router.navigate(['/admin']); return; }
      if (session?.role === 'NGO_REP' || session?.role === 'NGO') { this.router.navigate(['/ngo/dashboard']); return; }
      this.router.navigate(['/']);
    } catch (e: any) {
      this.error.set(e?.message ?? 'Invalid or expired OTP.');
      this.otp.set('');
    } finally {
      this.loading.set(false);
    }
  }

  onOtpInput(v: string): void {
    const d = v.replace(/\D/g, '').slice(0, 6);
    this.otp.set(d);
    if (d.length === 6) this.verifyOtp();
  }

  async resend(): Promise<void> {
    if (this.resendCooldown() > 0 || this.loading()) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      this.fp.reset();
      await this.fp.sendOtp(this.normalizedPhone);
      this.startCooldown();
    } catch (e: any) {
      this.error.set(e?.message ?? 'Could not resend OTP.');
    } finally {
      this.loading.set(false);
    }
  }

  back(): void { this.step.set('PHONE'); this.otp.set(''); this.error.set(null); }

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
