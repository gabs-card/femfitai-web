import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DetalleSesionDTO, DetalleSesionEjercicioDTO } from '../models/DetalleSesionDTO';

@Injectable({ providedIn: 'root' })
export class Detallesesionservice {
  private readonly apiURL = `${environment.apiUrl}/detalle-sesion`;
  private readonly http = inject(HttpClient);

  listarPorSesion(idSesion: number): Observable<DetalleSesionEjercicioDTO[]> {
    return this.http.get<DetalleSesionEjercicioDTO[]>(`${this.apiURL}/sesion/${idSesion}`);
  }

  insertar(dto: DetalleSesionDTO): Observable<DetalleSesionDTO> {
    return this.http.post<DetalleSesionDTO>(this.apiURL, dto);
  }

  actualizarObservacion(id: number, observacion: string | null): Observable<DetalleSesionDTO> {
    return this.http.put<DetalleSesionDTO>(`${this.apiURL}/${id}`, { observacion });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }
}
