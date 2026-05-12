import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { AdoptableAnimal } from '../../../core/models/adoption.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-animal-detail',
  templateUrl: './animal-detail.component.html',
  styleUrls: ['./animal-detail.component.scss']
})
export class AnimalDetailComponent implements OnInit {
  animal: AdoptableAnimal | null = null;
  loading = true;
  applying = false;
  applyForm: FormGroup;
  isLoggedIn = false;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private fb: FormBuilder,
    private snack: MatSnackBar,
    private router: Router,
    private auth: AuthService
  ) {
    this.applyForm = this.fb.group({
      reason:      [''],
      experience:  [''],
      housingType: ['HOUSE'],
      hasOtherPets: [false]
    });
  }

  ngOnInit(): void {
    this.isLoggedIn = this.auth.isLoggedIn();
    const id = this.route.snapshot.paramMap.get('id');
    this.api.get<any>(`/adoption/animals/${id}`).subscribe({
      next: res => { this.animal = res.data; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  apply(): void {
    if (!this.animal) return;
    this.applying = true;
    const body = { ...this.applyForm.value, animalId: this.animal.id };
    this.api.post<any>('/adoption/apply', body).subscribe({
      next: () => {
        this.snack.open('Application submitted! We\'ll be in touch soon. 🐾', '', { duration: 3500 });
        this.router.navigate(['/adoption/my']);
      },
      error: (err) => {
        this.snack.open(err.error?.message ?? 'Could not submit application.', 'Close', { duration: 3500 });
        this.applying = false;
      }
    });
  }
}
