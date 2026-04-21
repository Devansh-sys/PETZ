import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'petz-sos-success',
  imports: [Navbar, RouterLink],
  templateUrl: './sos-success.html',
  styleUrl: './sos-success.scss'
})
export class SosSuccess {
  private auth = inject(AuthService);
  readonly session = this.auth.session;
  readonly phone = computed(() => this.session()?.phone ?? '');
  readonly temp = computed(() => this.session()?.isTemporarySession ?? false);
}
