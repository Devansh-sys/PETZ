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
  templateUrl: './report-rescue.component.html',
  styleUrls: ['./report-rescue.component.scss']
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
