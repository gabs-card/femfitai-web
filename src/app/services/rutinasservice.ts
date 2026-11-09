import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RutinaDTO } from '../models/RutinaDTO';

@Injectable({
  providedIn: 'root',
})
export class Rutinasservice {
  private apiURL = `${environment.apiUrl}/rutinas`;
  private http = inject(HttpClient);
  getRutinasUsuario(idUsuario: number): Observable<RutinaDTO[]> {
    return this.http.get<RutinaDTO[]>(`${this.apiURL}/usuario/${idUsuario}`);
  }
  insertRutina(dto: RutinaDTO): Observable<RutinaDTO> {
    return this.http.post<RutinaDTO>(this.apiURL, dto);
  }
  getRutina(id: number): Observable<RutinaDTO> {
    return this.http.get<RutinaDTO>(`${this.apiURL}/${id}`);
  }

  updateRutina(id: number, dto: RutinaDTO): Observable<RutinaDTO> {
    return this.http.put<RutinaDTO>(`${this.apiURL}/${id}`, dto);
  }
}