import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Loginservice } from '../../services/loginservice';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-menucomponent',
  styleUrl: './menucomponent.css',
  templateUrl: './menucomponent.html',
})
export class Menucomponent {
  constructor(
    private readonly loginService: Loginservice,
    private readonly router: Router
  ) { }

  get esAdmin(): boolean {
   return this.loginService.hasAnyRole(['ADMIN']);
  }

 get esUsuaria(): boolean {
   return this.loginService.hasAnyRole(['USUARIA']);
 }

  cerrarSesion(): void {
    this.loginService.logout();
    void this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}