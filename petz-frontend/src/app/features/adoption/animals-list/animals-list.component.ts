import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { AdoptableAnimal } from '../../../core/models/adoption.model';
import { environment } from '../../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-animals-list',
  templateUrl: './animals-list.component.html',
  styleUrls: ['./animals-list.component.scss']
})
export class AnimalsListComponent implements OnInit {
  animals: AdoptableAnimal[] = [];
  allAnimals: AdoptableAnimal[] = [];
  displayed: AdoptableAnimal[] = [];
  loading = true;
  filters = { species: '', city: '' };
  clientFilter = { gender: '', vaccinated: false, neutered: false, sort: 'newest' };

  /** Resolves a backend-relative /uploads/... path to a full URL. */
  imgSrc(url?: string): string {
    if (!url) return '';
    return url.startsWith('http') ? url : environment.mediaUrl + url;
  }

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.search(); }

  search(): void {
    this.loading = true;
    const params: any = {};
    if (this.filters.species) params['species'] = this.filters.species;
    if (this.filters.city)    params['city']    = this.filters.city;
    this.api.get<any>('/adoption/animals', params).subscribe({
      next: res => {
        this.animals = res.data ?? [];
        this.allAnimals = this.animals;
        this.loading = false;
        this.applyClientFilters();
      },
      error: () => { this.loading = false; }
    });
  }

  get hasClientFilters(): boolean {
    return !!(this.clientFilter.gender || this.clientFilter.vaccinated || this.clientFilter.neutered || this.clientFilter.sort !== 'newest');
  }

  applyClientFilters(): void {
    let r = [...this.allAnimals];
    if (this.clientFilter.gender) r = r.filter(a => (a.gender || '').toUpperCase() === this.clientFilter.gender);
    if (this.clientFilter.vaccinated) r = r.filter(a => a.isVaccinated);
    if (this.clientFilter.neutered)   r = r.filter(a => a.isNeutered);
    if (this.clientFilter.sort === 'newest') {
      r.sort((a, b) => b.id - a.id);
    } else if (this.clientFilter.sort === 'name') {
      r.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (this.clientFilter.sort === 'youngest') {
      r.sort((a, b) => (a.ageMonths || 999) - (b.ageMonths || 999));
    } else if (this.clientFilter.sort === 'oldest_age') {
      r.sort((a, b) => (b.ageMonths || 0) - (a.ageMonths || 0));
    }
    this.displayed = r;
  }

  clearClientFilters(): void {
    this.clientFilter = { gender: '', vaccinated: false, neutered: false, sort: 'newest' };
    this.applyClientFilters();
  }

  clearFilters(): void {
    this.filters = { species: '', city: '' };
    this.clearClientFilters();
    this.search();
  }
}
