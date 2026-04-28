import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { AuthService } from '../../core/auth/auth.service';
import { SosService } from '../../core/sos/sos.service';
import { RescueHistoryResponse } from '../../core/sos/sos.models';

@Component({
  selector: 'petz-my-reports',
  imports: [CommonModule, Navbar, RouterLink],
  templateUrl: './my-reports.html',
  styleUrl: './my-reports.scss'
})
export class MyReports implements OnInit {
  reports: RescueHistoryResponse[] = [];
  loading = true;
  error = '';

  constructor(
    private auth: AuthService,
    private sosService: SosService
  ) {}

  ngOnInit(): void {
    const userId = this.auth.session()?.userId;
    if (!userId) { this.loading = false; return; }
    this.sosService.getRescueHistory(userId).subscribe({
      next: (list) => { this.reports = list; this.loading = false; },
      error: () => { this.error = 'Could not load your rescue reports.'; this.loading = false; }
    });
  }

  urgencyLabel(level: string): string {
    switch (level) {
      case 'CRITICAL': return '🚨 Critical';
      case 'MODERATE': return '⚠️ Moderate';
      case 'LOW':      return '🐾 Low';
      default: return level;
    }
  }

  statusClass(status: string): string {
    const s = status?.toUpperCase();
    if (s === 'COMPLETE' || s === 'MISSION_COMPLETE' || s === 'CLOSED') return 'ok';
    if (s === 'DISPATCHED' || s === 'ON_SITE' || s === 'TRANSPORTING') return 'pending';
    return 'warn';
  }

  formatDate(ts: string): string {
    if (!ts) return '—';
    return new Date(ts).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
