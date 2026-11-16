
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { RecomendacionesIADTO } from '../models/RecomendacionesIADTO';
import { Page } from '../models/Page';

@Injectable({
  providedIn: 'root'
})
export class Recomendacionesservice {

  private http = inject(HttpClient);

  private apiURL = `${environment.apiUrl}/recomendaciones`;

  // Consultar recomendaciones de la usuaria
  listar(
    pagina: number = 0,
    tamano: number = 20
  ): Observable<Page<RecomendacionesIADTO>> {

    const params = new HttpParams()
      .set('pagina', pagina)
      .set('tamano', tamano);

    return this.http.get<Page<RecomendacionesIADTO>>(
      this.apiURL,
      { params }
    );
  }

  // Generar recomendación personalizada con Gemini
  generar(): Observable<RecomendacionesIADTO> {

    return this.http.post<RecomendacionesIADTO>(
      `${this.apiURL}/ciclo`,
      { tipo: 'ENTRENAMIENTO' }
    );
  }

  // Aceptar una recomendación
  aceptar(id: number): Observable<RecomendacionesIADTO> {

    return this.http.patch<RecomendacionesIADTO>(
      `${this.apiURL}/${id}/aceptar`,
      null
    );
  }
}
