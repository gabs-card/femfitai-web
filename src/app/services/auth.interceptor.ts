import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Authservice } from '../services/authservice';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(Authservice).token();
  if (
    !token ||
    !req.url.startsWith(environment.apiUrl) ||
    req.url.endsWith('/login') ||
    req.headers.has('Authorization')
  ) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
