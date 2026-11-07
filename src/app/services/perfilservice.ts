import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PerfilDTO } from '../models/PerfilDTO';

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
}