import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';
import { AdoptionService } from '../../core/adoption/adoption.service';
import { AdoptionApplication } from '../../core/adoption/adoption.models';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'petz-my-adoptions',
  imports: [CommonModule, Navbar, Footer, RouterLink],
  templateUrl: './my-adoptions.html',
  styleUrl: './my-adoptions.scss'
})
export class MyAdoptions implements OnInit {
  applications: AdoptionApplication[] = [];
  loading = true;
  error = '';

  constructor(private adoptionService: AdoptionService, private auth: AuthService) {}

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) { this.error = 'Please log in.'; this.loading = false; return; }
    this.adoptionService.getMyApplications().subscribe({
      next: (list) => { this.applications = list; this.loading = false; },
      error: () => { this.error = 'Could not load your applications.'; this.loading = false; }
    });
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = {
      DRAFT: 'Draft', SUBMITTED: 'Submitted', PENDING: 'Pending Review',
      UNDER_REVIEW: 'Under Review', CLARIFICATION_REQUESTED: 'Clarification Needed',
      APPROVED: 'Approved', REJECTED: 'Rejected', WITHDRAWN: 'Withdrawn'
    };
    return m[s] ?? s;
  }

  statusClass(s: string): string {
    const m: Record<string, string> = {
      DRAFT: 'grey', SUBMITTED: 'blue', PENDING: 'blue', UNDER_REVIEW: 'blue',
      CLARIFICATION_REQUESTED: 'orange', APPROVED: 'green',
      REJECTED: 'red', WITHDRAWN: 'grey'
    };
    return m[s] ?? 'grey';
  }

  speciesIcon(s: string): string {
    const m: Record<string, string> = { DOG: '🐕', CAT: '🐈', BIRD: '🦜', RABBIT: '🐇' };
    return m[s?.toUpperCase()] ?? '🐾';
  }
}
