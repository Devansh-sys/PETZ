import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { AdoptionService } from '../../core/adoption/adoption.service';
import { AdoptionApplication } from '../../core/adoption/adoption.models';

@Component({
  selector: 'petz-ngo-adoptions',
  imports: [CommonModule, FormsModule, Navbar, RouterLink],
  templateUrl: './ngo-adoptions.html',
  styleUrl: './ngo-adoptions.scss'
})
export class NgoAdoptions implements OnInit {
  applications: AdoptionApplication[] = [];
  loading = true;
  error = '';
  filterStatus = '';

  // Inline action state
  actionInProgress: string | null = null;
  actionError = '';

  // Reject modal
  rejectingId: string | null = null;
  rejectReason = '';
  rejectBusy = false;
  rejectError = '';

  constructor(private adoptionService: AdoptionService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.adoptionService.ngoListApplications(this.filterStatus || undefined).subscribe({
      next: (apps) => { this.applications = apps; this.loading = false; },
      error: () => { this.error = 'Could not load applications.'; this.loading = false; }
    });
  }

  approve(app: AdoptionApplication): void {
    if (this.actionInProgress) return;
    this.actionInProgress = app.id;
    this.actionError = '';
    this.adoptionService.ngoApprove(app.id, 'Approved by NGO').subscribe({
      next: (updated) => {
        const idx = this.applications.findIndex(a => a.id === app.id);
        if (idx > -1) this.applications[idx] = updated;
        this.actionInProgress = null;
      },
      error: (err) => {
        this.actionError = err.error?.message ?? 'Could not approve application.';
        this.actionInProgress = null;
      }
    });
  }

  openReject(app: AdoptionApplication): void {
    this.rejectingId = app.id;
    this.rejectReason = '';
    this.rejectError = '';
  }

  closeReject(): void {
    this.rejectingId = null;
    this.rejectError = '';
  }

  submitReject(): void {
    if (!this.rejectReason.trim()) { this.rejectError = 'Please provide a reason.'; return; }
    this.rejectBusy = true;
    this.rejectError = '';
    this.adoptionService.ngoReject(this.rejectingId!, this.rejectReason.trim()).subscribe({
      next: (updated) => {
        const idx = this.applications.findIndex(a => a.id === this.rejectingId);
        if (idx > -1) this.applications[idx] = updated;
        this.rejectBusy = false;
        this.rejectingId = null;
      },
      error: (err) => {
        this.rejectError = err.error?.message ?? 'Could not reject application.';
        this.rejectBusy = false;
      }
    });
  }

  isPending(app: AdoptionApplication): boolean {
    return app.status === 'SUBMITTED' || app.status === 'UNDER_REVIEW' || app.status === 'CLARIFICATION_REQUESTED';
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = {
      DRAFT: 'Draft', SUBMITTED: 'Pending', UNDER_REVIEW: 'Pending',
      CLARIFICATION_REQUESTED: 'Pending', APPROVED: 'Approved',
      REJECTED: 'Rejected', WITHDRAWN: 'Withdrawn'
    };
    return m[s] ?? s;
  }

  statusClass(s: string): string {
    const m: Record<string, string> = {
      SUBMITTED: 'blue', UNDER_REVIEW: 'blue', CLARIFICATION_REQUESTED: 'blue',
      APPROVED: 'green', REJECTED: 'red', DRAFT: 'grey', WITHDRAWN: 'grey'
    };
    return m[s] ?? 'grey';
  }

  formatDate(ts?: string): string {
    if (!ts) return '—';
    return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
