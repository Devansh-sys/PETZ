import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Navbar } from '../../shared/navbar/navbar';
import { AuthService } from '../../core/auth/auth.service';
import { GeoService } from '../../core/geo/geo.service';
import { SosService } from '../../core/sos/sos.service';
import { UrgencyLevel } from '../../core/sos/sos.models';
import { asRateLimit } from '../../core/auth/rate-limit';

@Component({
  selector: 'petz-sos-report',
  imports: [FormsModule, Navbar, RouterLink],
  templateUrl: './sos-report.html',
  styleUrl: './sos-report.scss'
})
export class SosReport implements OnInit {
  private auth = inject(AuthService);
  private geo = inject(GeoService);
  private sos = inject(SosService);
  private router = inject(Router);

  latitude = signal<number | null>(null);
  longitude = signal<number | null>(null);
  accuracy = signal<number | null>(null);
  manualLocation = signal(false);

  urgency = signal<UrgencyLevel | null>(null);
  description = signal('');
  maxDescription = 500;

  locating = signal(false);
  submitting = signal(false);
  locationError = signal<string | null>(null);
  error = signal<string | null>(null);

  readonly urgencyOptions: Array<{ value: UrgencyLevel; label: string; hint: string; emoji: string }> = [
    { value: 'CRITICAL', label: 'Critical', hint: 'Life-threatening — bleeding, hit, unresponsive', emoji: '🚨' },
    { value: 'MODERATE', label: 'Moderate', hint: 'Injured but stable — limping, visible wound', emoji: '⚠️' },
    { value: 'LOW', label: 'Low',      hint: 'Healthy but stranded — lost, trapped, hungry', emoji: '🐾' }
  ];

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/sos/auth']);
      return;
    }
    this.captureLocation();
  }

  async captureLocation(): Promise<void> {
    this.locationError.set(null);
    this.locating.set(true);
    try {
      const pos = await this.geo.getCurrentPosition();
      this.latitude.set(+pos.latitude.toFixed(6));
      this.longitude.set(+pos.longitude.toFixed(6));
      this.accuracy.set(Math.round(pos.accuracy));
      this.manualLocation.set(false);
    } catch (e: any) {
      this.locationError.set(e?.message ?? 'Could not get your location.');
      this.manualLocation.set(true);
    } finally {
      this.locating.set(false);
    }
  }

  setLat(v: string): void {
    const n = parseFloat(v);
    this.latitude.set(Number.isFinite(n) ? n : null);
  }

  setLng(v: string): void {
    const n = parseFloat(v);
    this.longitude.set(Number.isFinite(n) ? n : null);
  }

  onDescription(v: string): void {
    this.description.set(v.slice(0, this.maxDescription));
  }

  get descriptionLength(): number {
    return this.description().length;
  }

  get canSubmit(): boolean {
    const lat = this.latitude();
    const lng = this.longitude();
    return (
      !this.submitting() &&
      !!this.urgency() &&
      lat !== null && lat >= -90 && lat <= 90 &&
      lng !== null && lng >= -180 && lng <= 180
    );
  }

  submit(): void {
    if (!this.canSubmit) return;
    const session = this.auth.session();
    if (!session) {
      this.router.navigate(['/sos/auth']);
      return;
    }
    this.error.set(null);
    this.submitting.set(true);
    this.sos.createReport({
      reporterId: session.userId,
      latitude: this.latitude()!,
      longitude: this.longitude()!,
      urgencyLevel: this.urgency()!,
      description: this.description().trim() || undefined
    }).subscribe({
      next: report => {
        this.submitting.set(false);
        sessionStorage.setItem('petz.activeReport', JSON.stringify(report));
        this.router.navigate(['/sos/report', report.id, 'media']);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        const rl = asRateLimit(err);
        if (rl) {
          sessionStorage.setItem('petz.rateLimit', JSON.stringify(rl));
          this.router.navigate(['/sos/rate-limit']);
          return;
        }
        this.error.set(err.error?.message ?? 'Could not submit SOS report. Please try again.');
      }
    });
  }
}
