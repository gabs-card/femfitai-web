import { Injectable, inject } from '@angular/core';
import {
  Observable,
  catchError,
  forkJoin,
  from,
  map,
  mergeMap,
  of,
  switchMap,
  throwError,
  toArray,
} from 'rxjs';
import { Administracionservice } from './administracionservice';
import { Ciclosservice } from './ciclosservice';
import { Detallediariocicloservice } from './detallediariocicloservice';
import { Rutinasservice } from './rutinasservice';
import { Rutinaejerciciosservice } from './rutinaejerciciosservice';
import { Sesionesservice } from './sesionesservice';
import { Detallesesionservice } from './detallesesionservice';
import { Detalleserieservice } from './detalleserieservice';
import { Progresoservice } from './progresoservice';
import { Perfilservice } from './perfilservice';
import { Recomendacionesservice } from './recomendacionesservice';
import { Ejerciciosservice } from './ejerciciosservice';
import { Loginservice } from './loginservice';
import { DatosReporte, RegistroReporte, TipoReporte } from '../models/ReporteDTO';
import { recorrerPaginas } from '../utils/paginacion';

@Injectable({ providedIn: 'root' })
export class Reportesservice {
  private admin = inject(Administracionservice);
  private ciclos = inject(Ciclosservice);
  private diario = inject(Detallediariocicloservice);
  private rutinas = inject(Rutinasservice);
  private asignaciones = inject(Rutinaejerciciosservice);
  private sesiones = inject(Sesionesservice);
  private detalles = inject(Detallesesionservice);
  private series = inject(Detalleserieservice);
  private progreso = inject(Progresoservice);
  private perfiles = inject(Perfilservice);
  private recomendaciones = inject(Recomendacionesservice);
  private ejercicios = inject(Ejerciciosservice);
  private auth = inject(Loginservice);

