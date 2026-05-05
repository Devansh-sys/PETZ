import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { AuthService } from '../../core/auth/auth.service';

const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/;

@Component({
  selector: 'petz-sos-auth-phone',
  imports: [FormsModule, Navbar, RouterLink],
  templateUrl: './sos-auth-phone.html',
  styleUrl: './sos-auth-phone.scss'
})
export class SosAuthPhone {
  private auth = inject(AuthService);
  private router = inject(Router);

  phone = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  notice = signal<string | null>(null);

  constructor() {
    // If already signed in, skip phone auth entirely — go straight to report
    if (this.auth.isAuthenticated()) {
      sessionStorage.removeItem('petz.authNotice');
      this.router.navigate(['/sos/report']);
      return;
    }

    const pending = sessionStorage.getItem('petz.pendingPhone');
    if (pending) this.phone.set(pending.replace(/^\+91/, ''));

    // Only show the notice if it's NOT the generic "please sign in" message,
    // since this page itself handles unauthenticated users by design.
    const msg = sessionStorage.getItem('petz.authNotice');
    sessionStorage.removeItem('petz.authNotice');
    if (msg && !msg.toLowerCase().includes('sign in')) {
      this.notice.set(msg);
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

  proceed(): void {
    if (!this.canSubmit || this.loading()) return;
    this.error.set(null);
    this.loading.set(true);
    const phone = this.normalize();
    this.auth.quickSosSession(phone).subscribe({
      next: () => {
        sessionStorage.removeItem('petz.pendingPhone');
        this.router.navigate(['/sos/report']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Could not start emergency session. Please try again.');
      }
    });
  }
}
