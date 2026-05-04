import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { AdoptionService } from '../../core/adoption/adoption.service';
import { AdoptionApplication, ApplicationStatus } from '../../core/adoption/adoption.models';
import { AuthService } from '../../core/auth/auth.service';
@Component({
  selector: 'petz-ngo-adoption-review',
  imports: [CommonModule, FormsModule, Navbar, RouterLink],
  templateUrl: './ngo-adoption-review.html',
  styleUrl: './ngo-adoption-review.scss'
})
export class NgoAdoptionReview implements OnInit {
  application: AdoptionApplication | null = null;
  loading = true;
  error = '';
  actionError = '';
  busy = false;
  showRejectDialog = false;
  showClarifyDialog = false;
  rejectReason = '';
  clarifyQuestion = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adoptionService: AdoptionService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const appId = this.route.snapshot.paramMap.get('id')!;
    this.adoptionService.ngoGetApplication(appId).subscribe({
      next: (app) => { this.application = app; this.loading = false; },
      error: () => { this.error = 'Could not load application.'; this.loading = false; }
    });
  }

  startReview(): void {
    this.busy = true;
    this.adoptionService.ngoStartReview(this.application!.id).subscribe({
      next: (app) => { this.application = app; this.busy = false; },
      error: () => { this.actionError = 'Action failed.'; this.busy = false; }
    });
  }

  approve(): void {
    this.busy = true;
    this.adoptionService.ngoApprove(this.application!.id, this.application?.ngoComments).subscribe({
      next: (app) => { this.application = app; this.busy = false; },
      error: () => { this.actionError = 'Approval failed.'; this.busy = false; }
    });
  }

  confirmReject(): void {
    this.busy = true;
    this.adoptionService.ngoReject(this.application!.id, this.rejectReason).subscribe({
      next: (app) => { this.application = app; this.busy = false; this.showRejectDialog = false; },
      error: () => { this.actionError = 'Rejection failed.'; this.busy = false; }
    });
  }

  confirmClarify(): void {
    this.busy = true;
    this.adoptionService.ngoClarify(this.application!.id, { questions: [this.clarifyQuestion] }).subscribe({
      next: (app) => { this.application = app; this.busy = false; this.showClarifyDialog = false; },
      error: () => { this.actionError = 'Failed to request clarification.'; this.busy = false; }
    });
  }

  statusClass(s: string): string {
    const m: Record<string, string> = { SUBMITTED: 'blue', PENDING: 'blue', UNDER_REVIEW: 'blue', CLARIFICATION_REQUESTED: 'orange', APPROVED: 'green', REJECTED: 'red', DRAFT: 'grey', WITHDRAWN: 'grey' };
    return m[s] ?? 'grey';
  }
}
