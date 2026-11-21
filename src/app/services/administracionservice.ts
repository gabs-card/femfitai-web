import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, expand, reduce } from 'rxjs';
import { environment } from '../../environments/environment';
import { Page } from '../models/Page';
import { UsuarioDTO } from '../models/UsuarioDTO';
import {
  RegistroAdministracionDTO,
  ValorAdministracion,
} from '../models/RegistroAdministracionDTO';

@Injectable({ providedIn: 'root' })
export class Administracionservice {
  private http = inject(HttpClient);
  private apiURL = `${environment.apiUrl}/administracion`;
  listar(
    modulo: string,
    idUsuario: number | null,
    pagina = 0,
    tamano = 10,
  ): Observable<Page<RegistroAdministracionDTO>> {
    let params = new HttpParams().set('pagina', pagina).set('tamano', tamano);
    if (idUsuario !== null) params = params.set('idUsuario', idUsuario);
    return this.http.get<Page<RegistroAdministracionDTO>>(`${this.apiURL}/${modulo}`, { params });
  }
  buscar(modulo: string, id: number): Observable<RegistroAdministracionDTO> {
    return this.http.get<RegistroAdministracionDTO>(`${this.apiURL}/${modulo}/${id}`);
  }
  guardar(
    modulo: string,
    id: number | null,
    datos: Record<string, ValorAdministracion>,
  ): Observable<unknown> {
    return id === null
      ? this.http.post(`${this.apiURL}/${modulo}`, datos)
      : this.http.put(`${this.apiURL}/${modulo}/${id}`, datos);
  }
  eliminar(modulo: string, id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${modulo}/${id}`);
  }
  usuarios(): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(`${environment.apiUrl}/usuarios`);
  }
  // Se recorren las páginas de la API: un selector nunca se limita silenciosamente a la primera.
  opciones(modulo: string, idUsuario: number | null): Observable<RegistroAdministracionDTO[]> {
    return this.listar(modulo, idUsuario, 0, 100).pipe(
      expand((page, index) => {
        const total = page.totalPages ?? page.page?.totalPages ?? 1;
        return page.content.length && index + 1 < total
          ? this.listar(modulo, idUsuario, index + 1, 100)
          : EMPTY;
      }, 1),
      reduce((todos, page) => todos.concat(page.content), [] as RegistroAdministracionDTO[]),
    );
  }
}
