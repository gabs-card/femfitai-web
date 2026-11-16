import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RutinaEjercicioDetalleDTO, RutinaEjerciciosDTO } from '../models/RutinaEjerciciosDTO';

@Injectable({ providedIn: 'root' })
export class Rutinaejerciciosservice {
  private readonly apiURL = `${environment.apiUrl}/rutina-ejercicios`;
  private readonly http = inject(HttpClient);

  listarPorRutina(idRutina: number): Observable<RutinaEjercicioDetalleDTO[]> {
    return this.http.get<RutinaEjercicioDetalleDTO[]>(`${this.apiURL}/rutina/${idRutina}`);
  }

  insertar(dto: RutinaEjerciciosDTO): Observable<RutinaEjerciciosDTO> {
    return this.http.post<RutinaEjerciciosDTO>(this.apiURL, dto);
  }

  actualizar(id: number, dto: RutinaEjerciciosDTO): Observable<RutinaEjerciciosDTO> {
    return this.http.put<RutinaEjerciciosDTO>(`${this.apiURL}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }
}
