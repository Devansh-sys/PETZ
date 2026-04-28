import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';

@Component({
  selector: 'petz-home',
  imports: [Navbar, Footer, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  constructor(private router: Router) {}

  onSosTap(): void {
    this.router.navigate(['/sos/auth']);
  }
}
