import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SesionEntrenamientoDTO } from '../models/SesionEntrenamientoDTO';

@Injectable({ providedIn: 'root' })
export class Sesionesservice {
  private readonly apiURL = `${environment.apiUrl}/sesiones`;
  private readonly http = inject(HttpClient);

  listarUsuario(idUsuario: number): Observable<SesionEntrenamientoDTO[]> {
    return this.http.get<SesionEntrenamientoDTO[]>(`${this.apiURL}/usuario/${idUsuario}`);
  }

  iniciarDesdeRutina(idRutina: number): Observable<SesionEntrenamientoDTO> {
    return this.http.post<SesionEntrenamientoDTO>(`${this.apiURL}/rutina/${idRutina}/iniciar`, null);
  }

  obtener(id: number): Observable<SesionEntrenamientoDTO> {
    return this.http.get<SesionEntrenamientoDTO>(`${this.apiURL}/${id}`);
  }

  obtenerDetalle(id: number): Observable<SesionEntrenamientoDTO> {
    return this.http.get<SesionEntrenamientoDTO>(`${this.apiURL}/detalle/${id}`);
  }

  finalizar(
    id: number,
    datos: Pick<SesionEntrenamientoDTO, 'duracionMin' | 'nivelEnergia' | 'esfuerzoPercibido'>,
  ): Observable<SesionEntrenamientoDTO> {
    return this.http.put<SesionEntrenamientoDTO>(`${this.apiURL}/${id}/finalizar`, datos);
  }

  insertar(dto: SesionEntrenamientoDTO): Observable<SesionEntrenamientoDTO> {
    return this.http.post<SesionEntrenamientoDTO>(this.apiURL, dto);
  }

  actualizar(id: number, dto: SesionEntrenamientoDTO): Observable<SesionEntrenamientoDTO> {
    return this.http.put<SesionEntrenamientoDTO>(`${this.apiURL}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }
}
