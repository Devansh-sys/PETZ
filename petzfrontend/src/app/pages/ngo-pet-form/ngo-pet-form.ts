import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { AdoptionService } from '../../core/adoption/adoption.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'petz-ngo-pet-form',
  imports: [CommonModule, FormsModule, Navbar, RouterLink],
  templateUrl: './ngo-pet-form.html',
  styleUrl: './ngo-pet-form.scss'
})
export class NgoPetForm implements OnInit {
  isEdit = false;
  petId = '';
  saving = false;
  error = '';
  success = false;

  form = {
    name: '', species: 'DOG', breed: '', ageMonths: 0, gender: 'UNKNOWN',
    description: '', temperament: '', medicalSummary: '',
    vaccinationStatus: 'NOT_VACCINATED', specialNeeds: false,
    specialNeedsNotes: '', locationCity: '', isAdoptionReady: false
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adoptionService: AdoptionService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.petId = this.route.snapshot.paramMap.get('petId') ?? '';
    this.isEdit = !!this.petId && this.petId !== 'new';
    if (this.isEdit) {
      this.adoptionService.getById(this.petId).subscribe({
        next: (pet) => {
          this.form = {
            name: pet.name, species: pet.species, breed: pet.breed ?? '',
            ageMonths: pet.ageMonths ?? 0, gender: pet.gender ?? 'UNKNOWN',
            description: pet.description ?? '', temperament: pet.temperament ?? '',
            medicalSummary: pet.medicalSummary ?? '',
            vaccinationStatus: pet.vaccinationStatus ?? 'NOT_VACCINATED',
            specialNeeds: pet.specialNeeds ?? false,
            specialNeedsNotes: pet.specialNeedsNotes ?? '',
            locationCity: pet.locationCity ?? '', isAdoptionReady: pet.isAdoptionReady ?? false
          };
        },
        error: () => { this.error = 'Could not load pet data.'; }
      });
    }
  }

  save(): void {
    this.saving = true;
    this.error = '';
    const call = this.isEdit
      ? this.adoptionService.ngoUpdatePet(this.petId, this.form)
      : this.adoptionService.ngoCreatePet(this.form);
    call.subscribe({
      next: () => { this.saving = false; this.router.navigate(['/ngo/pets']); },
      error: () => { this.error = 'Failed to save. Please try again.'; this.saving = false; }
    });
  }
}
