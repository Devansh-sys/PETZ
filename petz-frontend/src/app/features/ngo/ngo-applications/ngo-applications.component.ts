import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: false,
  selector: 'app-ngo-applications',
  template: `
    <div class="page-container">
      <h1>Adoption Applications</h1>

      @if (loading) {
        <mat-spinner diameter="40" style="margin:40px auto"></mat-spinner>
      }

      @if (!loading) {
        @for (app of applications; track app.id) {
          <mat-card style="margin-bottom:12px">
            <mat-card-content style="padding:16px">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <div>
                  <h3 style="margin:0">Application #{{ app.id }} — Animal #{{ app.animalId }}</h3>
                  <p style="color:#64748B;margin:4px 0 0">Applicant ID: {{ app.applicantId }}</p>
                  @if (app.reason) {
                    <p style="margin:6px 0 0;color:#475569">{{ app.reason }}</p>
                  }
                </div>
                <span class="chip" [ngClass]="app.status.toLowerCase()">{{ app.status }}</span>
              </div>
              @if (app.status === 'PENDING') {
                <div style="margin-top:12px;display:flex;gap:8px">
                  <button mat-raised-button color="primary" (click)="review(app.id,'APPROVED')">Approve</button>
                  <button mat-raised-button color="warn"    (click)="review(app.id,'REJECTED')">Reject</button>
                </div>
              }
            </mat-card-content>
          </mat-card>
        }
        @if (applications.length === 0) {
          <p style="text-align:center;padding:32px;color:#64748B">
            No applications yet.
          </p>
        }
      }
    </div>
  `
})
export class NgoApplicationsComponent implements OnInit {
  applications: any[] = [];
  loading = true;

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.api.get<any>('/adoption/ngo/applications').subscribe({
      next: res => { this.applications = res.data ?? []; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  review(id: number, status: string): void {
    this.api.patch<any>(`/adoption/ngo/applications/${id}/review`, { status }).subscribe({
      next: () => {
        const a = this.applications.find(x => x.id === id);
        if (a) a.status = status;
        this.snack.open(`Application ${status.toLowerCase()}`, '', { duration: 2000 });
      },
      error: err => this.snack.open(err.error?.message ?? 'Error.', 'Close', { duration: 3000 })
    });
  }
}
