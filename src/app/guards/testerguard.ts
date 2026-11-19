import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Authservice } from '../services/loginservice';

export const testerGuard: CanActivateFn = () =>
  inject(Authservice).esProgramador() ? inject(Router).createUrlTree(['/']) : true;