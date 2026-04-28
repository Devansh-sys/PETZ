import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  AdoptablePet,
  AdoptionApplication,
  NgoListingCreateRequest,
  NgoReviewRequest
} from './adoption.models';

interface ApiResponse<T> { success?: boolean; data: T; message?: string; }
interface PageResponse<T> { content: T[]; totalElements: number; totalPages: number; number: number; }

@Injectable({ providedIn: 'root' })
export class AdoptionService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/adoptable-pets`;
  private appsBase = `${environment.apiBaseUrl}/adoption-applications`;
  private ngoBase = `${environment.apiBaseUrl}/ngo`;

  // ── Public: Browse & Search ──────────────────────────────────────────

  browse(sort?: string, page = 0, size = 12): Observable<AdoptablePet[]> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (sort) params = params.set('sort', sort);
    return this.http.get<ApiResponse<PageResponse<AdoptablePet>>>(this.base, { params })
      .pipe(map(r => r.data?.content ?? []));
  }

  search(filters: {
    species?: string; breed?: string; gender?: string;
    minAge?: number; maxAge?: number; city?: string;
    vaccinated?: boolean; specialNeeds?: boolean; adoptionReady?: boolean;
  }): Observable<AdoptablePet[]> {
    let params = new HttpParams();
    if (filters.species)       params = params.set('species', filters.species);
    if (filters.breed)         params = params.set('breed', filters.breed);
    if (filters.gender)        params = params.set('gender', filters.gender);
    if (filters.city)          params = params.set('city', filters.city);
    if (filters.minAge != null) params = params.set('minAge', filters.minAge);
    if (filters.maxAge != null) params = params.set('maxAge', filters.maxAge);
    if (filters.vaccinated)    params = params.set('vaccinated', 'true');
    if (filters.specialNeeds)  params = params.set('specialNeeds', 'true');
    if (filters.adoptionReady) params = params.set('adoptionReady', 'true');
    return this.http.get<ApiResponse<PageResponse<AdoptablePet>>>(`${this.base}/search`, { params })
      .pipe(map(r => r.data?.content ?? []));
  }

  getById(petId: string): Observable<AdoptablePet> {
    return this.http.get<ApiResponse<AdoptablePet>>(`${this.base}/${petId}`).pipe(map(r => r.data));
  }

  // ── Adoption Applications ────────────────────────────────────────────

  startApplication(petId: string, _adopterId: string): Observable<AdoptionApplication> {
    return this.http.post<ApiResponse<AdoptionApplication>>(this.appsBase, { adoptablePetId: petId })
      .pipe(map(r => r.data));
  }

  getMyApplications(): Observable<AdoptionApplication[]> {
    return this.http.get<ApiResponse<AdoptionApplication[]>>(`${this.appsBase}/mine`).pipe(map(r => r.data ?? []));
  }

  getApplication(id: string): Observable<AdoptionApplication> {
    return this.http.get<ApiResponse<AdoptionApplication>>(`${this.appsBase}/${id}`).pipe(map(r => r.data));
  }

  updatePersonal(id: string, data: any): Observable<AdoptionApplication> {
    return this.http.patch<ApiResponse<AdoptionApplication>>(`${this.appsBase}/${id}/personal`, data).pipe(map(r => r.data));
  }

  updateLifestyle(id: string, data: any): Observable<AdoptionApplication> {
    return this.http.patch<ApiResponse<AdoptionApplication>>(`${this.appsBase}/${id}/lifestyle`, data).pipe(map(r => r.data));
  }

  updateExperience(id: string, data: any): Observable<AdoptionApplication> {
    return this.http.patch<ApiResponse<AdoptionApplication>>(`${this.appsBase}/${id}/experience`, data).pipe(map(r => r.data));
  }

  updateConsent(id: string, data: any): Observable<AdoptionApplication> {
    return this.http.patch<ApiResponse<AdoptionApplication>>(`${this.appsBase}/${id}/consent`, data).pipe(map(r => r.data));
  }

  submitApplication(id: string): Observable<AdoptionApplication> {
    return this.http.post<ApiResponse<AdoptionApplication>>(`${this.appsBase}/${id}/submit`, {}).pipe(map(r => r.data));
  }

  withdrawApplication(id: string): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.appsBase}/${id}/withdraw`, {}).pipe(map(() => undefined));
  }

  uploadDocument(id: string, docType: string, file: File): Observable<void> {
    const form = new FormData();
    form.append('file', file, file.name);
    form.append('documentType', docType);
    return this.http.post<ApiResponse<void>>(`${this.appsBase}/${id}/documents`, form).pipe(map(() => undefined));
  }

  // ── NGO: Pet Listings ────────────────────────────────────────────────

  ngoListPets(): Observable<AdoptablePet[]> {
    return this.http.get<ApiResponse<PageResponse<AdoptablePet>>>(`${this.ngoBase}/adoptable-pets`)
      .pipe(map(r => r.data?.content ?? []));
  }

  ngoCreatePet(data: NgoListingCreateRequest): Observable<AdoptablePet> {
    return this.http.post<ApiResponse<AdoptablePet>>(`${this.ngoBase}/adoptable-pets`, data).pipe(map(r => r.data));
  }

  ngoUpdatePet(petId: string, data: Partial<NgoListingCreateRequest>): Observable<AdoptablePet> {
    return this.http.patch<ApiResponse<AdoptablePet>>(`${this.ngoBase}/adoptable-pets/${petId}`, data).pipe(map(r => r.data));
  }

  ngoArchivePet(petId: string, reason = 'Archived by NGO'): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.ngoBase}/adoptable-pets/${petId}/archive`, { reason })
      .pipe(map(() => undefined));
  }

  // ── NGO: Application Reviews ─────────────────────────────────────────

  ngoListApplications(status?: string): Observable<AdoptionApplication[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<PageResponse<AdoptionApplication>>>(`${this.ngoBase}/adoption-applications`, { params })
      .pipe(map(r => r.data?.content ?? []));
  }

  ngoGetApplication(id: string): Observable<AdoptionApplication> {
    return this.http.get<ApiResponse<AdoptionApplication>>(`${this.ngoBase}/adoption-applications/${id}`).pipe(map(r => r.data));
  }

  ngoStartReview(id: string): Observable<AdoptionApplication> {
    return this.http.post<ApiResponse<AdoptionApplication>>(`${this.ngoBase}/adoption-applications/${id}/review-start`, {}).pipe(map(r => r.data));
  }

  ngoApprove(id: string, notes?: string): Observable<AdoptionApplication> {
    return this.http.post<ApiResponse<AdoptionApplication>>(
      `${this.ngoBase}/adoption-applications/${id}/approve`,
      { confirm: true, notes }
    ).pipe(map(r => r.data));
  }

  ngoReject(id: string, reason: string): Observable<AdoptionApplication> {
    return this.http.post<ApiResponse<AdoptionApplication>>(`${this.ngoBase}/adoption-applications/${id}/reject`, { reason }).pipe(map(r => r.data));
  }

  ngoClarify(id: string, req: NgoReviewRequest): Observable<AdoptionApplication> {
    return this.http.post<ApiResponse<AdoptionApplication>>(`${this.ngoBase}/adoption-applications/${id}/clarify`, req).pipe(map(r => r.data));
  }

  ngoVerifyDoc(appId: string, docId: string, verified: boolean, reason?: string): Observable<void> {
    return this.http.post<ApiResponse<void>>(
      `${this.ngoBase}/adoption-applications/${appId}/documents/${docId}/verify`,
      { verified, reason }
    ).pipe(map(() => undefined));
  }
}
