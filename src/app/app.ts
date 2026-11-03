
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Logincomponent } from './components/logincomponent/logincomponent';
import { Menucomponent } from './components/menucomponent/menucomponent';
import { Authservice } from './services/authservice';

@Component({
  imports: [
    RouterOutlet,
    Logincomponent,
    Menucomponent
  ],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {

  auth = inject(Authservice);

}
