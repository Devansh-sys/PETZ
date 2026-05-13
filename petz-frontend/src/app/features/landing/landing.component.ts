import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, style, animate, transition } from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  animations: [
    trigger('heroLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-28px)' }),
        animate('650ms 100ms cubic-bezier(0.16,1,0.3,1)', style({ opacity: 1, transform: 'none' }))
      ])
    ]),
    trigger('heroRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(28px)' }),
        animate('650ms 250ms cubic-bezier(0.16,1,0.3,1)', style({ opacity: 1, transform: 'none' }))
      ])
    ])
  ]
})
export class LandingComponent implements OnInit {

  scrolled = false;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Redirect already-authenticated users to their dashboard
    if (this.auth.isLoggedIn()) {
      const role = this.auth.getRole();
      const map: Record<string, string> = {
        ADMIN: '/admin',
        NGO: '/ngo',
        HOSPITAL: '/hospital'
      };
      this.router.navigate([map[role ?? ''] ?? '/dashboard']);
      return;
    }

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
      this.scrolled = window.scrollY > 20;
    });
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
