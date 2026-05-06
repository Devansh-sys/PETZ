import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: false,
  selector: 'app-ngo-rescues',
  template: `
    <div class="page-container">
      <h1>Rescue Queue</h1>

      @if (loading) {
        <mat-spinner diameter="40" style="margin:40px auto"></mat-spinner>
      }

      @if (!loading) {
        @for (r of rescues; track r.id) {
          <mat-card style="margin-bottom:12px">
            <mat-card-content style="padding:16px">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <div>
                  <h3 style="margin:0">{{ r.animalType || 'Unknown' }} — {{ r.criticality }}</h3>
                  <p style="color:#64748B;margin:4px 0">{{ r.address }}</p>
                  <p style="color:#475569;margin:0">{{ r.description }}</p>
                </div>
                <span class="chip" [ngClass]="r.status.toLowerCase()">{{ r.status }}</span>
              </div>
              @if (r.status === 'ASSIGNED') {
                <div style="margin-top:12px;display:flex;gap:8px">
                  <button mat-raised-button color="primary" (click)="respond(r.id, 'ACCEPT')">Accept</button>
                  <button mat-raised-button color="warn"    (click)="respond(r.id, 'DECLINE')">Decline</button>
                </div>
              }
              @if (r.status === 'IN_PROGRESS') {
                <div style="margin-top:12px">
                  <button mat-raised-button (click)="complete(r.id)">Mark Complete</button>
                </div>
              }
            </mat-card-content>
          </mat-card>
        }
        @if (rescues.length === 0) {
          <p style="text-align:center;padding:32px;color:#64748B">
            No rescue assignments.
          </p>
        }
      }
    </div>
  `
})
export class NgoRescuesComponent implements OnInit {
  rescues: any[] = [];
  loading = true;

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.api.get<any>('/rescue/ngo').subscribe({
      next: res => { this.rescues = res.data ?? []; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  respond(id: number, response: string): void {
    this.api.post<any>(`/rescue/${id}/respond`, { response }).subscribe({
      next: res => {
        const r = this.rescues.find(x => x.id === id);
        if (r) r.status = res.data.status;
        this.snack.open(`Response recorded: ${response}`, '', { duration: 2000 });
      },
      error: err => this.snack.open(err.error?.message ?? 'Error.', 'Close', { duration: 3000 })
    });
  }

  complete(id: number): void {
    this.api.post<any>(`/rescue/${id}/complete`, { notes: 'Rescue completed successfully.' }).subscribe({
      next: () => {
        const r = this.rescues.find(x => x.id === id);
        if (r) r.status = 'COMPLETED';
        this.snack.open('Rescue marked complete!', '', { duration: 2000 });
      }
    });
  }
}
