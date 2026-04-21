import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Navbar } from '../../shared/navbar/navbar';
import { AuthService } from '../../core/auth/auth.service';
import { asRateLimit } from '../../core/auth/rate-limit';

@Component({
  selector: 'petz-sos-auth-missed-call',
  imports: [Navbar, RouterLink],
  templateUrl: './sos-auth-missed-call.html',
  styleUrl: './sos-auth-missed-call.scss'
})
export class SosAuthMissedCall implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private router = inject(Router);

  phone = signal('');
  callbackNumber = signal<string | null>(null);
  remaining = signal(300);
  status = signal<'initiating' | 'waiting' | 'verified' | 'error'>('initiating');
  error = signal<string | null>(null);

  private tick?: number;
  private verifyTimer?: number;

  ngOnInit(): void {
    const stored = sessionStorage.getItem('petz.pendingPhone');
    if (!stored) {
      this.router.navigate(['/sos/auth']);
      return;
    }
    this.phone.set(stored);
    this.initiate();
  }

  ngOnDestroy(): void {
    clearInterval(this.tick);
    clearInterval(this.verifyTimer);
  }

  private initiate(): void {
    this.status.set('initiating');
    this.error.set(null);
    this.auth.initiateMissedCall(this.phone()).subscribe({
      next: res => {
        this.callbackNumber.set(res.callbackNumber);
        this.remaining.set(res.timeoutSeconds);
        this.status.set('waiting');
        this.startCountdown();
      },
      error: (err: HttpErrorResponse) => {
        const rl = asRateLimit(err);
        if (rl) {
          sessionStorage.setItem('petz.rateLimit', JSON.stringify(rl));
          this.router.navigate(['/sos/rate-limit']);
          return;
        }
        this.status.set('error');
        this.error.set(err.error?.message ?? 'Could not initiate. Please try again.');
      }
    });
  }

  private startCountdown(): void {
    this.tick = window.setInterval(() => {
      const next = this.remaining() - 1;
      if (next <= 0) {
        this.remaining.set(0);
        clearInterval(this.tick);
        if (this.status() === 'waiting') {
          this.status.set('error');
          this.error.set('No missed call detected. Please try again or use OTP.');
        }
      } else {
        this.remaining.set(next);
      }
    }, 1000);
  }

  retry(): void { this.initiate(); }

  tryOtp(): void { this.router.navigate(['/sos/auth/otp']); }

  get formatTime(): string {
    const s = this.remaining();
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  }
}
