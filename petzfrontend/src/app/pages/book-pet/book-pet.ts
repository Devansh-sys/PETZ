import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { AuthService } from '../../core/auth/auth.service';
import { AppointmentService } from '../../core/appointment/appointment.service';
import { PetResponse, BookingState } from '../../core/appointment/appointment.models';

const BOOKING_KEY = 'petz.booking';

@Component({
  selector: 'petz-book-pet',
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './book-pet.html',
  styleUrl: './book-pet.scss'
})
export class BookPet implements OnInit {
  state: BookingState | null = null;
  pets: PetResponse[] = [];
  loading = true;
  error = '';
  selectedPetId = '';

  showNewForm = false;
  newName = '';
  newSpecies = '';
  newGender = '';
  newBreed = '';
  saving = false;

  constructor(
    private auth: AuthService,
    private apptService: AppointmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const raw = sessionStorage.getItem(BOOKING_KEY);
    if (!raw) { this.router.navigate(['/book']); return; }
    const s: BookingState = JSON.parse(raw);
    if (!s.slotId) { this.router.navigate(['/book/slot']); return; }
    this.state = s;

    const userId = this.auth.session()?.userId;
    if (!userId) { this.router.navigate(['/sos/auth']); return; }

    this.apptService.getPetsByUser(userId).subscribe({
      next: (list) => { this.pets = list; this.loading = false; },
      error: () => { this.loading = false; this.showNewForm = true; }
    });
  }

  selectPet(pet: PetResponse): void {
    this.selectedPetId = pet.id;
    const s = { ...this.state!, petId: pet.id, petName: pet.name, petSpecies: pet.species };
    sessionStorage.setItem(BOOKING_KEY, JSON.stringify(s));
  }

  get canAddPet(): boolean {
    return this.newName.trim().length > 0 && this.newSpecies.trim().length > 0;
  }

  addPet(): void {
    if (!this.canAddPet || this.saving) return;
    const userId = this.auth.session()!.userId;
    this.saving = true;
    this.apptService.createPet({
      ownerId: userId,
      name: this.newName.trim(),
      species: this.newSpecies.trim(),
      gender: this.newGender || 'UNKNOWN',
      breed: this.newBreed.trim() || undefined
    }).subscribe({
      next: (pet) => {
        this.pets.push(pet);
        this.showNewForm = false;
        this.newName = '';
        this.newSpecies = '';
        this.newGender = '';
        this.newBreed = '';
        this.saving = false;
        this.selectPet(pet);
      },
      error: (err) => {
        const msg = err?.error?.message || err?.error?.error || err?.message || '';
        this.error = msg ? `Could not add pet: ${msg}` : 'Could not add pet. Try again.';
        this.saving = false;
      }
    });
  }

  proceed(): void {
    if (!this.selectedPetId) return;
    this.router.navigate(['/book/confirm']);
  }

  back(): void { this.router.navigate(['/book/slot']); }
}
