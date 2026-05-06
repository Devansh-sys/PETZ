import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { AdoptableAnimal } from '../../../core/models/adoption.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: false,
  selector: 'app-ngo-animals',
  template: `
    <div class="page-container">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h1>My Animals</h1>
        <button mat-raised-button color="primary" (click)="showForm = true">
          <mat-icon>add</mat-icon> Add Animal
        </button>
      </div>

      @if (showForm) {
        <mat-card style="margin-bottom:20px">
          <mat-card-header><mat-card-title>Add Animal</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="form-grid" style="margin-top:12px">
              <mat-form-field appearance="outline">
                <mat-label>Name *</mat-label>
                <input matInput [(ngModel)]="newAnimal.name">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Species</mat-label>
                <input matInput [(ngModel)]="newAnimal.species">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Breed</mat-label>
                <input matInput [(ngModel)]="newAnimal.breed">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Age (months)</mat-label>
                <input matInput type="number" [(ngModel)]="newAnimal.ageMonths">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>City</mat-label>
                <input matInput [(ngModel)]="newAnimal.city">
              </mat-form-field>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-flat-button color="primary" (click)="addAnimal()">Save</button>
            <button mat-button (click)="showForm = false">Cancel</button>
          </mat-card-actions>
        </mat-card>
      }

      <mat-card>
        <table mat-table [dataSource]="animals" style="width:100%">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let a">{{ a.name }}</td>
          </ng-container>
          <ng-container matColumnDef="species">
            <th mat-header-cell *matHeaderCellDef>Species</th>
            <td mat-cell *matCellDef="let a">{{ a.species }} / {{ a.breed }}</td>
          </ng-container>
          <ng-container matColumnDef="city">
            <th mat-header-cell *matHeaderCellDef>City</th>
            <td mat-cell *matCellDef="let a">{{ a.city }}</td>
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
        @if (animals.length === 0) {
          <p style="text-align:center;padding:24px;color:#64748B">No animals listed yet.</p>
        }
      </mat-card>
    </div>
  `
})
export class NgoAnimalsComponent implements OnInit {
  animals: AdoptableAnimal[] = [];
  cols = ['name', 'species', 'city', 'status'];
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
        this.snack.open('Animal added!', '', { duration: 2000 });
      },
      error: (err) => this.snack.open(err.error?.message ?? 'Error.', 'Close', { duration: 3000 })
    });
  }
}
