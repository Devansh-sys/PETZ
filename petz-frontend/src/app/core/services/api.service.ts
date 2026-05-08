import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {

  /**
   * Resolves the API base URL at runtime.
   *
   * • GitHub Codespaces  — frontend is served from  <name>-4200.app.github.dev
   *                        backend is forwarded at   <name>-8081.app.github.dev
   *                        We auto-swap the port segment so no env-file changes are needed.
   *
   * • Local dev / Railway / Netlify — falls back to environment.apiUrl as normal.
   */
  private get base(): string {
    const host = window.location.hostname;
    if (host.includes('.app.github.dev')) {
      // Replace the frontend port segment with the backend port
      const backendHost = host.replace('-4200.app.github.dev', '-8081.app.github.dev')
                              .replace('-4200.preview.app.github.dev', '-8081.preview.app.github.dev');
      return `https://${backendHost}/api/v1`;
    }
    return environment.apiUrl;
  }

  constructor(private http: HttpClient) {}

  get<T>(path: string, params?: Record<string, any>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v != null) httpParams = httpParams.set(k, v);
      });
    }
    return this.http.get<T>(`${this.base}${path}`, { params: httpParams });
  }

  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.base}${path}`, body);
  }

  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.base}${path}`, body);
  }

  patch<T>(path: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.base}${path}`, body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.base}${path}`);
  }

  postFormData<T>(path: string, formData: FormData): Observable<T> {
    return this.http.post<T>(`${this.base}${path}`, formData);
  }
}
