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
  template: `
    <div class="page-container" style="max-width:800px">

      <!-- Back button -->
      <button mat-button routerLink="/adoption/animals" class="back-btn">
        <mat-icon>arrow_back</mat-icon> All Animals
      </button>

      <!-- Loading -->
      @if (loading) {
        <div class="loading-state" style="margin-top:40px">
          <mat-spinner diameter="40"></mat-spinner>
          <span>Loading animal profile...</span>
        </div>
      }

      @if (!loading && animal) {
        <!-- Hero card -->
        <div class="hero-card">
          <div class="hero-img-wrap">
            <img [src]="animal.photoUrl || 'assets/animal-placeholder.png'" [alt]="animal.name">
            <div class="species-overlay">{{ animal.species || 'Animal' }}</div>
            @if (animal.isAdoptionReady) {
              <div class="ready-overlay">
                <mat-icon>check_circle</mat-icon> Ready to Adopt
              </div>
            }
          </div>

          <div class="hero-info">
            <div class="animal-name">{{ animal.name }}</div>
            <div class="animal-subtitle">
              {{ animal.breed || 'Mixed' }}
              @if (animal.ageMonths) {
                · {{ animal.ageMonths < 12 ? animal.ageMonths + ' month' + (animal.ageMonths > 1 ? 's' : '') : (animal.ageMonths / 12 | number:'1.0-1') + ' yr' }}
              }
              @if (animal.gender) { · {{ animal.gender }} }
            </div>

            <!-- Tags row -->
            <div class="tags-row">
              @if (animal.isVaccinated) {
                <span class="ptag ptag-green">💉 Vaccinated</span>
              }
              @if (animal.isNeutered) {
                <span class="ptag ptag-blue">✂️ Neutered</span>
              }
              <span class="ptag" [ngClass]="animal.status === 'AVAILABLE' ? 'ptag-orange' : 'ptag-grey'">
                {{ animal.status || 'AVAILABLE' }}
              </span>
            </div>

            <!-- Location -->
            @if (animal.city) {
              <div class="location-row">
                <mat-icon>place</mat-icon>
                <span>{{ animal.city }}</span>
              </div>
            }

            <!-- Description -->
            @if (animal.description) {
              <p class="animal-desc">{{ animal.description }}</p>
            }

            <!-- Vitals grid -->
            <div class="vitals-grid">
              @if (animal.ageMonths) {
                <div class="vital-item">
                  <mat-icon>cake</mat-icon>
                  <div>
                    <div class="vital-value">
                      {{ animal.ageMonths < 12 ? animal.ageMonths + ' mo' : (animal.ageMonths / 12 | number:'1.0-1') + ' yr' }}
                    </div>
                    <div class="vital-label">Age</div>
                  </div>
                </div>
              }
              @if (animal.gender) {
                <div class="vital-item">
                  <mat-icon>{{ animal.gender === 'MALE' ? 'male' : 'female' }}</mat-icon>
                  <div>
                    <div class="vital-value">{{ animal.gender }}</div>
                    <div class="vital-label">Gender</div>
                  </div>
                </div>
              }
              @if (animal.species) {
                <div class="vital-item">
                  <mat-icon>pets</mat-icon>
                  <div>
                    <div class="vital-value">{{ animal.species }}</div>
                    <div class="vital-label">Species</div>
                  </div>
                </div>
              }
              @if (animal.breed) {
                <div class="vital-item">
                  <mat-icon>info_outline</mat-icon>
                  <div>
                    <div class="vital-value">{{ animal.breed }}</div>
                    <div class="vital-label">Breed</div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Apply form -->
        @if (animal.status === 'AVAILABLE' && isLoggedIn) {
          <div class="apply-card">
            <div class="apply-header">
              <div class="apply-icon"><mat-icon>favorite</mat-icon></div>
              <div>
                <div class="apply-title">Apply to Adopt {{ animal.name }}</div>
                <div class="apply-sub">Tell us about yourself and your home environment</div>
              </div>
            </div>

            <form [formGroup]="applyForm" (ngSubmit)="apply()">
              <div class="form-section-title">Your Story</div>
              <div class="field-group">
                <label class="field-label">Why do you want to adopt {{ animal.name }}? *</label>
                <mat-form-field appearance="outline">
                  <mat-icon matPrefix style="color:#A8A29E;margin-right:6px">edit_note</mat-icon>
                  <textarea matInput rows="3" formControlName="reason"
                            placeholder="Share your motivation and what a day with {{ animal.name }} would look like..."></textarea>
                </mat-form-field>
              </div>
              <div class="field-group">
                <label class="field-label">Previous pet ownership experience</label>
                <mat-form-field appearance="outline">
                  <mat-icon matPrefix style="color:#A8A29E;margin-right:6px">history</mat-icon>
                  <textarea matInput rows="2" formControlName="experience"
                            placeholder="Do you currently have or have previously cared for pets?"></textarea>
                </mat-form-field>
              </div>
              <div class="form-section-title" style="margin-top:8px">Living Situation</div>
              <div class="field-group">
                <label class="field-label">Housing type</label>
                <mat-form-field appearance="outline">
                  <mat-icon matPrefix style="color:#A8A29E;margin-right:6px">home</mat-icon>
                  <mat-select formControlName="housingType">
                    <mat-option value="HOUSE">🏠 Independent House</mat-option>
                    <mat-option value="APARTMENT">🏢 Apartment</mat-option>
                    <mat-option value="FLAT">🏗️ Flat / Studio</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
              <div style="display:flex;gap:12px;margin-top:12px">
                <button mat-raised-button type="submit" [disabled]="applying" class="apply-submit-btn">
                  @if (applying) {
                    <mat-spinner diameter="18" style="display:inline-block;margin-right:6px"></mat-spinner>
                  } @else {
                    <mat-icon>send</mat-icon>
                  }
                  {{ applying ? 'Submitting...' : 'Submit Application' }}
                </button>
                <button mat-stroked-button type="button" routerLink="/adoption/animals"
                        style="height:48px;border-radius:12px;color:#78716C;border-color:#E5D0C5">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        }

        @if (!isLoggedIn) {
          <div class="login-nudge">
            <mat-icon>lock_outline</mat-icon>
            <div>
              <strong>Login to apply for adoption</strong>
              <p>Create an account or log in to submit your adoption application.</p>
            </div>
            <button mat-raised-button routerLink="/auth/login"
                    style="background:#F97316;color:#fff;border-radius:12px;height:42px;flex-shrink:0">
              Login / Register
            </button>
          </div>
        }
      }

      @if (!loading && !animal) {
        <div class="card" style="margin-top:24px">
          <div class="empty-state">
            <div class="empty-icon"><mat-icon>search_off</mat-icon></div>
            <h3>Animal not found</h3>
            <p>This animal may have already been adopted or is no longer listed.</p>
            <button mat-raised-button routerLink="/adoption/animals" style="margin-top:8px;border-radius:10px">
              Browse All Animals
            </button>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .back-btn {
      color: #78716C !important;
      border-radius: 10px !important;
      margin-bottom: 20px !important;
      padding: 0 12px !important;
      height: 38px !important;
      mat-icon { font-size: 18px; width: 18px; height: 18px; margin-right: 4px; }
      &:hover { background: #FFF7ED !important; color: #F97316 !important; }
    }
    .hero-card {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 28px;
      background: #fff;
      border: 1px solid #F0E0D6;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(28,9,2,0.08);
      margin-bottom: 24px;
    }
    .hero-img-wrap {
      position: relative;
      height: 360px;
      background: #FFF4EE;
      img { width: 100%; height: 100%; object-fit: cover; }
    }
    .species-overlay {
      position: absolute; top: 12px; left: 12px;
      background: rgba(28,9,2,0.72); color: #fff;
      font-size: 0.68rem; font-weight: 700; padding: 3px 12px;
      border-radius: 999px; text-transform: uppercase; letter-spacing: 0.07em;
      backdrop-filter: blur(6px);
    }
    .ready-overlay {
      position: absolute; bottom: 12px; left: 12px;
      display: flex; align-items: center; gap: 4px;
      background: rgba(5,150,105,0.88); color: #fff;
      font-size: 0.7rem; font-weight: 700; padding: 4px 12px;
      border-radius: 999px; backdrop-filter: blur(6px);
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }
    .hero-info { padding: 28px 28px 28px 0; display: flex; flex-direction: column; }
    .animal-name { font-weight: 900; font-size: 1.7rem; color: #1C0902; margin-bottom: 4px; }
    .animal-subtitle { font-size: 0.9rem; color: #A8A29E; margin-bottom: 14px; }
    .tags-row { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 12px; }
    .ptag {
      font-size: 0.72rem; font-weight: 700;
      padding: 3px 10px; border-radius: 999px;
    }
    .ptag-green  { background: #D1FAE5; color: #065F46; }
    .ptag-blue   { background: #DBEAFE; color: #1E40AF; }
    .ptag-orange { background: #FFEDD5; color: #9A3412; }
    .ptag-grey   { background: #F1F5F9; color: #475569; }
    .location-row {
      display: flex; align-items: center; gap: 4px;
      font-size: 0.82rem; color: #78716C; margin-bottom: 14px;
      mat-icon { font-size: 15px; width: 15px; height: 15px; color: #F97316; }
    }
    .animal-desc {
      font-size: 0.85rem; line-height: 1.65; color: #57534E;
      margin: 0 0 18px;
    }
    .vitals-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 10px; margin-top: auto;
    }
    .vital-item {
      display: flex; align-items: center; gap: 8px;
      background: #FFF8F4; border: 1px solid #F0E0D6;
      border-radius: 12px; padding: 10px 12px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: #F97316; flex-shrink: 0; }
    }
    .vital-value { font-weight: 800; font-size: 0.8rem; color: #1C0902; }
    .vital-label { font-size: 0.65rem; color: #A8A29E; text-transform: uppercase; letter-spacing: 0.05em; }

    /* Apply card */
    .apply-card {
      background: #fff; border: 1px solid #F0E0D6;
      border-radius: 24px; padding: 28px 32px;
      box-shadow: 0 4px 20px rgba(28,9,2,0.07);
      margin-bottom: 24px;
    }
    .apply-header {
      display: flex; align-items: center; gap: 14px;
      margin-bottom: 24px;
    }
    .apply-icon {
      width: 50px; height: 50px; border-radius: 14px;
      background: linear-gradient(135deg, #FF9748, #F97316);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 14px rgba(249,115,22,0.35);
      mat-icon { color: #fff; font-size: 24px; }
    }
    .apply-title { font-weight: 800; font-size: 1rem; color: #1C0902; }
    .apply-sub { font-size: 0.8rem; color: #A8A29E; margin-top: 2px; }
    .form-section-title {
      font-size: 0.72rem; font-weight: 800; text-transform: uppercase;
      letter-spacing: 0.1em; color: #A8A29E;
      margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid #F0E0D6;
    }
    .field-group { margin-bottom: 4px; }
    .field-label { display: block; font-size: 0.78rem; font-weight: 700; color: #1C0902; margin-bottom: 6px; }
    .apply-submit-btn {
      height: 48px !important;
      min-width: 180px !important;
      border-radius: 14px !important;
      background: linear-gradient(135deg, #FF9748, #F97316) !important;
      color: #fff !important;
      font-weight: 700 !important;
      box-shadow: 0 4px 14px rgba(249,115,22,0.35) !important;
      display: flex !important; align-items: center !important; gap: 6px !important;
      &:not(:disabled):hover { box-shadow: 0 6px 20px rgba(249,115,22,0.5) !important; }
      &:disabled { background: #E5D0C5 !important; box-shadow: none !important; }
    }

    /* Login nudge */
    .login-nudge {
      display: flex; align-items: center; gap: 16px;
      background: #FFF7ED; border: 1px solid #FFEDD5;
      border-radius: 18px; padding: 20px 24px;
      margin-bottom: 24px;
      mat-icon { font-size: 28px; color: #F97316; flex-shrink: 0; }
      strong { font-size: 0.9rem; color: #1C0902; display: block; margin-bottom: 2px; }
      p { margin: 0; font-size: 0.8rem; color: #78716C; }
      div { flex: 1; }
    }

    @media (max-width: 680px) {
      .hero-card { grid-template-columns: 1fr; }
      .hero-img-wrap { height: 220px; }
      .hero-info { padding: 20px; }
    }
  `]
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
