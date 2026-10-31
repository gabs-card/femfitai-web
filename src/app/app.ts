import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ListaClientesComponent } from './components/lista-clientes/lista-clientes.component';
import { Logincomponent } from './components/logincomponent/logincomponent';

@Component({
  imports: [RouterOutlet, Logincomponent, ListaClientesComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('femfitai-web');
}
