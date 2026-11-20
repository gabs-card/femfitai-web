import { Component, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Logincomponent } from './components/logincomponent/logincomponent';
import { Menucomponent } from './components/menucomponent/menucomponent';
import { Loginservice } from './services/loginservice';
import { Landingcomponent } from './components/landingcomponent/landingcomponent';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    Logincomponent,
    Landingcomponent,
    Menucomponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {

  auth = inject(Loginservice);

  vistaPublica = signal<'landing' | 'login' | 'registro'>('landing');

}