import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';

interface ChennaiArea {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

const CHENNAI_AREAS: ChennaiArea[] = [
  { name: 'Anna Nagar',           address: 'Anna Nagar, Chennai - 600040',           lat: 13.0850, lng: 80.2101 },
  { name: 'T. Nagar',             address: 'T. Nagar, Chennai - 600017',             lat: 13.0418, lng: 80.2341 },
  { name: 'Adyar',                address: 'Adyar, Chennai - 600020',                lat: 13.0012, lng: 80.2565 },
  { name: 'Velachery',            address: 'Velachery, Chennai - 600042',            lat: 12.9815, lng: 80.2180 },
  { name: 'Tambaram',             address: 'Tambaram, Chennai - 600045',             lat: 12.9229, lng: 80.1270 },
  { name: 'Perambur',             address: 'Perambur, Chennai - 600011',             lat: 13.1137, lng: 80.2355 },
  { name: 'Mylapore',             address: 'Mylapore, Chennai - 600004',             lat: 13.0368, lng: 80.2676 },
  { name: 'Nungambakkam',         address: 'Nungambakkam, Chennai - 600034',         lat: 13.0604, lng: 80.2407 },
  { name: 'Guindy',               address: 'Guindy, Chennai - 600032',               lat: 13.0067, lng: 80.2206 },
  { name: 'Porur',                address: 'Porur, Chennai - 600116',                lat: 13.0358, lng: 80.1580 },
  { name: 'Sholinganallur',       address: 'Sholinganallur, Chennai - 600119',       lat: 12.9010, lng: 80.2279 },
  { name: 'Chromepet',            address: 'Chromepet, Chennai - 600044',            lat: 12.9516, lng: 80.1462 },
  { name: 'Besant Nagar',         address: 'Besant Nagar, Chennai - 600090',         lat: 13.0003, lng: 80.2686 },
  { name: 'Kilpauk',              address: 'Kilpauk, Chennai - 600010',              lat: 13.0847, lng: 80.2361 },
  { name: 'Egmore',               address: 'Egmore, Chennai - 600008',               lat: 13.0785, lng: 80.2636 },
  { name: 'Royapettah',           address: 'Royapettah, Chennai - 600014',           lat: 13.0565, lng: 80.2685 },
  { name: 'Pallavaram',           address: 'Pallavaram, Chennai - 600043',           lat: 12.9675, lng: 80.1491 },
  { name: 'Ambattur',             address: 'Ambattur, Chennai - 600053',             lat: 13.1143, lng: 80.1548 },
  { name: 'Poonamallee',          address: 'Poonamallee, Chennai - 600056',          lat: 13.0461, lng: 80.1116 },
  { name: 'OMR / Perungudi',      address: 'OMR, Perungudi, Chennai - 600096',       lat: 12.9626, lng: 80.2393 },
  { name: 'ECR / Thiruvanmiyur',  address: 'ECR, Thiruvanmiyur, Chennai - 600041',  lat: 12.9870, lng: 80.2589 },
  { name: 'Medavakkam',           address: 'Medavakkam, Chennai - 600100',           lat: 12.9202, lng: 80.1940 },
  { name: 'Tondiarpet',           address: 'Tondiarpet, Chennai - 600081',           lat: 13.1245, lng: 80.2922 },
  { name: 'Madhavaram',           address: 'Madhavaram, Chennai - 600060',           lat: 13.1478, lng: 80.2380 },
  { name: 'Siruseri / SIPCOT',    address: 'Siruseri, Chennai - 603103',             lat: 12.8342, lng: 80.2239 },
  { name: 'Valasaravakkam',       address: 'Valasaravakkam, Chennai - 600087',       lat: 13.0430, lng: 80.1775 },
  { name: 'Mogappair',            address: 'Mogappair, Chennai - 600037',            lat: 13.0908, lng: 80.1765 },
  { name: 'Korattur',             address: 'Korattur, Chennai - 600076',             lat: 13.1153, lng: 80.1937 },
  { name: 'Avadi',                address: 'Avadi, Chennai - 600054',                lat: 13.1067, lng: 80.0997 },
];

@Component({
  standalone: false,
  selector: 'app-report-rescue',
  template: `
    <div class="page-container" style="max-width:700px">

      <!-- Header -->
      <div class="page-header" style="margin-bottom:20px">
        <div class="page-header-left">
          <h1>Report Animal in Need</h1>
          <p>Help an animal in distress — our NGO partners will respond</p>
        </div>
        <button mat-stroked-button routerLink="/rescue"
                style="border-radius:10px;color:#4A6478;border-color:#C8DCE8">
          <mat-icon>arrow_back</mat-icon> Back
        </button>
      </div>

      <!-- Emergency banner -->
      <div class="urgency-banner">
        <div class="urgency-icon"><mat-icon>emergency</mat-icon></div>
        <div>
          <strong>Life-threatening emergency?</strong>
          <p>Call your local animal rescue hotline immediately. Use this form for non-emergency & emergency reports — an NGO will be auto-assigned.</p>
        </div>
      </div>

      <div class="card" style="padding:32px;margin-top:18px">
        <form [formGroup]="form" (ngSubmit)="submit()">

          <!-- Animal Details -->
          <div class="form-section-title">Animal Details</div>

          <div class="form-row">
            <div class="field-group">
              <label class="field-label">Type of animal *</label>
              <mat-form-field appearance="outline">
                <mat-icon matPrefix style="color:#8BA3B5;margin-right:6px">pets</mat-icon>
                <mat-select formControlName="animalType" placeholder="Select animal type">
                  <mat-option value="DOG">🐕 Dog</mat-option>
                  <mat-option value="CAT">🐈 Cat</mat-option>
                  <mat-option value="BIRD">🦜 Bird</mat-option>
                  <mat-option value="COW">🐄 Cow</mat-option>
                  <mat-option value="MONKEY">🐒 Monkey</mat-option>
                  <mat-option value="SNAKE">🐍 Snake</mat-option>
                  <mat-option value="OTHER">🐾 Other</mat-option>
                </mat-select>
                <mat-error>Required</mat-error>
              </mat-form-field>
            </div>
            <div class="field-group">
              <label class="field-label">Urgency level</label>
              <mat-form-field appearance="outline">
                <mat-icon matPrefix style="color:#8BA3B5;margin-right:6px">warning_amber</mat-icon>
                <mat-select formControlName="criticality">
                  <mat-option value="LOW">🟢 Low — Stray, not injured</mat-option>
                  <mat-option value="MEDIUM">🟡 Medium — Mild distress</mat-option>
                  <mat-option value="HIGH">🟠 High — Injured or ill</mat-option>
                  <mat-option value="CRITICAL">🔴 Critical — Life-threatening</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>

          <!-- Location -->
          <div class="form-section-title" style="margin-top:8px">Location</div>

          <!-- GPS detect row -->
          <div class="location-detect-row">
            <button mat-stroked-button type="button" class="gps-btn"
                    (click)="detectGPS()" [disabled]="locating">
              @if (locating) {
                <mat-spinner diameter="16" style="display:inline-block;margin-right:6px"></mat-spinner>
              } @else {
                <mat-icon>my_location</mat-icon>
              }
              {{ locating ? 'Detecting...' : 'Use My GPS Location' }}
            </button>
            @if (gpsDetected) {
              <div class="gps-confirmed">
                <mat-icon>check_circle</mat-icon>
                GPS detected ({{ lat.toFixed(4) }}°N, {{ lng.toFixed(4) }}°E)
              </div>
            }
          </div>

          <!-- Area dropdown -->
          <div class="field-group" style="margin-top:12px">
            <label class="field-label">Select Chennai area *</label>
            <mat-form-field appearance="outline">
              <mat-icon matPrefix style="color:#8BA3B5;margin-right:6px">location_city</mat-icon>
              <mat-select formControlName="area" placeholder="Choose your area in Chennai"
                          (selectionChange)="onAreaSelect($event.value)">
                @for (area of areas; track area.name) {
                  <mat-option [value]="area">{{ area.name }}</mat-option>
                }
              </mat-select>
              <mat-error>Please select an area</mat-error>
            </mat-form-field>
          </div>

          <!-- Landmark / street -->
          <div class="field-group">
            <label class="field-label">Landmark / Street description *</label>
            <mat-form-field appearance="outline">
              <mat-icon matPrefix style="color:#8BA3B5;margin-right:6px">place</mat-icon>
              <input matInput formControlName="landmark"
                     placeholder="e.g. Near petrol bunk, behind bus stop, 3rd cross street...">
              <mat-error>Please describe the exact spot</mat-error>
            </mat-form-field>
          </div>

          <!-- Full address (auto-filled, read-only hint) -->
          @if (fullAddress) {
            <div class="address-preview">
              <mat-icon>location_on</mat-icon>
              <span>{{ fullAddress }}</span>
            </div>
          }

          <!-- Reporter Contact -->
          <div class="form-section-title" style="margin-top:16px">Your Contact</div>

          <div class="field-group">
            <label class="field-label">
              Your mobile number *
              <span class="phone-why">(so the NGO can reach you at the location)</span>
            </label>
            <mat-form-field appearance="outline">
              <mat-icon matPrefix style="color:#8BA3B5;margin-right:6px">phone</mat-icon>
              <input matInput formControlName="reporterPhone" type="tel"
                     placeholder="10-digit mobile number e.g. 9876543210"
                     maxlength="10">
              <mat-error *ngIf="form.get('reporterPhone')?.hasError('required')">
                Mobile number is required
              </mat-error>
              <mat-error *ngIf="form.get('reporterPhone')?.hasError('pattern')">
                Enter a valid 10-digit Indian mobile number (starts with 6–9)
              </mat-error>
            </mat-form-field>
          </div>

          <!-- Situation Details -->
          <div class="form-section-title" style="margin-top:8px">Situation Details</div>

          <div class="field-group">
            <label class="field-label">Describe the animal's condition *</label>
            <mat-form-field appearance="outline">
              <textarea matInput rows="4" formControlName="description"
                        placeholder="Describe what you see — injuries, behaviour, surroundings, how many animals..."></textarea>
              <mat-error>Please describe the situation</mat-error>
            </mat-form-field>
          </div>

          <!-- Submit -->
          <div style="display:flex;gap:12px;margin-top:8px">
            <button mat-raised-button type="submit"
                    [disabled]="form.invalid || loading || !isLocationSet()"
                    class="submit-btn">
              @if (loading) {
                <mat-spinner diameter="18" style="display:inline-block;margin-right:6px"></mat-spinner>
              } @else {
                <mat-icon>add_alert</mat-icon>
              }
              {{ loading ? 'Submitting...' : 'Submit Report' }}
            </button>
            <button mat-stroked-button type="button" routerLink="/rescue"
                    style="height:48px;border-radius:12px;color:#4A6478;border-color:#C8DCE8">
              Cancel
            </button>
          </div>

          @if (!isLocationSet() && form.touched) {
            <p class="location-warn">
              <mat-icon>info_outline</mat-icon>
              Please select an area or use GPS to set location.
            </p>
          }

        </form>
      </div>

    </div>
  `,
  styles: [`
    .urgency-banner {
      display: flex; gap: 14px; align-items: flex-start;
      background: #FEF2F2; border: 1px solid #FECACA;
      border-radius: 16px; padding: 16px 20px;
    }
    .urgency-icon {
      width: 40px; height: 40px; border-radius: 12px;
      background: #FEE2E2; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { color: #DC2626; font-size: 20px; }
    }
    .urgency-banner div strong { font-size: 0.88rem; color: #991B1B; font-weight: 800; display: block; margin-bottom: 4px; }
    .urgency-banner div p { margin: 0; font-size: 0.8rem; color: #B91C1C; line-height: 1.5; }

    .form-section-title {
      font-size: 0.72rem; font-weight: 800; text-transform: uppercase;
      letter-spacing: 0.1em; color: #8BA3B5;
      margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid #E0EBF2;
    }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
    .field-group { margin-bottom: 4px; }
    .field-label { display: block; font-size: 0.78rem; font-weight: 700; color: #1A3547; margin-bottom: 6px; }

    .location-detect-row {
      display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
      margin-bottom: 8px;
    }
    .gps-btn {
      border-radius: 12px !important;
      border-color: #C8DCE8 !important;
      color: #FF8C42 !important;
      font-weight: 600 !important;
      font-size: 0.85rem !important;
      height: 40px !important;
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
      &:hover { background: #FFF7ED !important; border-color: #FF8C42 !important; }
    }
    .gps-confirmed {
      display: flex; align-items: center; gap: 5px;
      font-size: 0.78rem; font-weight: 600; color: #059669;
      background: #D1FAE5; padding: 5px 12px; border-radius: 999px;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }
    .address-preview {
      display: flex; align-items: center; gap: 8px;
      background: #FFF7ED; border: 1px solid #FFF3E8;
      border-radius: 10px; padding: 10px 14px;
      font-size: 0.82rem; color: #9A3412; font-weight: 600;
      margin-bottom: 4px;
      mat-icon { font-size: 16px; width: 16px; height: 16px; color: #FF8C42; flex-shrink: 0; }
      span { white-space: normal; }
    }
    .submit-btn {
      height: 48px !important;
      min-width: 160px !important;
      font-size: 0.9rem !important;
      border-radius: 14px !important;
      background: linear-gradient(135deg, #F87171, #DC2626) !important;
      color: #fff !important;
      box-shadow: 0 4px 14px rgba(220,38,38,0.35) !important;
      display: flex !important; align-items: center !important; gap: 6px !important;
      &:not(:disabled):hover { box-shadow: 0 6px 20px rgba(220,38,38,0.5) !important; }
      &:disabled { background: #C8DCE8 !important; box-shadow: none !important; }
    }
    .phone-why {
      font-size: 0.72rem; font-weight: 500; color: #8BA3B5; margin-left: 4px;
    }
    .location-warn {
      display: flex; align-items: center; gap: 6px;
      margin: 8px 0 0; font-size: 0.78rem; color: #DC2626;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
    }
    @media (max-width: 560px) {
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class ReportRescueComponent {
  form: FormGroup;
  loading = false;
  locating = false;
  gpsDetected = false;

  lat: number = 0;
  lng: number = 0;
  fullAddress = '';

  areas: ChennaiArea[] = CHENNAI_AREAS;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      animalType:    ['', Validators.required],
      criticality:   ['MEDIUM'],
      area:          [null, Validators.required],
      landmark:      ['', Validators.required],
      reporterPhone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      description:   ['', Validators.required]
    });
  }

  // ── GPS detection ─────────────────────────────────────────────
  detectGPS(): void {
    if (!navigator.geolocation) {
      this.snack.open('Geolocation is not supported by your browser.', 'Close', { duration: 3000 });
      return;
    }
    this.locating = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.lat = pos.coords.latitude;
        this.lng = pos.coords.longitude;
        this.gpsDetected = true;
        this.locating = false;
        this.buildFullAddress();
        this.snack.open('📍 GPS location detected!', '', { duration: 2000 });
      },
      (err) => {
        this.locating = false;
        this.snack.open(
          'Location access denied. Please allow location or select area manually.',
          'Close', { duration: 3500 }
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  // ── Area selection ────────────────────────────────────────────
  onAreaSelect(area: ChennaiArea): void {
    if (!this.gpsDetected) {
      // Use area centre coordinates if GPS not yet captured
      this.lat = area.lat;
      this.lng = area.lng;
    }
    this.buildFullAddress();
  }

  private buildFullAddress(): void {
    const area: ChennaiArea = this.form.get('area')?.value;
    const landmark = this.form.get('landmark')?.value ?? '';
    if (area) {
      this.fullAddress = landmark
        ? `${landmark}, ${area.address}`
        : area.address;
    }
  }

  isLocationSet(): boolean {
    return !!(this.form.get('area')?.value || this.gpsDetected);
  }

  // ── Watch landmark changes to rebuild address ─────────────────
  ngOnInit(): void {
    this.form.get('landmark')?.valueChanges.subscribe(() => this.buildFullAddress());
  }

  // ── Submit ────────────────────────────────────────────────────
  submit(): void {
    if (this.form.invalid || !this.isLocationSet()) return;

    this.loading = true;

    const area: ChennaiArea = this.form.get('area')?.value;
    const landmark = this.form.get('landmark')?.value ?? '';
    const address  = landmark ? `${landmark}, ${area?.address}` : area?.address;

    const payload = {
      animalType:    this.form.get('animalType')?.value,
      criticality:   this.form.get('criticality')?.value,
      description:   this.form.get('description')?.value,
      address:       address,
      latitude:      this.lat || area?.lat,
      longitude:     this.lng || area?.lng,
      reporterPhone: this.form.get('reporterPhone')?.value
    };

    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

    this.api.postFormData<any>('/rescue', formData).subscribe({
      next: (res: any) => {
        const ngoName = res.data?.assignedNgoName ?? 'a nearby NGO';
        this.snack.open(
          `🚨 Report submitted! Assigned to ${ngoName}. Help is on the way!`,
          '',
          { duration: 4500 }
        );
        this.router.navigate(['/rescue']);
      },
      error: (err) => {
        this.snack.open(
          err.error?.message ?? 'Submission failed. Please try again.',
          'Close',
          { duration: 3500 }
        );
        this.loading = false;
      }
    });
  }
}
