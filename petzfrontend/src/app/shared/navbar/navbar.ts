import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'petz-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly session = this.auth.session;
  readonly menuOpen = signal(false);

  readonly roleLabel = computed(() => {
    const r = this.auth.session()?.role ?? '';
    const map: Record<string, string> = {
      REPORTER: 'Reporter', NGO_REP: 'NGO', NGO: 'NGO',
      ADMIN: 'Admin', VET: 'Vet', ADOPTER: 'Adopter'
    };
    return map[r] ?? r;
  });

  readonly isNgo = computed(() => {
    const r = this.auth.session()?.role ?? '';
    return r === 'NGO_REP' || r === 'NGO';
  });

  readonly isAdmin = computed(() => this.auth.session()?.role === 'ADMIN');

  toggleMenu(): void { this.menuOpen.update(v => !v); }
  closeMenu(): void { this.menuOpen.set(false); }

  signOut(): void {
    this.auth.logout();
    this.closeMenu();
    this.router.navigate(['/']);
  }
}
