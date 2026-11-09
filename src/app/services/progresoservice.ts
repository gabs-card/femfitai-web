import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProgresoDTO } from '../models/ProgresoDTO';
import { Page } from '../models/Page';

@Injectable({
  providedIn: 'root',
})
export class Progresoservice {
  private apiURL = `${environment.apiUrl}/progreso`;
  private http = inject(HttpClient);

  getProgreso(pagina: number, tamano: number): Observable<Page<ProgresoDTO>> {
    const params = new HttpParams().set('pagina', pagina).set('tamano', tamano);
    return this.http.get<Page<ProgresoDTO>>(this.apiURL, { params });
  }
  insertProgreso(dto: ProgresoDTO): Observable<ProgresoDTO> {
    return this.http.post<ProgresoDTO>(this.apiURL, dto);
  }
  getProgresoPorId(id: number): Observable<ProgresoDTO> {
    return this.http.get<ProgresoDTO>(`${this.apiURL}/${id}`);
  }

  updateProgreso(id: number, dto: ProgresoDTO): Observable<ProgresoDTO> {
    return this.http.put<ProgresoDTO>(`${this.apiURL}/${id}`, dto);
  }
  deleteProgreso(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }
}