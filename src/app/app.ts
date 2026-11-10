
import { Component, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Logincomponent } from './components/logincomponent/logincomponent';
import { Menucomponent } from './components/menucomponent/menucomponent';
import { Authservice } from './services/authservice';
import { Landingcomponent } from './components/landingcomponent/landingcomponent';

@Component({
  imports: [
    RouterOutlet,
    Logincomponent,
    Landingcomponent,
    Menucomponent
  ],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {

  auth = inject(Authservice);
  vistaPublica = signal<'landing' | 'login' | 'registro'>('landing');

  constructor() {
    effect(() => {
      if (this.auth.logueado()) this.vistaPublica.set('landing');
    });
  }

}
