import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { RescueReport } from '../../../core/models/rescue.model';

@Component({
  standalone: false,
  selector: 'app-rescue-list',
  template: `
    <div class="page-container">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h1>Rescue Reports</h1>
        <button mat-raised-button color="primary" routerLink="/rescue/report">
          <mat-icon>add_alert</mat-icon> Report Animal
        </button>
      </div>

      @if (loading) {
        <mat-spinner diameter="40" style="margin:40px auto"></mat-spinner>
      }

      @if (!loading) {
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px">
          @for (r of rescues; track r.id) {
            <mat-card>
              <mat-card-header>
                <mat-card-title>{{ r.animalType || 'Unknown animal' }}</mat-card-title>
                <mat-card-subtitle>
                  <span class="chip" [ngClass]="r.status.toLowerCase()">{{ r.status }}</span>
                  &nbsp;
                  <span class="chip" style="background:#EDE9FE;color:#5B21B6">{{ r.criticality }}</span>
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p style="color:#64748B;margin:12px 0 4px">{{ r.description }}</p>
                <p style="color:#94A3B8;font-size:0.85rem;margin:0">{{ r.address }}</p>
              </mat-card-content>
            </mat-card>
          }
          @if (rescues.length === 0) {
            <p style="text-align:center;padding:24px;color:#64748B;grid-column:1/-1">
              No rescue reports yet.
            </p>
          }
        </div>
      }
    </div>
  `
})
export class RescueListComponent implements OnInit {
  rescues: RescueReport[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.get<any>('/rescue/my').subscribe({
      next: res => { this.rescues = res.data ?? []; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }
}
