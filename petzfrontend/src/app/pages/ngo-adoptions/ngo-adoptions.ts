import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { AdoptionService } from '../../core/adoption/adoption.service';
import { AdoptionApplication } from '../../core/adoption/adoption.models';
import { AuthService } from '../../core/auth/auth.service';

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
  filterStatus = 'PENDING';

  constructor(private adoptionService: AdoptionService, private auth: AuthService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.adoptionService.ngoListApplications(this.filterStatus || undefined).subscribe({
      next: (apps) => { this.applications = apps; this.loading = false; },
      error: () => { this.error = 'Could not load applications.'; this.loading = false; }
    });
  }

  statusLabel(s: string): string {
    const m: Record<string, string> = {
      DRAFT: 'Draft', PENDING: 'Pending', UNDER_REVIEW: 'Under Review',
      CLARIFICATION_REQUESTED: 'Clarification', APPROVED: 'Approved',
      REJECTED: 'Rejected', WITHDRAWN: 'Withdrawn'
    };
    return m[s] ?? s;
  }

  statusClass(s: string): string {
    const m: Record<string, string> = {
      PENDING: 'blue', UNDER_REVIEW: 'blue', CLARIFICATION_REQUESTED: 'orange',
      APPROVED: 'green', REJECTED: 'red', DRAFT: 'grey', WITHDRAWN: 'grey'
    };
    return m[s] ?? 'grey';
  }
}
