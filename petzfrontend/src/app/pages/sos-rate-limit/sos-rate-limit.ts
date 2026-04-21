import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { RateLimitInfo } from '../../core/auth/rate-limit';

@Component({
  selector: 'petz-sos-rate-limit',
  imports: [Navbar, RouterLink],
  templateUrl: './sos-rate-limit.html',
  styleUrl: './sos-rate-limit.scss'
})
export class SosRateLimit implements OnInit, OnDestroy {
  remaining = signal(3600);
  message = signal('You have reached the SOS limit for this hour.');
  private tick?: number;

  ngOnInit(): void {
    const raw = sessionStorage.getItem('petz.rateLimit');
    if (raw) {
      try {
        const info = JSON.parse(raw) as RateLimitInfo;
        this.remaining.set(info.retryAfterSeconds);
        this.message.set(info.message);
      } catch {}
    }
    this.tick = window.setInterval(() => {
      const next = this.remaining() - 1;
      this.remaining.set(next <= 0 ? 0 : next);
      if (next <= 0) { clearInterval(this.tick); }
    }, 1000);
  }

  ngOnDestroy(): void { clearInterval(this.tick); }

  get formatTime(): string {
    const s = this.remaining();
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  }
}
