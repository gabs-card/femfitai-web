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
}