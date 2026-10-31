import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UsuarioDTO } from '../models/UsuarioDTO';
import { Authservice } from './authservice';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  usuarios = signal<UsuarioDTO[]>([]);
  cargando = signal(false);
  error = signal('');

  constructor(private http: HttpClient, private authService: Authservice) {}

  listar(): void {
    this.usuarios.set([]);
    this.error.set('');

    const token = this.authService.token();
    if (!token) {
      this.error.set('Inicia sesión para consultar los usuarios de FemFitAI.');
      return;
    }

    this.cargando.set(true);
    this.http.get<UsuarioDTO[]>(`${environment.apiUrl}/usuarios`, {
      headers: { Authorization: `Bearer ${token}` },
    }).subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: (respuesta: HttpErrorResponse) => {
        if (respuesta.status === 401) {
          this.error.set('Tu sesión no es válida o ha vencido. Inicia sesión nuevamente.');
        } else if (respuesta.status === 403) {
          this.error.set('No tienes permiso para consultar el listado de usuarios.');
        } else if (respuesta.status === 0) {
          this.error.set('No se pudo conectar con FemFitAI. Revisa que el servidor esté disponible.');
        } else {
          this.error.set('No se pudo cargar el listado de usuarios.');
        }
        this.cargando.set(false);
      },
    });
  }
}
