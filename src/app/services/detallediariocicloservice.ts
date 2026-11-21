import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
// Consultas propias utilizadas por los reportes.
import { DetalleDiarioCicloDTO } from '../models/DetalleDiarioCicloDTO';

@Injectable({
  providedIn: 'root',
})
export class Detallediariocicloservice {
  private apiURL = `${environment.apiUrl}/detalle-diario`;
  private http = inject(HttpClient);

  listarPorCiclo(idCiclo: number): Observable<DetalleDiarioCicloDTO[]> {
    return this.http.get<DetalleDiarioCicloDTO[]>(`${this.apiURL}/ciclo/${idCiclo}`);
  }

  insertar(dto: DetalleDiarioCicloDTO): Observable<DetalleDiarioCicloDTO> {
    return this.http.post<DetalleDiarioCicloDTO>(this.apiURL, dto);
  }

  guardar(dto: DetalleDiarioCicloDTO): Observable<DetalleDiarioCicloDTO> {
    return this.http.put<DetalleDiarioCicloDTO>(this.apiURL, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }

  listar(): Observable<DetalleDiarioCicloDTO[]> {
    return this.http.get<DetalleDiarioCicloDTO[]>(this.apiURL);
  }
}
