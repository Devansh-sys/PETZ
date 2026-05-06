import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { AdoptableAnimal } from '../../../core/models/adoption.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: false,
  selector: 'app-ngo-animals',
  template: `
    <div class="page-container">

      <!-- Header -->
      <div class="page-header">
        <div class="page-header-left" style="display:flex;align-items:center;gap:12px">
          <button mat-icon-button routerLink="/ngo" class="back-btn" title="Back to NGO Dashboard">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1>My Animals</h1>
            <p>Manage all animals listed for adoption</p>
          </div>
        </div>
        <div class="page-header-actions">
          <button mat-raised-button color="primary" (click)="showForm = !showForm">
            <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon>
            {{ showForm ? 'Cancel' : 'Add Animal' }}
          </button>
        </div>
      </div>

      <!-- Add Animal form -->
      @if (showForm) {
        <div class="card" style="padding:28px;margin-bottom:24px">
          <div style="font-size:0.72rem;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:#8BA3B5;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid #E0EBF2">
            New Animal Details
          </div>
          <div class="form-row">
            <div class="field-group">
              <label class="field-label">Animal Name *</label>
              <mat-form-field appearance="outline">
                <mat-icon matPrefix style="color:#8BA3B5;margin-right:6px">badge</mat-icon>
                <input matInput [(ngModel)]="newAnimal.name" placeholder="e.g. Milo">
              </mat-form-field>
            </div>
            <div class="field-group">
              <label class="field-label">Species</label>
              <mat-form-field appearance="outline">
                <mat-icon matPrefix style="color:#8BA3B5;margin-right:6px">pets</mat-icon>
                <input matInput [(ngModel)]="newAnimal.species" placeholder="Dog, Cat, Bird...">
              </mat-form-field>
            </div>
          </div>
          <div class="form-row">
            <div class="field-group">
              <label class="field-label">Breed</label>
              <mat-form-field appearance="outline">
                <input matInput [(ngModel)]="newAnimal.breed" placeholder="Mixed">
              </mat-form-field>
            </div>
            <div class="field-group">
              <label class="field-label">City</label>
              <mat-form-field appearance="outline">
                <mat-icon matPrefix style="color:#8BA3B5;margin-right:6px">place</mat-icon>
                <input matInput [(ngModel)]="newAnimal.city">
              </mat-form-field>
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">Age (months)</label>
            <mat-form-field appearance="outline" style="max-width:200px">
              <input matInput type="number" [(ngModel)]="newAnimal.ageMonths">
            </mat-form-field>
          </div>
          <div style="display:flex;gap:10px;margin-top:8px">
            <button mat-raised-button color="primary" (click)="addAnimal()"
                    [disabled]="!newAnimal.name" style="border-radius:12px;height:42px">
              <mat-icon>save</mat-icon> Save Animal
            </button>
            <button mat-stroked-button (click)="showForm = false"
                    style="border-radius:12px;height:42px;color:#4A6478;border-color:#C8DCE8">
              Cancel
            </button>
          </div>
        </div>
      }

      <!-- Animals table -->
      <div class="table-card">
        @if (animals.length === 0) {
          <div class="empty-state">
            <div class="empty-icon"><mat-icon>pets</mat-icon></div>
            <h3>No animals listed</h3>
            <p>Add animals to your organisation's adoption catalogue.</p>
          </div>
        }
        @if (animals.length > 0) {
          <table mat-table [dataSource]="animals" style="width:100%">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Animal</th>
              <td mat-cell *matCellDef="let a" style="padding:14px 18px">
                <div style="font-weight:700;font-size:0.88rem;color:#1A3547">{{ a.name }}</div>
                <div style="font-size:0.74rem;color:#8BA3B5">{{ a.species || 'Unknown' }}</div>
              </td>
            </ng-container>
            <ng-container matColumnDef="breed">
              <th mat-header-cell *matHeaderCellDef>Breed / Age</th>
              <td mat-cell *matCellDef="let a" style="font-size:0.82rem;color:#4A6478">
                {{ a.breed || 'Mixed' }}
                @if (a.ageMonths) { · {{ a.ageMonths }} mo }
              </td>
            </ng-container>
            <ng-container matColumnDef="city">
              <th mat-header-cell *matHeaderCellDef>Location</th>
              <td mat-cell *matCellDef="let a" style="font-size:0.82rem;color:#4A6478">{{ a.city || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let a">
                <span class="chip" [ngClass]="a.status.toLowerCase()">{{ a.status }}</span>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"></tr>
          </table>
        }
      </div>

    </div>
  `,
  styles: [`
    .back-btn {
      width: 38px !important; height: 38px !important;
      border-radius: 10px !important; background: #fff !important;
      border: 1px solid #E0EBF2 !important; color: #4A6478 !important; flex-shrink: 0;
      &:hover { border-color: #FF8C42 !important; color: #FF8C42 !important; }
    }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
    .field-group { margin-bottom: 4px; }
    .field-label { display: block; font-size: 0.78rem; font-weight: 700; color: #1A3547; margin-bottom: 6px; }
    @media (max-width: 560px) { .form-row { grid-template-columns: 1fr; } }
  `]
})
export class NgoAnimalsComponent implements OnInit {
  animals: AdoptableAnimal[] = [];
  cols = ['name', 'breed', 'city', 'status'];
  showForm = false;
  newAnimal: any = {};

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.api.get<any>('/adoption/ngo/animals').subscribe({
      next: res => { this.animals = res.data ?? []; },
      error: ()  => {}
    });
  }

  addAnimal(): void {
    if (!this.newAnimal.name) return;
    this.api.post<any>('/adoption/ngo/animals', this.newAnimal).subscribe({
      next: res => {
        this.animals.push(res.data);
        this.showForm = false;
        this.newAnimal = {};
        this.snack.open('Animal added successfully! 🐾', '', { duration: 2000 });
      },
      error: (err) => this.snack.open(err.error?.message ?? 'Error adding animal.', 'Close', { duration: 3000 })
    });
  }
}
