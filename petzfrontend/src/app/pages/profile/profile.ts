import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'petz-profile',
  imports: [CommonModule, FormsModule, Navbar, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  session = this.auth.session;

  displayName = signal('');
  displayEmail = signal('');
  saved = signal(false);

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) { this.router.navigate(['/login']); return; }
  }

  get role(): string {
    const r = this.session()?.role ?? '';
    const map: Record<string, string> = {
      REPORTER: 'Reporter', NGO_REP: 'NGO Representative',
      NGO: 'NGO', ADMIN: 'Administrator', VET: 'Veterinarian', ADOPTER: 'Adopter'
    };
    return map[r] ?? r;
  }

  get isTemporary(): boolean { return this.session()?.isTemporarySession ?? false; }

  signOut(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
