import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Menucomponent } from '../menucomponent/menucomponent';
import { Loginservice } from '../../services/loginservice';

@Component({
  selector: 'app-layoutcomponent',
  imports: [Menucomponent, RouterOutlet],
  templateUrl: './layoutcomponent.html',
  styleUrl: './layoutcomponent.css',
})
export class Layoutcomponent {
  constructor(private readonly loginService: Loginservice) {}
  get esAdmin(): boolean {
    return this.loginService.hasAnyRole(['ADMIN']);
  }
}
