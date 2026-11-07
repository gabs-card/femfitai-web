import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EjercicioDTO } from '../models/EjercicioDTO';
import { Page } from '../models/Page';

@Injectable({
  providedIn: 'root',
})
export class Ejerciciosservice {
  private apiURL = `${environment.apiUrl}/ejercicios`;
  private http = inject(HttpClient);

  getEjercicios(): Observable<EjercicioDTO[]> {
    return this.http.get<EjercicioDTO[]>(this.apiURL);
  }

  buscarEjercicios(tipo: string, query: string, pagina: number, tamano: number): Observable<Page<EjercicioDTO>> {
    let params = new HttpParams().set('pagina', pagina).set('tamano', tamano);
    if (tipo) params = params.set('tipo', tipo);
    if (query) params = params.set('query', query);
    return this.http.get<Page<EjercicioDTO>>(`${this.apiURL}/buscar`, { params });
  }

  getEjercicio(id: number): Observable<EjercicioDTO> {
    return this.http.get<EjercicioDTO>(`${this.apiURL}/${id}`);
  }

  insertEjercicio(dto: EjercicioDTO): Observable<EjercicioDTO> {
    return this.http.post<EjercicioDTO>(this.apiURL, dto);
  }

  updateEjercicio(id: number, dto: EjercicioDTO): Observable<EjercicioDTO> {
    return this.http.put<EjercicioDTO>(`${this.apiURL}/${id}`, dto);
  }

  deleteEjercicio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }
}