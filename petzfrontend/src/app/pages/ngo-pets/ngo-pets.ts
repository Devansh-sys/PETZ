import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { AdoptionService } from '../../core/adoption/adoption.service';
import { AdoptablePet } from '../../core/adoption/adoption.models';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'petz-ngo-pets',
  imports: [CommonModule, Navbar, RouterLink],
  templateUrl: './ngo-pets.html',
  styleUrl: './ngo-pets.scss'
})
export class NgoPets implements OnInit {
  pets: AdoptablePet[] = [];
  loading = true;
  error = '';
  archiving: string | null = null;

  constructor(private adoptionService: AdoptionService, private auth: AuthService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.adoptionService.ngoListPets().subscribe({
      next: (pets) => { this.pets = pets; this.loading = false; },
      error: () => { this.error = 'Could not load listings.'; this.loading = false; }
    });
  }

  archive(petId: string): void {
    this.archiving = petId;
    this.adoptionService.ngoArchivePet(petId).subscribe({
      next: () => { this.archiving = null; this.load(); },
      error: () => { this.archiving = null; }
    });
  }

  speciesIcon(s: string): string {
    const m: Record<string, string> = { DOG: '🐕', CAT: '🐈', BIRD: '🦜', RABBIT: '🐇' };
    return m[s?.toUpperCase()] ?? '🐾';
  }

  ageLabel(months: number | undefined): string {
    if (!months) return 'Unknown';
    if (months < 12) return `${months}mo`;
    return `${Math.floor(months / 12)}yr`;
  }
}
