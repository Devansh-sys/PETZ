import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Client, IFrame } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../../environments/environment';
import { Notification } from '../models/notification.model';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private stompClient: Client | null = null;
  notifications$ = new BehaviorSubject<Notification[]>([]);
  unreadCount$   = new BehaviorSubject<number>(0);

  constructor(private api: ApiService, private auth: AuthService) {}

  connect(): void {
    const userId = this.auth.getUserId();
    if (!userId) return;

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(environment.wsUrl) as any,
      onConnect: () => {
        this.stompClient?.subscribe(`/user/${userId}/queue/notifications`, (msg) => {
          const notif: Notification = JSON.parse(msg.body);
          const current = this.notifications$.value;
          this.notifications$.next([notif, ...current]);
          this.unreadCount$.next(this.unreadCount$.value + 1);
        });
      }
    });

    this.stompClient.activate();
  }

  disconnect(): void {
    this.stompClient?.deactivate();
  }

  loadAll(): Observable<any> {
    return this.api.get<any>('/notifications');
  }

  markRead(id: number): Observable<any> {
    return this.api.patch<any>(`/notifications/${id}/read`, {});
  }

  markAllRead(): Observable<any> {
    return this.api.patch<any>('/notifications/read-all', {});
  }
}
