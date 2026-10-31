
import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { LoginDTO } from '../models/LoginDTO';
import { LoginResponseDTO } from '../models/LoginResponseDTO';

@Injectable({
    providedIn: 'root'
})
export class Authservice {

    constructor(private http: HttpClient) {}

    token = signal<string | null>(localStorage.getItem('token'));

    rol = signal<string | null>(localStorage.getItem('rol'));

    idUsuario = signal<number | null>(
        Number(localStorage.getItem('idUsuario')) || null
    );

    logueado = computed(() => !!this.token());

    esProgramador = computed(() => this.rol() === 'PROGRAMADOR');

    login(datos: LoginDTO): Observable<LoginResponseDTO> {

        return this.http.post<LoginResponseDTO>(
            `${environment.apiUrl}/login`,
            datos
        ).pipe(
            tap(respuesta => {

                localStorage.setItem('token', respuesta.accessToken);
                localStorage.setItem('rol', respuesta.rol);

                if (respuesta.idUsuario !== undefined) {
                    localStorage.setItem(
                        'idUsuario',
                        String(respuesta.idUsuario)
                    );
                } else {
                    localStorage.removeItem('idUsuario');
                }

                this.token.set(respuesta.accessToken);
                this.rol.set(respuesta.rol);
                this.idUsuario.set(respuesta.idUsuario ?? null);

            })
        );
    }

    logout(): void {

        localStorage.removeItem('token');
        localStorage.removeItem('rol');
        localStorage.removeItem('idUsuario');

        this.token.set(null);
        this.rol.set(null);
        this.idUsuario.set(null);

    }
}
