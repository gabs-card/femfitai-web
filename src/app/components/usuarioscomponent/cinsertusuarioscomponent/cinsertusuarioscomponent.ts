import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Usuarioscomponent } from '../usuarioscomponent';
@Component({
  selector: 'app-cinsertusuarioscomponent',
  imports: [Usuarioscomponent, RouterLink],
  templateUrl: './cinsertusuarioscomponent.html',
  styleUrl: '../../administracioncomponent/administracion.css',
})
export class Cinsertusuarioscomponent {
  private router = inject(Router);
  volver(): void {
    void this.router.navigate(['/usuarios/listar']);
  }
  cuentaCreada(): void {
    void this.router.navigate(['/usuarios/listar'], {
      state: { mensaje: 'Usuario creado correctamente.' },
    });
  }
}
