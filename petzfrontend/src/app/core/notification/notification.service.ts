import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private base = environment.apiBaseUrl;
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  readonly unreadCount = signal(0);
  readonly items = signal<any[]>([]);

  loadUnreadCount(): void {
    if (!this.auth.isAuthenticated()) return;
    this.http.get<any>(`${this.base}/users/me/notifications/unread-count`)
      .pipe(map(r => r.data?.count ?? r.count ?? 0), catchError(() => of(0)))
      .subscribe(c => this.unreadCount.set(c));
  }

  loadNotifications(): void {
    if (!this.auth.isAuthenticated()) return;
    this.http.get<any>(`${this.base}/users/me/notifications?size=15`)
      .pipe(map(r => r.data?.content ?? r.content ?? []), catchError(() => of([])))
      .subscribe(list => this.items.set(list));
  }

  markRead(id: string): void {
    this.http.patch(`${this.base}/users/me/notifications/${id}/read`, {})
      .subscribe(() => {
        this.items.update(list => list.map(n => n.id === id ? { ...n, isRead: true } : n));
        this.unreadCount.update(c => Math.max(0, c - 1));
      });
  }

  markAllRead(): void {
    this.http.patch(`${this.base}/users/me/notifications/read-all`, {})
      .subscribe(() => {
        this.items.update(list => list.map(n => ({ ...n, isRead: true })));
        this.unreadCount.set(0);
      });
  }
}
