import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, startWith, switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Rutinasservice } from '../../../services/rutinasservice';
import { Rutinaejerciciosservice } from '../../../services/rutinaejerciciosservice';
import { Ejerciciosservice } from '../../../services/ejerciciosservice';
import { Loginservice } from '../../../services/loginservice';
import { RutinaDTO } from '../../../models/RutinaDTO';
import { EjercicioDTO } from '../../../models/EjercicioDTO';
import { Page } from '../../../models/Page';
import { RutinaEjercicioDetalleDTO, RutinaEjerciciosDTO } from '../../../models/RutinaEjerciciosDTO';
import { NIVELES, OBJETIVOS } from '../../../models/catalogos';
import { mensajeDeCarga, mensajeDeError } from '../../../utils/errores';
import { Iconoaccioncomponent } from '../../iconoaccioncomponent/iconoaccioncomponent';

@Component({
  selector: 'app-ceditrutinascomponent',
  imports: [Iconoaccioncomponent, MatInputModule, MatSelectModule, MatButtonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './ceditrutinascomponent.html',
  styleUrl: './ceditrutinascomponent.css',
})
export class Ceditrutinascomponent implements OnInit {
  niveles = [...NIVELES];
  objetivos = [...OBJETIVOS];
  formulario: any;
  rutina: RutinaDTO | null = null;
  id = 0;
  mensaje: string = '';
  guardando = false;
  errorCarga = '';
  asignaciones: RutinaEjercicioDetalleDTO[] = [];
  cargandoAsignaciones = false;
  guardandoAsignacion = false;
  eliminandoAsignacion: number | null = null;
  asignacionEditando: RutinaEjercicioDetalleDTO | null = null;
  mensajeAsignaciones = '';
  mensajeBusqueda = '';
  buscandoEjercicios = false;
  sugerenciasAbiertas = false;
  ejercicioSeleccionado: EjercicioDTO | null = null;
  readonly busquedaEjercicio = new FormControl('', { nonNullable: true });
  formularioAsignacion: any;
  private rs = inject(Rutinasservice);
  private readonly rutinaEjerciciosService = inject(Rutinaejerciciosservice);
  private readonly ejerciciosService = inject(Ejerciciosservice);
  private auth = inject(Loginservice);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  ngOnInit(): void {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      objetivo: ['', Validators.required],
      nivel: ['', Validators.required],
    });
    this.formularioAsignacion = this.fb.group({
      series: [null, [Validators.min(1), Validators.pattern(/^\d+$/)]],
      repeticiones: [null, [Validators.min(1), Validators.pattern(/^\d+$/)]],
      descansoSeg: [null, [Validators.min(0), Validators.pattern(/^\d+$/)]],
    });
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.rs.getRutina(this.id).subscribe({
      next: (r) => {
        if (r.idUsuario !== this.auth.getIdUsuario()) {
          this.errorCarga = 'Esta rutina pertenece a otra cuenta.';
          this.cdr.detectChanges();
          return;
        }
        this.rutina = r;
        // si el valor guardado no está en el catálogo, se agrega para no perderlo
        if (r.objetivo && !this.objetivos.includes(r.objetivo)) this.objetivos.push(r.objetivo);
        if (r.nivel && !this.niveles.includes(r.nivel)) this.niveles.push(r.nivel);
        this.formulario.patchValue({ nombre: r.nombre, objetivo: r.objetivo, nivel: r.nivel });
        this.cargarAsignaciones();
        this.conectarBuscadorEjercicios();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorCarga = mensajeDeCarga(err);
        this.cdr.detectChanges();
      },
    });
  }

  private conectarBuscadorEjercicios(): void {
    this.busquedaEjercicio.valueChanges.pipe(
      startWith(this.busquedaEjercicio.value),
      map((valor) => valor.trim()),
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => {
        this.ejercicioSeleccionado = null;
        this.mensajeBusqueda = '';
        this.ejercicios = [];
        this.sugerenciasAbiertas = true;
        this.buscandoEjercicios = true;
      }),
      switchMap((query) => {
        if (!query) return of({ content: [] as EjercicioDTO[], error: '' });
        return this.ejerciciosService.buscarEjercicios('', query, 0, 20).pipe(
          map((page: Page<EjercicioDTO>) => ({ content: page.content ?? [], error: '' })),
          catchError((err) => of({
            content: [] as EjercicioDTO[],
            error: mensajeDeError(err, 'No se pudieron buscar ejercicios.'),
          })),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((resultado) => {
      this.ejercicios = resultado.content;
      this.mensajeBusqueda = resultado.error;
      this.buscandoEjercicios = false;
      this.cdr.detectChanges();
    });
  }

  ejercicios: EjercicioDTO[] = [];

  seleccionarEjercicio(ejercicio: EjercicioDTO): void {
    this.ejercicioSeleccionado = ejercicio;
    this.busquedaEjercicio.setValue(this.etiquetaEjercicio(ejercicio), { emitEvent: false });
    this.sugerenciasAbiertas = false;
    this.mensajeBusqueda = '';
  }

  abrirSugerencias(): void {
    if (!this.busquedaEjercicio.disabled && !this.ejercicioSeleccionado) this.sugerenciasAbiertas = true;
  }

  etiquetaEjercicio(ejercicio: EjercicioDTO): string {
    return `${ejercicio.nombre} · ${ejercicio.grupoMuscular || 'Grupo muscular no indicado'}`;
  }

  cargarAsignaciones(limpiarMensaje = true): void {
    if (!this.rutina) return;
    this.cargandoAsignaciones = true;
    if (limpiarMensaje) this.mensajeAsignaciones = '';
    this.rutinaEjerciciosService.listarPorRutina(this.rutina.idRutina).subscribe({
      next: (asignaciones) => {
        this.asignaciones = asignaciones;
        this.cargandoAsignaciones = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.asignaciones = [];
        this.mensajeAsignaciones = mensajeDeError(err, 'No se pudieron cargar los ejercicios asignados.');
        this.cargandoAsignaciones = false;
        this.cdr.detectChanges();
      },
    });
  }

  guardarAsignacion(): void {
    this.mensajeAsignaciones = '';
    if (this.formularioAsignacion.invalid) {
      this.formularioAsignacion.markAllAsTouched();
      this.mensajeAsignaciones = 'Series y repeticiones deben ser enteros mayores que cero; el descanso no puede ser negativo.';
      return;
    }
    if (!this.rutina) return;
    if (!this.asignacionEditando && (!this.ejercicioSeleccionado || this.ejercicioSeleccionado.idEjercicio <= 0)) {
      this.mensajeAsignaciones = 'Busca y selecciona un ejercicio del catálogo.';
      return;
    }

    const valores = this.formularioAsignacion.getRawValue();
    const valorOpcional = (valor: unknown): number | null => valor === null || valor === '' ? null : Number(valor);
    const asignacion = this.asignacionEditando;
    const dto: RutinaEjerciciosDTO = {
      idRutinaEjercicio: asignacion?.idRutinaEjercicio ?? null,
      idRutina: asignacion?.idRutina ?? this.rutina.idRutina,
      idEjercicio: asignacion?.idEjercicio ?? this.ejercicioSeleccionado!.idEjercicio,
      series: valorOpcional(valores.series),
      repeticiones: valorOpcional(valores.repeticiones),
      descansoSeg: valorOpcional(valores.descansoSeg),
    };

    this.guardandoAsignacion = true;
    const solicitud = asignacion
      ? this.rutinaEjerciciosService.actualizar(asignacion.idRutinaEjercicio, dto)
      : this.rutinaEjerciciosService.insertar(dto);
    solicitud.subscribe({
      next: () => {
        this.guardandoAsignacion = false;
        this.cancelarEdicionAsignacion();
        this.mensajeAsignaciones = asignacion ? 'Asignación actualizada correctamente.' : 'Ejercicio agregado a la rutina.';
        this.cargarAsignaciones(false);
      },
      error: (err) => {
        this.guardandoAsignacion = false;
        this.mensajeAsignaciones = mensajeDeError(err, 'No se pudo guardar la asignación.', 'No se puede guardar la asignación por una restricción de integridad.');
        this.cdr.detectChanges();
      },
    });
  }

  editarAsignacion(asignacion: RutinaEjercicioDetalleDTO): void {
    this.asignacionEditando = asignacion;
    this.ejercicioSeleccionado = {
      idEjercicio: asignacion.idEjercicio,
      nombre: asignacion.nombre,
      grupoMuscular: asignacion.grupoMuscular ?? '',
      tipo: asignacion.tipo ?? '',
      descripcion: asignacion.descripcion ?? '',
    };
    this.busquedaEjercicio.setValue(this.etiquetaEjercicio(this.ejercicioSeleccionado), { emitEvent: false });
    this.busquedaEjercicio.disable();
    this.sugerenciasAbiertas = false;
    this.formularioAsignacion.patchValue({
      series: asignacion.series,
      repeticiones: asignacion.repeticiones,
      descansoSeg: asignacion.descansoSeg,
    });
  }

  cancelarEdicionAsignacion(): void {
    this.asignacionEditando = null;
    this.ejercicioSeleccionado = null;
    this.busquedaEjercicio.enable();
    this.busquedaEjercicio.setValue('');
    this.formularioAsignacion.reset({ series: null, repeticiones: null, descansoSeg: null });
  }

  eliminarAsignacion(asignacion: RutinaEjercicioDetalleDTO): void {
    if (this.eliminandoAsignacion !== null) return;
    if (!confirm(`¿Quitar ${asignacion.nombre} de esta rutina? El ejercicio seguirá disponible en el catálogo.`)) return;
    this.eliminandoAsignacion = asignacion.idRutinaEjercicio;
    this.mensajeAsignaciones = '';
    this.rutinaEjerciciosService.eliminar(asignacion.idRutinaEjercicio).subscribe({
      next: () => {
        this.eliminandoAsignacion = null;
        if (this.asignacionEditando?.idRutinaEjercicio === asignacion.idRutinaEjercicio) this.cancelarEdicionAsignacion();
        this.mensajeAsignaciones = 'Ejercicio retirado de la rutina.';
        this.cargarAsignaciones(false);
      },
      error: (err) => {
        this.eliminandoAsignacion = null;
        this.mensajeAsignaciones = mensajeDeError(err, 'No se pudo quitar el ejercicio de la rutina.', 'No se puede quitar esta asignación porque tiene registros relacionados.');
        this.cdr.detectChanges();
      },
    });
  }

  guardarRutina() {
    if (!this.rutina) return;
    if (this.formulario.invalid) {
      this.mensaje = 'Completa correctamente los campos obligatorios.';
      return;
    }
    const v = this.formulario.value;
    // el PUT reemplaza todos los campos: se manda el objeto completo con lo editado
    const dto: RutinaDTO = { ...this.rutina, nombre: v.nombre.trim(), objetivo: v.objetivo, nivel: v.nivel };
    this.guardando = true;
    this.rs.updateRutina(this.id, dto).subscribe({
      next: () =>
        this.router.navigate(['/rutinas/listar'],
        { state: { mensaje: 'Rutina actualizada correctamente.' } }),
      error: (err) => {
        this.mensaje = mensajeDeError(err, 'No se pudieron guardar los cambios.');
        this.guardando = false;
        this.cdr.detectChanges();
      },
    });
  }
}
