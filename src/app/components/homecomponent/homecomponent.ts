import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Loginservice } from '../../services/loginservice';
import { Paneladmincomponent } from '../administracioncomponent/paneladmincomponent/paneladmincomponent';

@Component({
  imports: [RouterLink, Paneladmincomponent],
  host: { '[class.inicio-admin]': 'esAdmin' },
  selector: 'app-homecomponent',
  styleUrl: './homecomponent.css',
  templateUrl: './homecomponent.html',
})
export class Homecomponent {
  constructor(private readonly loginService: Loginservice) {}

  get esAdmin(): boolean {
    return this.loginService.hasAnyRole(['ADMIN']);
  }

  get esUsuaria(): boolean {
    return this.loginService.hasAnyRole(['USUARIA']);
  }
}
