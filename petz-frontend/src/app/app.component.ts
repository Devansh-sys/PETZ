import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isLoggedIn  = false;
  role: string | null = null;
  userName    = '';
  unreadCount$: Observable<number>;

  sidenavOpen = true;
  isMobile    = false;

  navItems: { label: string; icon: string; route: string; roles: string[] }[] = [
    // USER
    { label: 'Dashboard',          icon: 'dashboard',            route: '/dashboard',              roles: ['USER'] },
    { label: 'My Adoptions',       icon: 'favorite',             route: '/adoption/my',            roles: ['USER'] },
    { label: 'Browse Animals',     icon: 'pets',                 route: '/adoption/animals',       roles: ['USER'] },
    { label: 'Appointments',       icon: 'event',                route: '/appointments',           roles: ['USER'] },
    { label: 'Rescue',             icon: 'emergency',            route: '/rescue',                 roles: ['USER'] },
    // NGO
    { label: 'NGO Dashboard',      icon: 'dashboard',            route: '/ngo',                    roles: ['NGO'] },
    { label: 'Rescue Queue',       icon: 'emergency',            route: '/ngo/rescues',            roles: ['NGO'] },
    { label: 'My Animals',         icon: 'pets',                 route: '/ngo/animals',            roles: ['NGO'] },
    { label: 'Applications',       icon: 'assignment',           route: '/ngo/applications',       roles: ['NGO'] },
    // HOSPITAL
    { label: 'Hospital Dashboard', icon: 'dashboard',            route: '/hospital',               roles: ['HOSPITAL'] },
    { label: 'Appointments',       icon: 'event',                route: '/hospital/appointments',  roles: ['HOSPITAL'] },
    { label: 'Doctors',            icon: 'medical_services',     route: '/hospital/doctors',       roles: ['HOSPITAL'] },
    // ADMIN
    { label: 'Admin Panel',        icon: 'admin_panel_settings', route: '/admin',                  roles: ['ADMIN'] }
  ];

  constructor(
    public  auth:              AuthService,
    public  notifService:      NotificationService,
    private router:            Router,
    private breakpointObserver: BreakpointObserver
  ) {
    this.unreadCount$ = this.notifService.unreadCount$;
  }

  ngOnInit(): void {
    // Responsive: switch mode and auto-close on small screens
    this.breakpointObserver.observe(['(max-width: 900px)']).subscribe(result => {
      this.isMobile   = result.matches;
      this.sidenavOpen = !result.matches;
    });

    this.auth.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.role       = user?.role ?? null;
      this.userName   = user?.name ?? '';
      if (user) {
        this.notifService.connect();
        this.notifService.loadAll().subscribe({
          next: res => {
            const all: any[] = res.data ?? [];
            this.notifService.unreadCount$.next(all.filter((n: any) => !n.isRead).length);
          }
        });
      }
    });
  }

  visibleNav(): typeof this.navItems {
    return this.navItems.filter(item =>
      !item.roles || (this.role && item.roles.includes(this.role))
    );
  }

  onNavClick(): void {
    if (this.isMobile) this.sidenavOpen = false;
  }

  logout(): void {
    this.notifService.disconnect();
    this.auth.logout();
  }
}
