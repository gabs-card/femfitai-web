import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Authservice } from '../services/authservice';

export const programadorGuard: CanActivateFn = () =>
  inject(Authservice).esProgramador() ? true : inject(Router).createUrlTree(['/']);
