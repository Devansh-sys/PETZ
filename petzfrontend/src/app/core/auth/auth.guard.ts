import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  sessionStorage.setItem('petz.authNotice', `Please sign in to continue.`);
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