  private respuesta(
    registros: RegistroReporte[],
    extras: Partial<DatosReporte> = {},
  ): DatosReporte {
    return { registros, referencias: [], referencia: null, grupos: [], detalle: '', ...extras };
  }
  private completos(modulo: string, cuenta: number | null): Observable<RegistroReporte[]> {
    return recorrerPaginas((pagina) => this.admin.listar(modulo, cuenta, pagina, 100)).pipe(
      map((filas) => filas.map((fila) => ({ ...fila.datos, idUsuario: fila.idUsuario }))),
    );
  }
  consultar(
    tipo: TipoReporte,
    administracion: boolean,
    cuenta: number | null,
    referencia: number | null,
    grupo: string,
  ): Observable<DatosReporte> {
    if (tipo === 'catalogo') return this.catalogo(grupo);
    if (administracion) return this.administrativo(tipo, cuenta);
    const id = this.auth.getIdUsuario();
    if (!id) return throwError(() => new Error('Inicia sesión para consultar tus reportes.'));
    switch (tipo) {
      case 'ciclos':
      case 'detalle-diario':
        return this.ciclos.getCiclosUsuario(id).pipe(
          switchMap((ciclos) => {
            const referencias = ciclos.map((c) => ({
              id: c.idCiclo,
              etiqueta: `Ciclo #${c.idCiclo} · ${c.fechaInicio}`,
            }));
            if (referencia !== null && !referencias.some((r) => r.id === referencia))
              throw new Error('El ciclo seleccionado no está disponible.');
            const consulta =
              tipo === 'detalle-diario'
                ? referencia === null
                  ? this.diario.listar()
                  : this.diario.listarPorCiclo(referencia)
                : of(ciclos);
            return forkJoin({
              registros: consulta,
              detalle: referencia === null ? of(null) : this.ciclos.getDetalleCiclo(referencia),
            }).pipe(
              map(({ registros, detalle }) => {
                const filas =
                  tipo === 'ciclos' && detalle
                    ? [{ ...detalle, fechaReal: detalle.fechaFinReal }]
                    : registros.map((r) => ({ ...r }));
                return this.respuesta(filas, {
                  referencias,
                  referencia,
                  detalle: detalle
                    ? `Ciclo #${detalle.idCiclo} · ${detalle.nombres} ${detalle.apellidos}`
                    : '',
                });
              }),
            );
          }),
        );
      case 'rutinas':
      case 'rutina-ejercicios':
        return this.rutinas.getRutinasUsuario(id).pipe(
          switchMap((rutinas) => {
            const referencias = rutinas.map((r) => ({
              id: r.idRutina,
              etiqueta: `${r.nombre} · #${r.idRutina}`,
            }));
            if (referencia !== null && !referencias.some((r) => r.id === referencia))
              throw new Error('La rutina seleccionada no está disponible.');
            if (referencia === null)
              return tipo === 'rutinas'
                ? of(
                    this.respuesta(
                      rutinas.map((r) => ({ ...r })),
                      { referencias },
                    ),
                  )
                : this.ejercicios.listarPorUsuario(id).pipe(
                    map((filas) =>
                      this.respuesta(
                        filas.map((r) => ({ ...r })),
                        { referencias },
                      ),
                    ),
                  );
            return this.rutinas.getDetalleRutina(referencia).pipe(
              switchMap((detalle) => {
                const extras = {
                  referencias,
                  referencia,
                  detalle: `${detalle.nombre} · ${detalle.nombres} ${detalle.apellidos}`,
                };
                return tipo === 'rutinas'
                  ? of(this.respuesta([{ ...detalle }], extras))
                  : this.asignaciones.listarPorRutina(referencia!).pipe(
                      map((filas) =>
                        this.respuesta(
                          filas.map((r) => ({ ...r, nombreEjercicio: r.nombre })),
                          extras,
                        ),
                      ),
                    );
              }),
            );
          }),
        );
      case 'sesiones':
        return this.sesiones
          .listarUsuario(id)
          .pipe(map((filas) => this.respuesta(filas.map((r) => ({ ...r })))));
      case 'detalle-sesion':
      case 'detalle-serie':
        return this.sesiones.listarUsuario(id).pipe(
          switchMap((sesiones) => {
            const referencias = [...sesiones]
              .sort((a, b) => b.fecha.localeCompare(a.fecha))
              .map((s) => ({
                id: s.idSesion,
                etiqueta: `Sesión #${s.idSesion} · ${s.fecha.slice(0, 10)} · ${s.estado}`,
              }));
            const seleccion = referencia ?? referencias[0]?.id ?? null;
            if (seleccion === null) return of(this.respuesta([], { referencias }));
            if (!referencias.some((r) => r.id === seleccion))
              throw new Error('La sesión seleccionada no está disponible.');
            return this.detalles.listarPorSesion(seleccion).pipe(
              switchMap((detalles) => {
                const extras = {
                  referencias,
                  referencia: seleccion,
                  detalle: `Registros de la sesión #${seleccion}.`,
                };
                if (tipo === 'detalle-sesion')
                  return of(
                    this.respuesta(
                      detalles.map((d) => ({ ...d, nombreEjercicio: d.nombre })),
                      extras,
                    ),
                  );
                // Solicitudes limitadas a cuatro simultáneas. Un fallo cancela el total, sin ocultar series.
                return from(detalles).pipe(
                  mergeMap(
                    (d) =>
                      this.series
                        .listarPorDetalle(d.idDetalle!)
                        .pipe(
                          map((series) => series.map((s) => ({ ...s, nombreEjercicio: d.nombre }))),
                        ),
                    4,
                  ),
                  toArray(),
                  map((filas) => this.respuesta(filas.flat(), extras)),
                );
              }),
            );
          }),
        );
      case 'progreso':
        return recorrerPaginas((pagina) => this.progreso.getProgreso(pagina, 100)).pipe(
          map((filas) => this.respuesta(filas.map((r) => ({ ...r })))),
        );
      case 'recomendaciones':
        return recorrerPaginas((pagina) => this.recomendaciones.listar(pagina, 100)).pipe(
          map((filas) => this.respuesta(filas.map((r) => ({ ...r })))),
        );
      case 'perfiles':
        return this.perfiles.getPerfil().pipe(
          map((r) => this.respuesta([{ ...r }])),
          catchError((err) =>
            err.status === 404 ? of(this.respuesta([])) : throwError(() => err),
          ),
        );
    }
  }
  private catalogo(grupo: string): Observable<DatosReporte> {
    return this.ejercicios.listarEjercicios().pipe(
      switchMap((catalogo) => {
        const grupos = [
          ...new Set(catalogo.map((e) => e.grupoMuscular).filter((g): g is string => !!g)),
        ].sort();
        const resultado = grupo ? this.ejercicios.buscarPorGrupoMuscular(grupo) : of(catalogo);
        return resultado.pipe(
          map((filas) =>
            this.respuesta(
              filas.map((r) => ({ ...r })),
              { grupos },
            ),
          ),
        );
      }),
    );
  }
  private administrativo(
    tipo: Exclude<TipoReporte, 'catalogo'>,
    cuenta: number | null,
  ): Observable<DatosReporte> {
    const registros = this.completos(tipo, cuenta);
    if (!['rutina-ejercicios', 'detalle-sesion', 'detalle-serie'].includes(tipo)) {
      return registros.pipe(map((filas) => this.respuesta(filas)));
    }
    return forkJoin({
      filas: registros,
      catalogo: this.ejercicios.listarEjercicios(),
      detalles:
        tipo === 'detalle-serie'
          ? this.completos('detalle-sesion', cuenta)
          : of([] as RegistroReporte[]),
    }).pipe(
      map(({ filas, catalogo, detalles }) => {
        const porEjercicio = new Map(catalogo.map((e) => [e.idEjercicio, e]));
        const porDetalle = new Map(detalles.map((d) => [d['idDetalle'], d]));
        return this.respuesta(
          filas.map((fila) => {
            const idEjercicio =
              tipo === 'detalle-serie'
                ? porDetalle.get(fila['idDetalle'])?.['idEjercicio']
                : fila['idEjercicio'];
            const ejercicio = porEjercicio.get(idEjercicio as number);
            return {
              ...fila,
              nombreEjercicio: ejercicio?.nombre ?? `Ejercicio #${idEjercicio ?? 'sin referencia'}`,
              grupoMuscular: ejercicio?.grupoMuscular ?? null,
            };
          }),
        );
      }),
    );
  }
}
