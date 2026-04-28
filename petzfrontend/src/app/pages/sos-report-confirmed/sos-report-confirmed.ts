import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { SosService } from '../../core/sos/sos.service';
import { SosReportResponse, UrgencyLevel } from '../../core/sos/sos.models';

@Component({
  selector: 'petz-sos-report-confirmed',
  imports: [Navbar, RouterLink],
  templateUrl: './sos-report-confirmed.html',
  styleUrl: './sos-report-confirmed.scss'
})
export class SosReportConfirmed implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sos = inject(SosService);

  report = signal<SosReportResponse | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/sos/report']); return; }

    const cached = sessionStorage.getItem('petz.activeReport');
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as SosReportResponse;
        if (parsed.id === id) {
          this.report.set(parsed);
          return;
        }
      } catch { /* ignore */ }
    }

    this.loading.set(true);
    this.sos.getReport(id).subscribe({
      next: r => { this.report.set(r); this.loading.set(false); },
      error: err => { this.error.set(err.error?.message ?? 'Could not load report.'); this.loading.set(false); }
    });
  }

  urgencyLabel(u: UrgencyLevel | undefined): string {
    switch (u) {
      case 'CRITICAL': return '🚨 Critical';
      case 'MODERATE': return '⚠️ Moderate';
      case 'LOW':      return '🐾 Low';
      default: return '';
    }
  }

  caseCode(): string {
    const id = this.report()?.id ?? '';
    return id ? id.slice(0, 8).toUpperCase() : '—';
  }
}
