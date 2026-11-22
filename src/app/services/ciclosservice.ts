import { Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { CicloDTO } from '../models/CicloDTO';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CiclosUsuarioDTO } from '../models/ConsultasDTO';
import { CicloUpdateDTO } from '../models/CicloUpdateDTO';
@Injectable({
  providedIn: 'root',
})
export class Ciclosservice {
  private apiURL = `${environment.apiUrl}/ciclos`;
  private http = inject(HttpClient);

  getCiclos(): Observable<CicloDTO[]> {
    return this.http.get<CicloDTO[]>(this.apiURL);
  }

  insertCiclos(dto: CicloDTO): Observable<CicloDTO> {
    return this.http.post<CicloDTO>(this.apiURL, dto);
  }

  getCiclo(id: number): Observable<CicloDTO> {
    return this.http.get<CicloDTO>(`${this.apiURL}/${id}`);
  }

  updateCiclo(id: number, dto: CicloUpdateDTO): Observable<CicloDTO> {
    return this.http.put<CicloDTO>(`${this.apiURL}/${id}`, dto);
  }

  deleteCiclo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }

  getCiclosUsuario(idUsuario: number): Observable<CicloDTO[]> {
    return this.http.get<CicloDTO[]>(`${this.apiURL}/usuario/${idUsuario}`);
  }
  getDetalleCiclo(id: number): Observable<CiclosUsuarioDTO> {
    return this.http.get<CiclosUsuarioDTO>(`${this.apiURL}/detalle/${id}`);
  }
}
