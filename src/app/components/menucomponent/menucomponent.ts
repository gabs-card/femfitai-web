import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Authservice } from '../../services/authservice';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-menucomponent',
  styleUrl: './menucomponent.css',
  templateUrl: './menucomponent.html',
})
export class Menucomponent {

  auth = inject(Authservice);

  cerrarSesion(): void {
    this.auth.logout();
  }
}