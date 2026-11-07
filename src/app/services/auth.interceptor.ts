import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Authservice } from './authservice';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Authservice);
  const token = auth.token();
  if (
    !token ||
    !req.url.startsWith(environment.apiUrl) ||
    req.url.endsWith('/login') ||
    req.headers.has('Authorization')
  ) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })).pipe(
    catchError((err) => {
      if (err.status === 401) auth.logout();
      return throwError(() => err);
    }),
  );
};