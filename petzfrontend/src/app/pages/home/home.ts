import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';
import { AuthService } from '../../core/auth/auth.service';

const ROLE_REDIRECTS: Record<string, string> = {
  ADMIN:   '/admin',
  NGO_REP: '/ngo/dashboard',
  HOSPITAL_REP: '/appointments',
};

@Component({
  selector: 'petz-home',
  imports: [Navbar, Footer, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  constructor(private router: Router, private auth: AuthService) {}

  ngOnInit(): void {
    const role = this.auth.session()?.role;
    if (role && ROLE_REDIRECTS[role]) {
      this.router.navigate([ROLE_REDIRECTS[role]], { replaceUrl: true });
    }
  }

  onSosTap(): void {
    this.router.navigate(['/sos/auth']);
  }
}
