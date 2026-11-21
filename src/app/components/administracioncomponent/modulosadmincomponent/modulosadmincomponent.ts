import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MODULOS_ADMINISTRACION } from '../gestionadmincomponent/modulos-administracion';
@Component({
  selector: 'app-modulosadmincomponent',
  imports: [RouterLink],
  templateUrl: './modulosadmincomponent.html',
  styleUrls: ['../administracion.css', './modulosadmincomponent.css'],
})
export class Modulosadmincomponent {
  modulos = MODULOS_ADMINISTRACION;
}
