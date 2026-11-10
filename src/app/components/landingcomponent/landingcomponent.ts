import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-landingcomponent',
  standalone: true,
  imports: [],
  templateUrl: './landingcomponent.html',
  styleUrl: './landingcomponent.css',
})
export class Landingcomponent {
  @Output() iniciarSesion = new EventEmitter<void>();
  @Output() crearCuenta = new EventEmitter<void>();
}
