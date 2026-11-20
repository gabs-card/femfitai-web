import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Loginservice } from '../../services/loginservice';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  if (req.url.endsWith('/login')) {
    return next(req);
  }

  const auth = inject(Loginservice);
  const router = inject(Router);

  const token = auth.getToken();
  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    })
  ).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        auth.logout();
        void router.navigateByUrl('/login', { replaceUrl: true });
      }

      return throwError(() => error);
    })
  );
};