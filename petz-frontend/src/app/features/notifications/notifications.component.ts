import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { Notification } from '../../core/models/notification.model';

@Component({
  standalone: false,
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  loading = true;
  role = '';

  get dashboardRoute(): string {
    const map: Record<string, string> = {
      USER: '/dashboard', NGO: '/ngo', HOSPITAL: '/hospital', ADMIN: '/admin'
    };
    return map[this.role] ?? '/dashboard';
  }

  constructor(
    private notifService: NotificationService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.role = this.auth.currentUser$.value?.role ?? 'USER';
    this.notifService.loadAll().subscribe({
      next: res => {
        this.notifications = res.data ?? [];
        const unread = this.notifications.filter(n => !n.isRead).length;
        this.notifService.unreadCount$.next(unread);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  markRead(n: Notification): void {
    if (n.isRead) return;
    this.notifService.markRead(n.id).subscribe({
      next: () => {
        n.isRead = true;
        const unread = this.notifications.filter(x => !x.isRead).length;
        this.notifService.unreadCount$.next(unread);
      }
    });
  }

  markAllRead(): void {
    this.notifService.markAllRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
        this.notifService.unreadCount$.next(0);
      }
    });
  }

  iconFor(type: string): string {
    const map: Record<string, string> = {
      RESCUE: 'emergency', ADOPTION: 'favorite', APPOINTMENT: 'event',
      ALERT: 'warning', INFO: 'info_outline', SUCCESS: 'check_circle'
    };
    return map[type] ?? 'notifications_none';
  }

  iconClass(type: string): string {
    const map: Record<string, string> = {
      RESCUE: 'type-rescue', ADOPTION: 'type-adopt', APPOINTMENT: 'type-appt',
      ALERT: 'type-alert'
    };
    return map[type] ?? 'type-default';
  }
}
