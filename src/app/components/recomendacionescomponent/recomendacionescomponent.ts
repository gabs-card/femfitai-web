
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { DatePipe } from '@angular/common';

import { Recomendacionesservice } from '../../services/recomendacionesservice';
import { RecomendacionesIADTO } from '../../models/RecomendacionesIADTO';
import { mensajeDeError } from '../../utils/errores';

@Component({
  selector: 'app-recomendacionescomponent',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './recomendacionescomponent.html',
  styleUrl: './recomendacionescomponent.css'
})
export class Recomendacionescomponent implements OnInit {

  recomendaciones: RecomendacionesIADTO[] = [];

  cargando = false;
  generando = false;

  aceptandoId: number | null = null;

  pagina = 0;
  tamano = 10;
  totalPaginas = 0;

  mensaje = '';
  mensajeError = '';

  private servicio = inject(Recomendacionesservice);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.listarRecomendaciones();
  }

  // Consultar recomendaciones anteriores
  listarRecomendaciones(pagina: number = 0): void {

    this.cargando = true;
    this.mensajeError = '';

    this.servicio.listar(pagina, this.tamano).subscribe({

      next: (respuesta) => {

        this.recomendaciones = respuesta.content ?? [];
        this.pagina = respuesta.number ?? pagina;
        this.totalPaginas = respuesta.totalPages ?? 0;

        this.cargando = false;
        this.cdr.markForCheck();
      },

      error: (err) => {

        this.mensajeError = mensajeDeError(
          err,
          'No se pudieron cargar tus recomendaciones.'
        );

        this.cargando = false;
        this.cdr.markForCheck();
      }

    });
  }

  // Generar una nueva recomendación mediante Gemini
  generarRecomendacion(): void {

    if (this.generando || this.cargando) {
      return;
    }

    this.generando = true;
    this.mensaje = '';
    this.mensajeError = '';

    this.servicio.generar().subscribe({

      next: (respuesta) => {

        // Mostrar la nueva recomendación inmediatamente
        this.recomendaciones = [
          respuesta,
          ...this.recomendaciones.filter(
            r => r.idRecomendacion !== respuesta.idRecomendacion
          )
        ];

        this.mensaje = '¡Tu recomendación personalizada está lista! 💗';

        this.generando = false;
        this.cdr.markForCheck();
      },

      error: (err) => {

        this.mensajeError = mensajeDeError(
          err,
          err.status === 503
            ? 'El asistente está ocupado. Inténtalo nuevamente.'
            : 'No se pudo generar la recomendación.'
        );

        this.generando = false;
        this.cdr.markForCheck();
      }

    });
  }

  // Aceptar una recomendación
  aceptarRecomendacion(id: number): void {

    if (this.aceptandoId !== null) {
      return;
    }

    this.aceptandoId = id;
    this.mensajeError = '';

    this.servicio.aceptar(id).subscribe({

      next: (respuesta) => {

        this.recomendaciones = this.recomendaciones.map(r =>
          r.idRecomendacion === id ? respuesta : r
        );

        this.mensaje = '¡Recomendación aceptada correctamente!';

        this.aceptandoId = null;
        this.cdr.markForCheck();
      },

      error: (err) => {

        this.mensajeError = mensajeDeError(
          err,
          'No se pudo aceptar la recomendación.'
        );

        this.aceptandoId = null;
        this.cdr.markForCheck();
      }

    });
  }

  // Mostrar contenido generado sin los marcadores Markdown
  limpiarContenido(contenido: string): string {
    return (contenido ?? '').replace(/\*\*/g, '');
  }

  anterior(): void {
    if (this.pagina > 0 && !this.cargando) {
      this.listarRecomendaciones(this.pagina - 1);
    }
  }

  siguiente(): void {
    if (this.pagina + 1 < this.totalPaginas && !this.cargando) {
      this.listarRecomendaciones(this.pagina + 1);
    }
  }
}

