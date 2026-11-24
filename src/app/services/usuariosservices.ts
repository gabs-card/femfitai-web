import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UsuarioDTO, UsuarioDetalleDTO, UsuarioEditDTO } from '../models/UsuarioDTO';
import { Loginservice } from './loginservice';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  usuarios = signal<UsuarioDTO[]>([]);
  cargando = signal(false);
  error = signal('');
  private readonly api = `${environment.apiUrl}/usuarios`;

  constructor(
    private http: HttpClient,
    private authService: Loginservice,
  ) {}

  listar(): void {
    this.usuarios.set([]);
    this.error.set('');

    if (!this.authService.isAuthenticated()) {
      this.error.set('Inicia sesión para consultar los usuarios de FemFitAI.');
      return;
    }

    this.cargando.set(true);
    this.http.get<UsuarioDTO[]>(this.api).subscribe({
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
          this.error.set(
            'No se pudo conectar con FemFitAI. Revisa que el servidor esté disponible.',
          );
        } else {
          this.error.set('No se pudo cargar el listado de usuarios.');
        }
        this.cargando.set(false);
      },
    });
  }

  registrar(datos: {
    nombres: string;
    apellidos: string;
    correo: string;
    passwordHash: string;
    rol?: string;
    estado?: boolean;
  }): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(this.api, datos);
  }

  buscarPorId(id: number): Observable<UsuarioDTO> {
    return this.http.get<UsuarioDTO>(`${this.api}/${id}`);
  }
  detalle(id: number): Observable<UsuarioDetalleDTO> {
    return this.http.get<UsuarioDetalleDTO>(`${this.api}/${id}/detalle`);
  }
  actualizar(id: number, datos: UsuarioEditDTO): Observable<UsuarioDTO> {
    return this.http.put<UsuarioDTO>(`${this.api}/${id}`, datos);
  }

  desactivar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`); // baja lógica en el backend
  }

  reactivar(u: UsuarioDTO): Observable<UsuarioDTO> {
    return this.actualizar(u.idUsuario, {
      nombres: u.nombres,
      apellidos: u.apellidos,
      correo: u.correo,
      estado: true,
    });
  }
}
