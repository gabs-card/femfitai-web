import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { from } from 'rxjs';
import { concatMap, switchMap, toArray } from 'rxjs/operators';
import { RutinaDTO } from '../../../models/RutinaDTO';
import { SesionEntrenamientoDTO } from '../../../models/SesionEntrenamientoDTO';
import { Detallesesionservice } from '../../../services/detallesesionservice';
import { Detalleserieservice } from '../../../services/detalleserieservice';
import { Authservice } from '../../../services/loginservice';
import { Rutinasservice } from '../../../services/rutinasservice';
import { Sesionesservice } from '../../../services/sesionesservice';
import { mensajeDeError } from '../../../utils/errores';

@Component({
  selector: 'app-clistsesionescomponent',
  imports: [DatePipe, RouterLink],
  templateUrl: './clistsesionescomponent.html',
  styleUrl: './clistsesionescomponent.css',
})
export class Clistsesionescomponent implements OnInit {
  sesiones: SesionEntrenamientoDTO[] = [];
  rutinas: RutinaDTO[] = [];
  cargando = true;
  eliminando = false;
  mensaje = '';
  private readonly auth = inject(Authservice);
  private readonly sesionesService = inject(Sesionesservice);
  private readonly rutinasService = inject(Rutinasservice);
  private readonly detallesService = inject(Detallesesionservice);
  private readonly seriesService = inject(Detalleserieservice);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const mensaje = history.state?.mensaje ?? '';
    this.cargar();
    this.mensaje = mensaje;
  }

  nombreRutina(idRutina: number): string {
    return this.rutinas.find((r) => r.idRutina === idRutina)?.nombre ?? `Rutina #${idRutina}`;
  }

  cargar(): void {
    const idUsuario = this.auth.idUsuario();
    if (!idUsuario) {
      this.mensaje = 'No se pudo identificar la cuenta. Inicia sesiÃ³n nuevamente.';
      this.cargando = false;
      return;
    }
    this.cargando = true;
    this.mensaje = '';
    this.rutinasService.getRutinasUsuario(idUsuario).pipe(
      switchMap((rutinas) => {
        this.rutinas = rutinas;
        return this.sesionesService.listarUsuario(idUsuario);
      }),
    ).subscribe({
      next: (sesiones) => {
        this.sesiones = sesiones.filter((s) => s.idUsuario === idUsuario)
          .sort((a, b) => b.fecha.localeCompare(a.fecha));
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.sesiones = [];
        this.mensaje = mensajeDeError(err, 'No se pudieron cargar tus sesiones.');
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  eliminar(sesion: SesionEntrenamientoDTO): void {
    if (this.eliminando || sesion.idUsuario !== this.auth.idUsuario()) return;
    if (!confirm('Â¿Eliminar esta sesiÃ³n, sus ejercicios y todas las series registradas?')) return;
    this.eliminando = true;
    this.mensaje = '';
    this.detallesService.listarPorSesion(sesion.idSesion).pipe(
      switchMap((detalles) => from(detalles).pipe(
        concatMap((detalle) => this.seriesService.listarPorDetalle(detalle.idDetalle!).pipe(
          switchMap((series) => from(series).pipe(
            concatMap((serie) => this.seriesService.eliminar(serie.idSerie)),
            toArray(),
          )),
          switchMap(() => this.detallesService.eliminar(detalle.idDetalle!)),
        )),
        toArray(),
      )),
      switchMap(() => this.sesionesService.eliminar(sesion.idSesion)),
    ).subscribe({
      next: () => {
        this.eliminando = false;
        this.mensaje = 'SesiÃ³n y sus ejercicios eliminados correctamente.';
        this.cargar();
      },
      error: (err) => {
        this.eliminando = false;
        this.mensaje = mensajeDeError(err, 'No se pudo completar la eliminaciÃ³n. Si fallÃ³ a mitad, revisa la sesiÃ³n y vuelve a intentarlo.');
        this.cdr.detectChanges();
      },
    });
  }
}
