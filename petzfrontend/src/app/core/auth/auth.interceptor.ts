import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();
  if (!token) {
    return next(req);
  }
  const session = auth.session();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`
  };
  if (session?.userId) {
    headers['X-User-Id'] = session.userId;
  }
  const cloned = req.clone({ setHeaders: headers });
  return next(cloned);
};
