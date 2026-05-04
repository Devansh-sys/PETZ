import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';
import { AdoptionService } from '../../core/adoption/adoption.service';
import { AdoptionApplication } from '../../core/adoption/adoption.models';

@Component({
  selector: 'petz-adopt-application-view',
  imports: [CommonModule, Navbar, Footer, RouterLink],
  templateUrl: './adopt-application-view.html',
  styleUrl: './adopt-application-view.scss'
})
export class AdoptApplicationView implements OnInit {
  app: AdoptionApplication | null = null;
  loading = true;
  error = '';
  withdrawing = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adoptionService: AdoptionService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.adoptionService.getApplication(id).subscribe({
      next: (a) => { this.app = a; this.loading = false; },
      error: () => { this.error = 'Could not load application details.'; this.loading = false; }
    });
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = {
      DRAFT: 'Draft', SUBMITTED: 'Submitted', UNDER_REVIEW: 'Under Review',
      CLARIFICATION_REQUESTED: 'Clarification Needed', APPROVED: 'Approved',
      REJECTED: 'Rejected', WITHDRAWN: 'Withdrawn'
    };
    return m[s] ?? s;
  }

  statusClass(s: string): string {
    const m: Record<string, string> = {
      DRAFT: 'grey', SUBMITTED: 'blue', UNDER_REVIEW: 'blue',
      CLARIFICATION_REQUESTED: 'orange', APPROVED: 'green',
      REJECTED: 'red', WITHDRAWN: 'grey'
    };
    return m[s] ?? 'grey';
  }

  get canWithdraw(): boolean {
    return ['SUBMITTED', 'UNDER_REVIEW', 'CLARIFICATION_REQUESTED'].includes(this.app?.status ?? '');
  }

  withdraw(): void {
    if (!this.app || !this.canWithdraw) return;
    this.withdrawing = true;
    this.adoptionService.withdrawApplication(this.app.id).subscribe({
      next: () => this.router.navigate(['/my-adoptions']),
      error: () => { this.withdrawing = false; }
    });
  }
}
