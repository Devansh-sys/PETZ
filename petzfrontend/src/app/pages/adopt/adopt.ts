import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';
import { AdoptionService } from '../../core/adoption/adoption.service';
import { AdoptablePet } from '../../core/adoption/adoption.models';

@Component({
  selector: 'petz-adopt',
  imports: [CommonModule, FormsModule, Navbar, Footer, RouterLink],
  templateUrl: './adopt.html',
  styleUrl: './adopt.scss'
})
export class Adopt implements OnInit, OnDestroy {
  pets: AdoptablePet[] = [];
  loading = true;
  error = '';

  filterSpecies = '';
  filterCity = '';
  filterVaccinated = false;
  filterReady = false;
  filterSpecialNeeds = false;
  sortBy = 'YOUNGEST';

  private filterChange$ = new Subject<void>();
  private sub!: Subscription;

  constructor(private adoptionService: AdoptionService) {}

  ngOnInit(): void {
    this.sub = this.filterChange$.pipe(
      debounceTime(300),
      switchMap(() => {
        this.loading = true;
        this.error = '';
        const hasFilters = this.filterSpecies || this.filterCity ||
          this.filterVaccinated || this.filterReady || this.filterSpecialNeeds;
        return hasFilters
          ? this.adoptionService.search({
              species: this.filterSpecies || undefined,
              city: this.filterCity || undefined,
              vaccinated: this.filterVaccinated || undefined,
              adoptionReady: this.filterReady || undefined,
              specialNeeds: this.filterSpecialNeeds || undefined
            })
          : this.adoptionService.browse(this.sortBy);
      })
    ).subscribe({
      next: (list) => { this.pets = list; this.loading = false; },
      error: () => { this.error = 'Could not load pets. Please try again.'; this.loading = false; }
    });
    this.load();
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }

  load(): void { this.filterChange$.next(); }

  reset(): void {
    this.filterSpecies = '';
    this.filterCity = '';
    this.filterVaccinated = false;
    this.filterReady = false;
    this.filterSpecialNeeds = false;
    this.sortBy = 'NEWEST';
    this.load();
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
