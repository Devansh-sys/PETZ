import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';

@Component({
  standalone: false,
  selector: 'app-pet-form',
  templateUrl: './pet-form.component.html',
  styleUrls: ['./pet-form.component.scss']
})
export class PetFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  loading = false;
  petId: number | null = null;

  constructor(private fb: FormBuilder, private api: ApiService,
              private route: ActivatedRoute, private router: Router,
              private snack: MatSnackBar) {
    this.form = this.fb.group({
      name:     ['', Validators.required],
      species:  [''],
      breed:    [''],
      ageYears: [null],
      gender:   [''],
      weightKg: [null],
      notes:    ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit = true;
      this.petId = +id;
      this.api.get<any>(`/pets/${id}`).subscribe(res => {
        if (res.success) this.form.patchValue(res.data);
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const obs = this.isEdit
      ? this.api.put<any>(`/pets/${this.petId}`, this.form.value)
      : this.api.post<any>('/pets', this.form.value);
    obs.subscribe({
      next: () => {
        this.snack.open('Pet saved successfully! 🐾', '', { duration: 2500 });
        this.router.navigate(['/pets']);
      },
      error: (err) => {
        this.snack.open(err.error?.message ?? 'Error saving pet.', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}
