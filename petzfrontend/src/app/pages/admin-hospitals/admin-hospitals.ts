import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'petz-admin-hospitals',
  imports: [CommonModule, FormsModule, Navbar, RouterLink],
  templateUrl: './admin-hospitals.html',
  styleUrl: './admin-hospitals.scss'
})
export class AdminHospitals implements OnInit {
  private base = environment.apiBaseUrl;

  activeTab: 'active' | 'pending' | 'disabled' = 'pending';

  allHospitals: any[] = [];
  loading = true;
  error = '';
  busy: string | null = null;
  actionError = '';

  // Verify popup
  verifyHospital: any = null;
  verifyBusy = false;
  verifyError = '';

  // Disable confirm
  disablingHospital: any = null;
  disableReason = '';
  disableBusy = false;
  disableError = '';

  // Add hospital modal
  showAddHospital = false;
  addBusy = false;
  addError = '';
  addSuccess = '';
  addForm = {
    name: '', address: '', city: '', contactPhone: '',
    contactEmail: '', operatingHours: '', latitude: '',
    longitude: '', emergencyReady: false
  };

  // Add doctor modal
  doctorHospital: any = null;
  doctorBusy = false;
  doctorError = '';
  doctorSuccess = '';
  doctorForm = { name: '', specialization: '', contactPhone: '', availability: '' };

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.http.get<any>(`${this.base}/hospitals`)
      .pipe(map(r => r.data ?? r), catchError(err => {
        this.error = err.error?.message ?? 'Could not load hospitals.';
        this.loading = false;
        return of([]);
      }))
      .subscribe(data => {
        this.allHospitals = Array.isArray(data) ? data : (data?.content ?? []);
        this.loading = false;
      });
  }

  get pendingHospitals(): any[] {
    return this.allHospitals.filter(h => !(h.isVerified ?? h.verified) && h.active !== false);
  }

  get activeHospitals(): any[] {
    return this.allHospitals.filter(h => (h.isVerified ?? h.verified) && h.active !== false);
  }

  get disabledHospitals(): any[] {
    return this.allHospitals.filter(h => h.active === false);
  }

  // Verify popup
  openVerify(h: any): void {
    this.verifyHospital = h;
    this.verifyError = '';
  }

  closeVerify(): void { this.verifyHospital = null; }

  confirmVerify(action: 'APPROVE' | 'REJECT'): void {
    if (!this.verifyHospital) return;
    this.verifyBusy = true;
    this.verifyError = '';
    this.http.post<any>(`${this.base}/admin/hospitals/${this.verifyHospital.id}/verify`, { action })
      .pipe(catchError(err => {
        this.verifyError = err.error?.message ?? 'Verification failed.';
        this.verifyBusy = false;
        return of(null);
      }))
      .subscribe(res => {
        if (res !== null) {
          this.verifyBusy = false;
          this.verifyHospital = null;
          this.load();
        }
      });
  }

  // Disable hospital
  openDisable(h: any): void {
    this.disablingHospital = h;
    this.disableReason = '';
    this.disableError = '';
  }

  closeDisable(): void { this.disablingHospital = null; }

  confirmDisable(): void {
    if (!this.disablingHospital) return;
    this.disableBusy = true;
    this.disableError = '';
    this.http.post<any>(`${this.base}/admin/hospitals/${this.disablingHospital.id}/disable`,
      { reason: this.disableReason || 'Admin deactivation' })
      .pipe(catchError(err => {
        this.disableError = err.error?.message ?? 'Action failed.';
        this.disableBusy = false;
        return of(null);
      }))
      .subscribe(res => {
        if (res !== null) {
          this.disableBusy = false;
          this.disablingHospital = null;
          this.load();
        }
      });
  }

  // Enable hospital
  enableHospital(hospitalId: string): void {
    this.busy = hospitalId;
    this.actionError = '';
    this.http.post<any>(`${this.base}/admin/hospitals/${hospitalId}/enable`, {})
      .pipe(catchError(err => {
        this.actionError = err.error?.message ?? 'Could not enable hospital.';
        this.busy = null;
        return of(null);
      }))
      .subscribe(res => {
        if (res !== null) { this.busy = null; this.load(); }
      });
  }

  // Add hospital
  openAddHospital(): void {
    this.showAddHospital = true;
    this.addError = '';
    this.addSuccess = '';
    this.addForm = {
      name: '', address: '', city: '', contactPhone: '',
      contactEmail: '', operatingHours: '', latitude: '',
      longitude: '', emergencyReady: false
    };
  }

  closeAddHospital(): void { this.showAddHospital = false; }

  submitAddHospital(): void {
    if (!this.addForm.name || !this.addForm.address || !this.addForm.city) {
      this.addError = 'Name, address, and city are required.';
      return;
    }
    this.addBusy = true;
    this.addError = '';
    const payload: any = { ...this.addForm };
    if (payload.latitude) payload.latitude = parseFloat(payload.latitude);
    if (payload.longitude) payload.longitude = parseFloat(payload.longitude);
    this.http.post<any>(`${this.base}/admin/hospitals`, payload)
      .pipe(catchError(err => {
        this.addError = err.error?.message ?? 'Failed to create hospital.';
        this.addBusy = false;
        return of(null);
      }))
      .subscribe(res => {
        if (res !== null) {
          this.addBusy = false;
          this.addSuccess = `Hospital "${this.addForm.name}" created successfully.`;
          this.load();
          setTimeout(() => { this.showAddHospital = false; this.addSuccess = ''; }, 1500);
        }
      });
  }

  // Add doctor
  openAddDoctor(h: any): void {
    this.doctorHospital = h;
    this.doctorError = '';
    this.doctorSuccess = '';
    this.doctorForm = { name: '', specialization: '', contactPhone: '', availability: '' };
  }

  closeAddDoctor(): void { this.doctorHospital = null; }

  submitAddDoctor(): void {
    if (!this.doctorForm.name || !this.doctorForm.specialization) {
      this.doctorError = 'Name and specialization are required.';
      return;
    }
    this.doctorBusy = true;
    this.doctorError = '';
    this.http.post<any>(`${this.base}/admin/hospitals/${this.doctorHospital.id}/doctors`, this.doctorForm)
      .pipe(catchError(err => {
        this.doctorError = err.error?.message ?? 'Failed to add doctor.';
        this.doctorBusy = false;
        return of(null);
      }))
      .subscribe(res => {
        if (res !== null) {
          this.doctorBusy = false;
          this.doctorSuccess = `Dr. ${this.doctorForm.name} added successfully.`;
          this.doctorForm = { name: '', specialization: '', contactPhone: '', availability: '' };
          setTimeout(() => { this.doctorSuccess = ''; }, 3000);
        }
      });
  }
}
