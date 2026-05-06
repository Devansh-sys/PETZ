import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { AdoptionApplication } from '../../../core/models/adoption.model';

@Component({
  standalone: false,
  selector: 'app-my-applications',
  template: `
    <div class="page-container">
      <h1>My Adoption Applications</h1>

      @if (loading) {
        <mat-spinner diameter="40" style="margin:40px auto"></mat-spinner>
      }

      @if (!loading) {
        @for (app of applications; track app.id) {
          <mat-card style="margin-bottom:12px">
            <mat-card-content style="display:flex;justify-content:space-between;align-items:center;padding:16px">
              <div>
                <h3 style="margin:0">Application #{{ app.id }}</h3>
                <p style="color:#64748B;margin:4px 0 0">Animal ID: {{ app.animalId }} • Applied: {{ app.appliedAt | date }}</p>
                @if (app.adminNotes) {
                  <p style="color:#475569;margin-top:6px;font-style:italic">
                    Note: {{ app.adminNotes }}
                  </p>
                }
              </div>
              <span class="chip" [ngClass]="app.status.toLowerCase()">{{ app.status }}</span>
            </mat-card-content>
          </mat-card>
        }
        @if (applications.length === 0) {
          <p style="text-align:center;padding:32px;color:#64748B">
            No applications yet. <a routerLink="/adoption/animals">Browse animals</a>
          </p>
        }
      }
    </div>
  `
})
export class MyApplicationsComponent implements OnInit {
  applications: AdoptionApplication[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/adoption/my-applications').subscribe({
      next: res => { this.applications = res.data ?? []; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }
}
