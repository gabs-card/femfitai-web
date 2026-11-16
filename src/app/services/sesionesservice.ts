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

  obtener(id: number): Observable<SesionEntrenamientoDTO> {
    return this.http.get<SesionEntrenamientoDTO>(`${this.apiURL}/${id}`);
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
