import { Component, computed, ElementRef, HostListener, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/notification/notification.service';

@Component({
  selector: 'petz-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private host = inject(ElementRef);
  readonly notifSvc = inject(NotificationService);

  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly session = this.auth.session;
  readonly menuOpen = signal(false);
  readonly activityOpen = signal(false);
  readonly userOpen = signal(false);
  readonly notifOpen = signal(false);

  readonly roleLabel = computed(() => {
    const r = this.auth.session()?.role ?? '';
    const map: Record<string, string> = {
      REPORTER: 'Reporter', NGO_REP: 'NGO', NGO: 'NGO',
      ADMIN: 'Admin', VET: 'Vet', ADOPTER: 'Adopter'
    };
    return map[r] ?? r;
  });

  readonly userInitial = computed(() => (this.roleLabel() || 'U').charAt(0));

  readonly isNgo = computed(() => {
    const r = this.auth.session()?.role ?? '';
    return r === 'NGO_REP' || r === 'NGO';
  });

  readonly isAdmin = computed(() => this.auth.session()?.role === 'ADMIN');

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.notifSvc.loadUnreadCount();
    }
  }

  toggleMenu(): void { this.menuOpen.update(v => !v); }
  closeMenu(): void { this.menuOpen.set(false); }

  toggleActivity(): void {
    this.userOpen.set(false);
    this.notifOpen.set(false);
    this.activityOpen.update(v => !v);
  }
  toggleUser(): void {
    this.activityOpen.set(false);
    this.notifOpen.set(false);
    this.userOpen.update(v => !v);
  }
  toggleNotif(): void {
    this.activityOpen.set(false);
    this.userOpen.set(false);
    if (!this.notifOpen()) {
      this.notifSvc.loadNotifications();
    }
    this.notifOpen.update(v => !v);
  }
  closeDropdowns(): void {
    this.activityOpen.set(false);
    this.userOpen.set(false);
    this.notifOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (!this.host.nativeElement.contains(e.target as Node)) this.closeDropdowns();
  }

  signOut(): void {
    this.auth.logout();
    this.closeMenu();
    this.closeDropdowns();
    this.router.navigate(['/']);
  }
}
