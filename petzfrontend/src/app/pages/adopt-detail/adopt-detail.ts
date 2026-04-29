import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';
import { AdoptionService } from '../../core/adoption/adoption.service';
import { AdoptablePet } from '../../core/adoption/adoption.models';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'petz-adopt-detail',
  imports: [CommonModule, Navbar, Footer, RouterLink],
  templateUrl: './adopt-detail.html',
  styleUrl: './adopt-detail.scss'
})
export class AdoptDetail implements OnInit {
  pet: AdoptablePet | null = null;
  loading = true;
  error = '';
  selectedImage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adoptionService: AdoptionService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.adoptionService.getById(id).subscribe({
      next: (pet) => {
        this.pet = pet;
        const primary = pet.media?.find(m => m.isPrimary) ?? pet.media?.[0];
        this.selectedImage = pet.primaryImageUrl || primary?.fileUrl || '';
        this.loading = false;
      },
      error: () => { this.error = 'Could not load pet details.'; this.loading = false; }
    });
  }

  selectImage(url: string): void { this.selectedImage = url; }

  applyToAdopt(): void {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { redirect: `/adopt/${this.pet!.id}/apply` } });
      return;
    }
    this.router.navigate(['/adopt', this.pet!.id, 'apply']);
  }

  ageLabel(months: number | undefined): string {
    if (!months) return 'Unknown age';
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''}`;
    const y = Math.floor(months / 12);
    return `${y} year${y !== 1 ? 's' : ''}`;
  }

  speciesIcon(s: string): string {
    const m: Record<string, string> = { DOG: '🐕', CAT: '🐈', BIRD: '🦜', RABBIT: '🐇' };
    return m[s?.toUpperCase()] ?? '🐾';
  }
}
