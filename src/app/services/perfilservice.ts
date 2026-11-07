import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PerfilDTO } from '../models/PerfilDTO';
import { PerfilUpdateDTO } from '../models/PerfilUpdateDTO';
import { DisponibilidadDTO } from '../models/DisponibilidadDTO';
@Injectable({
  providedIn: 'root',
})
export class Perfilservice {
  private apiURL = `${environment.apiUrl}/perfiles`;
  private http = inject(HttpClient);

  getPerfil(): Observable<PerfilDTO> {
    return this.http.get<PerfilDTO>(this.apiURL);
  }

    insertPerfil(dto: PerfilDTO): Observable<PerfilDTO> {
    return this.http.post<PerfilDTO>(this.apiURL, dto);
  }

    updatePerfil(dto: PerfilUpdateDTO): Observable<PerfilDTO> {
    return this.http.put<PerfilDTO>(this.apiURL, dto);
  }

  updateDisponibilidad(dto: DisponibilidadDTO): Observable<PerfilDTO> {
    return this.http.patch<PerfilDTO>(`${this.apiURL}/disponibilidad`, dto);
  }
}