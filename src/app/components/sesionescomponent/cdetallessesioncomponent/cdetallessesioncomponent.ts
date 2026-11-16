import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, from, of } from 'rxjs';
import { catchError, concatMap, debounceTime, distinctUntilChanged, map, startWith, switchMap, tap, toArray } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EjercicioDTO } from '../../../models/EjercicioDTO';
import { DetalleSesionEjercicioDTO } from '../../../models/DetalleSesionDTO';
import { DetalleSerieDTO } from '../../../models/DetalleSerieDTO';
import { Page } from '../../../models/Page';
import { SesionEntrenamientoDTO } from '../../../models/SesionEntrenamientoDTO';
import { Authservice } from '../../../services/authservice';
import { Detallesesionservice } from '../../../services/detallesesionservice';
import { Detalleserieservice } from '../../../services/detalleserieservice';
import { Ejerciciosservice } from '../../../services/ejerciciosservice';
import { Sesionesservice } from '../../../services/sesionesservice';
import { mensajeDeCarga, mensajeDeError } from '../../../utils/errores';

interface DetalleConSeries extends DetalleSesionEjercicioDTO { series: DetalleSerieDTO[]; }

@Component({
  selector: 'app-cdetallessesioncomponent',
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './cdetallessesioncomponent.html',
  styleUrl: './cdetallessesioncomponent.css',
})
export class Cdetallessesioncomponent implements OnInit {
  idSesion = 0;
  sesion: SesionEntrenamientoDTO | null = null;
  ejercicios: EjercicioDTO[] = [];
  detalles: DetalleConSeries[] = [];
  cargando = true;
  guardandoDetalle = false;
  guardandoSerie = false;
  detalleEditando: number | null = null;
  serieEditando: number | null = null;
  serieParaDetalle: number | null = null;
  eliminandoId: number | null = null;
  mensaje = '';
  mensajeBusqueda = '';
  buscandoEjercicios = false;
  sugerenciasAbiertas = false;
  ejercicioSeleccionado: EjercicioDTO | null = null;
  readonly busquedaEjercicio = new FormControl('', { nonNullable: true });
  ejercicioForm: any;
  serieForm: any;
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(Authservice);
  private readonly sesionesService = inject(Sesionesservice);
  private readonly detallesService = inject(Detallesesionservice);
  private readonly seriesService = inject(Detalleserieservice);
  private readonly ejerciciosService = inject(Ejerciciosservice);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    this.ejercicioForm = this.fb.group({ observacion: ['', Validators.maxLength(255)] });
    this.serieForm = this.fb.group({ numeroSerie: [1, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]], repeticiones: [null, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]], pesoKg: [0, [Validators.required, Validators.min(0), Validators.max(9999.99), Validators.pattern(/^\d{1,4}(\.\d{1,2})?$/)]] });
  }

  ngOnInit(): void {
    this.idSesion = Number(this.route.snapshot.paramMap.get('id'));
    const idUsuario = this.auth.idUsuario();
    if (!idUsuario || !Number.isInteger(this.idSesion) || this.idSesion <= 0) {
      this.mensaje = 'No se pudo identificar la sesiÃ³n o la cuenta.'; this.cargando = false; return;
    }
    this.sesionesService.listarUsuario(idUsuario).subscribe({
      next: (sesiones) => {
        if (!sesiones.some((s) => s.idSesion === this.idSesion && s.idUsuario === idUsuario)) {
          this.mensaje = 'La sesión no aparece entre tus registros.';
          this.cargando = false;
          this.cdr.detectChanges();
          return;
        }
        this.cargarSesionPropia(idUsuario);
      },
      error: (err) => { this.mensaje = mensajeDeCarga(err); this.cargando = false; this.cdr.detectChanges(); },
    });
  }

  private cargarSesionPropia(idUsuario: number): void {
    this.sesionesService.obtener(this.idSesion).subscribe({
      next: (sesion) => {
        if (sesion.idUsuario !== idUsuario) {
          this.mensaje = 'Esta sesiÃ³n pertenece a otra cuenta.'; this.cargando = false; this.cdr.detectChanges(); return;
        }
        this.sesion = sesion;
        this.conectarBusquedaEjercicios();
        this.cargarDetalles();
      },
      error: (err) => { this.mensaje = mensajeDeCarga(err); this.cargando = false; this.cdr.detectChanges(); },
    });
  }

  private conectarBusquedaEjercicios(): void {
    this.busquedaEjercicio.valueChanges.pipe(
      startWith(this.busquedaEjercicio.value),
      map((valor) => valor.trim()),
      debounceTime(300),
      distinctUntilChanged(),
      tap((query) => {
        this.mensajeBusqueda = '';
        this.buscandoEjercicios = true;
        this.sugerenciasAbiertas = true;
        this.ejercicioSeleccionado = null;
        this.ejercicios = [];
      }),
      switchMap((query) => {
        return this.ejerciciosService.buscarEjercicios('', query, 0, 20).pipe(
          catchError((err) => {
            this.mensajeBusqueda = mensajeDeError(err, 'No se pudieron buscar ejercicios.');
            return of(null);
          }),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((pagina: Page<EjercicioDTO> | null) => {
      this.ejercicios = pagina?.content ?? [];
      this.buscandoEjercicios = false;
      this.cdr.detectChanges();
    });
  }

  seleccionarEjercicio(ejercicio: EjercicioDTO): void {
    this.ejercicioSeleccionado = ejercicio;
    this.busquedaEjercicio.setValue(this.etiquetaEjercicio(ejercicio), { emitEvent: false });
    this.sugerenciasAbiertas = false;
    this.mensajeBusqueda = '';
  }

  etiquetaEjercicio(ejercicio: EjercicioDTO): string {
    return `${ejercicio.nombre} · ${ejercicio.grupoMuscular || 'Grupo muscular no indicado'}`;
  }

  cargarDetalles(): void {
    this.detallesService.listarPorSesion(this.idSesion).subscribe({
      next: (detalles) => {
        if (!detalles.length) { this.detalles = []; this.cargando = false; this.cdr.detectChanges(); return; }
        forkJoin(detalles.map((detalle) => this.seriesService.listarPorDetalle(detalle.idDetalle!).pipe(
          switchMap((series) => [{ ...detalle, series } as DetalleConSeries]),
        ))).subscribe({
          next: (filas) => { this.detalles = filas; this.cargando = false; this.cdr.detectChanges(); },
          error: (err) => { this.mensaje = mensajeDeError(err, 'No se pudieron cargar las series.'); this.cargando = false; this.cdr.detectChanges(); },
        });
      },
      error: (err) => { this.mensaje = mensajeDeError(err, 'No se pudieron cargar los ejercicios de la sesiÃ³n.'); this.cargando = false; this.cdr.detectChanges(); },
    });
  }

  guardarDetalle(): void {
    this.mensaje = '';
    if (this.ejercicioForm.invalid) { this.ejercicioForm.markAllAsTouched(); this.mensaje = 'Revisa la observacion.'; return; }
    if (this.detalleEditando === null && (!this.ejercicioSeleccionado || !Number.isInteger(this.ejercicioSeleccionado.idEjercicio) || this.ejercicioSeleccionado.idEjercicio <= 0)) {
      this.mensaje = 'Busca y selecciona un ejercicio de las sugerencias.';
      return;
    }
    const observacion = String(this.ejercicioForm.value.observacion ?? '').trim() || null;
    const estabaEditando = this.detalleEditando !== null;
    this.guardandoDetalle = true;
    const solicitud = this.detalleEditando !== null
      ? this.detallesService.actualizarObservacion(this.detalleEditando, observacion)
      : this.detallesService.insertar({ idDetalle: null, idSesion: this.idSesion, idEjercicio: this.ejercicioSeleccionado!.idEjercicio, observacion });
    solicitud.subscribe({
      next: () => { this.guardandoDetalle = false; this.cancelarEdicionDetalle(); this.mensaje = estabaEditando ? 'ObservaciÃ³n actualizada.' : 'Ejercicio agregado.'; this.cargarDetalles(); },
      error: (err) => { this.guardandoDetalle = false; this.mensaje = mensajeDeError(err, 'No se pudo guardar el ejercicio.'); this.cdr.detectChanges(); },
    });
  }

  editarDetalle(detalle: DetalleConSeries): void {
    this.detalleEditando = detalle.idDetalle;
    this.ejercicioSeleccionado = {
      idEjercicio: detalle.idEjercicio,
      nombre: detalle.nombre,
      grupoMuscular: detalle.grupoMuscular ?? '',
      tipo: '',
      descripcion: '',
    };
    this.busquedaEjercicio.setValue(this.etiquetaEjercicio(this.ejercicioSeleccionado), { emitEvent: false });
    this.busquedaEjercicio.disable();
    this.sugerenciasAbiertas = false;
    this.ejercicioForm.patchValue({ observacion: detalle.observacion ?? '' });
  }

  cancelarEdicionDetalle(): void {
    this.detalleEditando = null;
    this.ejercicioSeleccionado = null;
    this.busquedaEjercicio.enable();
    this.busquedaEjercicio.setValue('');
    this.ejercicioForm.reset({ observacion: '' });
  }

  eliminarDetalle(detalle: DetalleConSeries): void {
    if (this.eliminandoId !== null) return;
    if (!confirm(`Â¿Eliminar ${detalle.nombre} y sus ${detalle.series.length} series?`)) return;
    const idDetalle = detalle.idDetalle!; this.eliminandoId = idDetalle; this.mensaje = '';
    this.seriesService.listarPorDetalle(idDetalle).pipe(
      switchMap((series) => from(series).pipe(concatMap((serie) => this.seriesService.eliminar(serie.idSerie)), toArray())),
      switchMap(() => this.detallesService.eliminar(idDetalle)),
    ).subscribe({
      next: () => { this.eliminandoId = null; if (this.detalleEditando === idDetalle) this.cancelarEdicionDetalle(); this.mensaje = 'Ejercicio y series eliminados.'; this.cargarDetalles(); },
      error: (err) => { this.eliminandoId = null; this.mensaje = mensajeDeError(err, 'No se pudo eliminar el ejercicio y sus series.'); this.cdr.detectChanges(); },
    });
  }

  iniciarSerie(detalle: DetalleConSeries): void {
    this.serieParaDetalle = detalle.idDetalle;
    this.serieEditando = null;
    this.serieForm.reset({ numeroSerie: Math.max(0, ...detalle.series.map((s) => s.numeroSerie)) + 1, repeticiones: null, pesoKg: 0 });
  }

  editarSerie(detalle: DetalleConSeries, serie: DetalleSerieDTO): void {
    this.serieParaDetalle = detalle.idDetalle; this.serieEditando = serie.idSerie;
    this.serieForm.patchValue({ numeroSerie: serie.numeroSerie, repeticiones: serie.repeticiones, pesoKg: serie.pesoKg });
    this.serieForm.controls.numeroSerie.disable();
  }

  cancelarSerie(): void {
    this.serieParaDetalle = null; this.serieEditando = null;
    this.serieForm.controls.numeroSerie.enable();
    this.serieForm.reset({ numeroSerie: 1, repeticiones: null, pesoKg: 0 });
  }

  guardarSerie(): void {
    this.mensaje = '';
    if (this.serieForm.invalid || this.serieParaDetalle === null) { this.serieForm.markAllAsTouched(); this.mensaje = 'Indica nÃºmero de serie, repeticiones y un peso vÃ¡lido.'; return; }
    const valor = this.serieForm.getRawValue();
    const dto: DetalleSerieDTO = { idSerie: this.serieEditando ?? 0, idDetalle: this.serieParaDetalle, numeroSerie: Number(valor.numeroSerie), repeticiones: Number(valor.repeticiones), pesoKg: Number(valor.pesoKg) };
    this.guardandoSerie = true;
    const solicitud = this.serieEditando !== null
      ? this.seriesService.actualizar(this.serieEditando, { repeticiones: dto.repeticiones, pesoKg: dto.pesoKg })
      : this.seriesService.insertar(dto);
    solicitud.subscribe({
      next: () => { this.guardandoSerie = false; this.cancelarSerie(); this.mensaje = 'Serie guardada correctamente.'; this.cargarDetalles(); },
      error: (err) => { this.guardandoSerie = false; this.mensaje = mensajeDeError(err, 'No se pudo guardar la serie. Comprueba que su nÃºmero no estÃ© repetido.'); this.cdr.detectChanges(); },
    });
  }

  eliminarSerie(serie: DetalleSerieDTO): void {
    if (!confirm(`Â¿Eliminar la serie ${serie.numeroSerie}?`)) return;
    this.seriesService.eliminar(serie.idSerie).subscribe({
      next: () => { this.mensaje = 'Serie eliminada correctamente.'; this.cargarDetalles(); },
      error: (err) => { this.mensaje = mensajeDeError(err, 'No se pudo eliminar la serie.'); this.cdr.detectChanges(); },
    });
  }
}
