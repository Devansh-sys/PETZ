import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { Notification } from '../../core/models/notification.model';

@Component({
  standalone: false,
  selector: 'app-notifications',
  template: `
    <div class="page-container" style="max-width:780px">

      <!-- Header -->
      <div class="page-header" style="margin-bottom:24px">
        <div class="page-header-left" style="display:flex;align-items:center">
          <button mat-icon-button [routerLink]="dashboardRoute"
                  style="background:#fff;border:1px solid #E0EBF2;border-radius:10px;margin-right:12px">
            <mat-icon style="color:#4A6478">arrow_back</mat-icon>
          </button>
          <div>
            <h1>Notifications</h1>
            <p>Stay updated on your activity</p>
          </div>
        </div>
        @if (notifications.length > 0) {
          <button mat-stroked-button (click)="markAllRead()"
                  style="border-radius:10px;color:#4A6478;border-color:#C8DCE8;height:40px">
            <mat-icon>done_all</mat-icon> Mark all read
          </button>
        }
      </div>

      <!-- Loading -->
      @if (loading) {
        <div class="loading-state">
          <mat-spinner diameter="32"></mat-spinner>
          <span>Loading notifications...</span>
        </div>
      }

      @if (!loading) {

        <!-- Empty -->
        @if (notifications.length === 0) {
          <div class="card">
            <div class="empty-state">
              <div class="empty-icon"><mat-icon>notifications_none</mat-icon></div>
              <h3>All caught up!</h3>
              <p>No notifications yet. Activity updates will appear here.</p>
            </div>
          </div>
        }

        <!-- Notification list -->
        @if (notifications.length > 0) {
          <div class="notif-list">
            @for (n of notifications; track n.id) {
              <div class="notif-card" [class.unread]="!n.isRead" (click)="markRead(n)">
                <div class="notif-icon-wrap" [ngClass]="iconClass(n.type)">
                  <mat-icon>{{ iconFor(n.type) }}</mat-icon>
                </div>
                <div class="notif-body">
                  <p class="notif-title">{{ n.title }}</p>
                  <p class="notif-msg">{{ n.message }}</p>
                  @if (n.createdAt) {
                    <p class="notif-time">{{ n.createdAt | date:'MMM d, y · h:mm a' }}</p>
                  }
                </div>
                @if (!n.isRead) {
                  <div class="unread-dot"></div>
                }
              </div>
            }
          </div>
        }

      }
    </div>
  `,
  styles: [`
    .notif-list { display: flex; flex-direction: column; gap: 10px; }

    .notif-card {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      background: #fff;
      border: 1px solid #E0EBF2;
      border-radius: 16px;
      padding: 16px 18px;
      cursor: pointer;
      transition: all 0.18s;
      position: relative;
      &:hover { box-shadow: 0 4px 18px rgba(0,0,0,0.07); transform: translateY(-1px); }
      &.unread {
        background: #F9FBFB;
        border-color: #A8C4D4;
      }
    }

    .notif-icon-wrap {
      width: 42px; height: 42px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      mat-icon { font-size: 20px; width: 20px; height: 20px; color: #fff; }
    }
    .type-rescue    { background: linear-gradient(135deg,#F87171,#DC2626); }
    .type-adopt     { background: linear-gradient(135deg,#34D399,#059669); }
    .type-appt      { background: linear-gradient(135deg,#B97AFB,#7C3AED); }
    .type-alert     { background: linear-gradient(135deg,#FBBF24,#D97706); }
    .type-default   { background: linear-gradient(135deg,#FF9F5A,#FF8C42); }

    .notif-body { flex: 1; min-width: 0; }
    .notif-title {
      margin: 0 0 4px;
      font-weight: 700;
      font-size: 0.88rem;
      color: #1A3547;
    }
    .notif-msg {
      margin: 0 0 5px;
      font-size: 0.82rem;
      color: #4A6478;
      line-height: 1.5;
    }
    .notif-time {
      margin: 0;
      font-size: 0.72rem;
      color: #8BA3B5;
    }

    .unread-dot {
      width: 9px; height: 9px;
      border-radius: 50%;
      background: #FF8C42;
      flex-shrink: 0;
      margin-top: 6px;
    }
  `]
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
