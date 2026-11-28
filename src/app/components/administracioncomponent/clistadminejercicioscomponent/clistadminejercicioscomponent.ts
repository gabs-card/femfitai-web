import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  merge,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { Ejerciciosservice } from '../../../services/ejerciciosservice';
import { Loginservice } from '../../../services/loginservice';
import { EjercicioDTO } from '../../../models/EjercicioDTO';
import { TIPOS_EJERCICIO } from '../../../models/catalogos';
import { mensajeDeError } from '../../../utils/errores';
import { decodificarHtml } from '../../../utils/texto';
import { Iconoaccioncomponent } from '../../iconoaccioncomponent/iconoaccioncomponent';
import { Fotoejerciciocomponent } from '../../fotoejerciciocomponent/fotoejerciciocomponent';

@Component({
  selector: 'app-clistadminejercicioscomponent',
  imports: [Fotoejerciciocomponent, Iconoaccioncomponent, RouterLink, ReactiveFormsModule],
  templateUrl: './clistadminejercicioscomponent.html',
  styleUrls: ['../administracion.css', './clistadminejercicioscomponent.css'],
})
export class Clistadminejercicioscomponent implements OnInit {
  private es = inject(Ejerciciosservice);
  private auth = inject(Loginservice);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private recargar = new Subject<void>();
  filtros = this.fb.nonNullable.group({ query: [''], tipo: [''] });
  tipos = TIPOS_EJERCICIO;
  ejercicios: EjercicioDTO[] = [];
  pagina = 0;
  totalPaginas = 1;
  cargando = false;
  sincronizando = false;
  eliminandoId: number | null = null;
  mensaje = '';
  errorCarga = '';
  ngOnInit(): void {
    this.mensaje = history.state?.mensaje ?? '';
    const cambios = this.filtros.valueChanges.pipe(
      debounceTime(300),
      map(() => this.filtros.getRawValue()),
      distinctUntilChanged((a, b) => a.query === b.query && a.tipo === b.tipo),
      map(() => {
        this.pagina = 0;
      }),
    );
    merge(cambios, this.recargar)
      .pipe(
        startWith(undefined),
        switchMap(() => {
          this.cargando = true;
          this.errorCarga = '';
          this.cdr.markForCheck();
          const filtros = this.filtros.getRawValue();
          return this.es.buscarEjercicios(filtros.tipo, filtros.query.trim(), this.pagina, 9).pipe(
            map((page) => ({ page, error: '' })),
            catchError((err) =>
              of({ page: null, error: mensajeDeError(err, 'No se pudo cargar el catálogo.') }),
            ),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ page, error }) => {
        this.cargando = false;
        this.errorCarga = error;
        this.ejercicios = page?.content ?? [];
        this.totalPaginas = Math.max(page?.totalPages ?? page?.page?.totalPages ?? 1, 1);
        if (page && this.pagina >= this.totalPaginas) {
          this.pagina = this.totalPaginas - 1;
          this.recargar.next();
        }
        this.cdr.detectChanges();
      });
  }
  cambiarPagina(salto: number): void {
    const destino = this.pagina + salto;
    if (this.cargando || this.sincronizando || this.eliminandoId !== null || destino < 0 || destino >= this.totalPaginas)
      return;
    this.pagina = destino;
    this.recargar.next();
  }
  volverACargar(): void {
    if (!this.cargando && !this.sincronizando) this.recargar.next();
  }
  sincronizar(): void {
    if (this.cargando || this.sincronizando || this.eliminandoId !== null || !this.auth.hasAnyRole(['ADMIN'])) return;
    if (!confirm('¿Sincronizar el catálogo con wger? Se importarán ejercicios nuevos, se actualizarán sus textos y se completarán las imágenes ausentes. Las imágenes existentes se conservan.')) return;
    this.sincronizando = true;
    this.mensaje = '';
    this.filtros.disable({ emitEvent: false });
    this.es.sincronizarWger().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (resultado) => {
        const imagenes = resultado.imagenesImportadas;
        const detalleImagenes = imagenes === undefined
          ? 'El backend no confirmó la importación de imágenes; comprueba que esté actualizado.'
          : `${imagenes} imágenes incorporadas.`;
        this.mensaje = `${resultado.completo ? 'Sincronización completada' : 'Sincronización parcial'}: ${resultado.insertados} nuevos, ${resultado.actualizados} actualizados y ${resultado.omitidos} sin cambios u omitidos. ${detalleImagenes}${resultado.mensaje ? ' ' + resultado.mensaje : ''}`;
        this.pagina = 0;
        this.finalizarSincronizacion();
      },
      error: (err) => {
        this.mensaje = mensajeDeError(err, 'No se pudo confirmar la sincronización. Revisa el catálogo antes de volver a intentarlo.');
        this.finalizarSincronizacion();
      },
    });
  }
  private finalizarSincronizacion(): void {
    this.sincronizando = false;
    this.filtros.enable({ emitEvent: false });
    this.recargar.next();
    this.cdr.detectChanges();
  }
  descripcion(ejercicio: EjercicioDTO): string {
    const texto = decodificarHtml(ejercicio.descripcion).replace(/<[^>]*>/g, '');
    return texto.length > 160 ? texto.slice(0, 160) + '…' : texto || 'Sin descripción.';
  }
  eliminar(ejercicio: EjercicioDTO): void {
    if (this.cargando || this.sincronizando || this.eliminandoId !== null || !this.auth.hasAnyRole(['ADMIN'])) return;
    if (
      !confirm(
        `¿Eliminar el ejercicio "${ejercicio.nombre}"? No podrá eliminarse si tiene registros relacionados.`,
      )
    )
      return;
    this.eliminandoId = ejercicio.idEjercicio;
    this.mensaje = '';
    this.es
      .deleteEjercicio(ejercicio.idEjercicio)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.eliminandoId = null;
          if (this.ejercicios.length === 1 && this.pagina > 0) this.pagina--;
          this.mensaje = 'Ejercicio eliminado correctamente.';
          this.recargar.next();
        },
        error: (err) => {
          this.eliminandoId = null;
          this.mensaje = mensajeDeError(
            err,
            'No se pudo eliminar el ejercicio.',
            'No se puede eliminar este ejercicio porque tiene rutinas o sesiones relacionadas.',
          );
          this.cdr.detectChanges();
        },
      });
  }
}
