import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { AdoptionService } from '../../core/adoption/adoption.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'petz-ngo-dashboard',
  imports: [CommonModule, Navbar, RouterLink],
  templateUrl: './ngo-dashboard.html',
  styleUrl: './ngo-dashboard.scss'
})
export class NgoDashboard implements OnInit {
  stats = { totalPets: 0, activePets: 0, pendingApplications: 0, approvedAdoptions: 0 };
  recentApplications: any[] = [];
  loading = true;

  constructor(private adoptionService: AdoptionService, private auth: AuthService) {}

  ngOnInit(): void {
    const ngoId = this.auth.session()?.userId;
    if (!ngoId) return;
    this.adoptionService.ngoListApplications('PENDING').subscribe({
      next: (apps) => {
        this.recentApplications = apps.slice(0, 5);
        this.stats.pendingApplications = apps.length;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
    this.adoptionService.ngoListPets().subscribe({
      next: (pets) => {
        this.stats.totalPets = pets.length;
        this.stats.activePets = pets.filter((p: any) => p.status !== 'ARCHIVED').length;
      }
    });
  }

  statusClass(s: string): string {
    const m: Record<string, string> = { PENDING: 'blue', UNDER_REVIEW: 'blue', APPROVED: 'green', REJECTED: 'red', CLARIFICATION_REQUESTED: 'orange' };
    return m[s] ?? 'grey';
  }
}
