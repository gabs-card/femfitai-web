import { Component, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Authservice } from '../../services/authservice';
import { UsuariosService } from '../../services/usuariosservices';

@Component({
  imports: [],
  selector: 'app-logincomponent',
  styleUrl: './logincomponent.css',
  templateUrl: './logincomponent.html',
})
export class Logincomponent {
  cargando = signal(false);
  mensaje = signal('');

  constructor(private authService: Authservice, public usuariosService: UsuariosService) {}

  iniciarSesion(correo: string, password: string): void {
    if (this.cargando() || this.usuariosService.cargando()) {
      return;
    }

    this.mensaje.set('');
    this.authService.logout();
    this.usuariosService.usuarios.set([]);
    this.usuariosService.error.set('');

    if (!correo.trim() || !password) {
      this.mensaje.set('Ingresa tu correo y contraseña.');
      return;
    }

    this.cargando.set(true);
    this.authService.login({ correo: correo.trim(), password }).subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        if (respuesta.rol !== 'PROGRAMADOR') {
          this.mensaje.set('Tu cuenta no tiene el rol PROGRAMADOR requerido para consultar usuarios.');
          return;
        }
        this.mensaje.set('Sesión iniciada.');
        this.usuariosService.listar();
      },
      error: (respuesta: HttpErrorResponse) => {
        this.cargando.set(false);
        if (respuesta.status === 401) {
          this.mensaje.set('Correo o contraseña incorrectos, o cuenta inactiva.');
        } else if (respuesta.status === 0) {
          this.mensaje.set('No se pudo conectar con FemFitAI. Verifica la conexión con el servidor.');
        } else {
          this.mensaje.set('No se pudo iniciar sesión.');
        }
      },
    });
  }
}
