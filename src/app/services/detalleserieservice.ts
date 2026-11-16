import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DetalleSerieDTO } from '../models/DetalleSerieDTO';

@Injectable({ providedIn: 'root' })
export class Detalleserieservice {
  private readonly apiURL = `${environment.apiUrl}/detalle-serie`;
  private readonly http = inject(HttpClient);

  listarPorDetalle(idDetalle: number): Observable<DetalleSerieDTO[]> {
    return this.http.get<DetalleSerieDTO[]>(`${this.apiURL}/detalle/${idDetalle}`);
  }

  insertar(dto: DetalleSerieDTO): Observable<DetalleSerieDTO> {
    return this.http.post<DetalleSerieDTO>(this.apiURL, dto);
  }

  actualizar(id: number, datos: Pick<DetalleSerieDTO, 'repeticiones' | 'pesoKg'>): Observable<DetalleSerieDTO> {
    return this.http.put<DetalleSerieDTO>(`${this.apiURL}/${id}`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }
}
