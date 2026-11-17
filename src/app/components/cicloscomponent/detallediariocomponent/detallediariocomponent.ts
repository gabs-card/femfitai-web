import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Authservice } from '../../../services/authservice';
import { Ciclosservice } from '../../../services/ciclosservice';
import { Detallediariocicloservice } from '../../../services/detallediariocicloservice';
import { DetalleDiarioCicloDTO } from '../../../models/DetalleDiarioCicloDTO';
import { aISO, deISO } from '../../../utils/fechas';
import { mensajeDeCarga, mensajeDeError } from '../../../utils/errores';

@Component({
  selector: 'app-detallediariocomponent',
  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './detallediariocomponent.html',
  styleUrl: './detallediariocomponent.css',
})
export class Detallediariocomponent implements OnInit {
  readonly fases = ['Menstrual', 'Folicular', 'Ovulatoria', 'Lútea'];
  readonly nivelesEnergia = [1, 2, 3, 4, 5];
  readonly hoy = new Date();

  idCiclo = 0;
  fechaInicioCiclo = '';
  detalles: DetalleDiarioCicloDTO[] = [];
  cargando = true;
  cicloValidado = false;
  guardando = false;
  eliminandoId: number | null = null;
  detalleEditando: DetalleDiarioCicloDTO | null = null;
  errorCarga = '';
  mensaje = '';
  form: any;

  private route = inject(ActivatedRoute);
  private ciclos = inject(Ciclosservice);
  private servicio = inject(Detallediariocicloservice);
  private auth = inject(Authservice);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.form = this.fb.group({
      fecha: [new Date(), Validators.required],
      faseRegistrada: [null],
      nivelEnergia: [null, [Validators.required, Validators.min(1), Validators.max(5), Validators.pattern(/^[1-5]$/)]],
      observaciones: ['', Validators.maxLength(255)],
    });

    this.idCiclo = Number(this.route.snapshot.paramMap.get('id'));
    const idUsuario = this.auth.idUsuario();
    if (!Number.isInteger(this.idCiclo) || this.idCiclo <= 0 || !idUsuario) {
      this.errorCarga = 'No se pudo identificar el ciclo o la sesión actual.';
      this.cargando = false;
      return;
    }

    this.ciclos.getCiclo(this.idCiclo).subscribe({
      next: (ciclo) => {
        if (ciclo.idUsuario !== idUsuario) {
          this.errorCarga = 'Este ciclo pertenece a otra cuenta.';
          this.cargando = false;
          this.cdr.detectChanges();
          return;
        }
        this.cicloValidado = true;
        this.fechaInicioCiclo = ciclo.fechaInicio;
        this.cargarDetalles();
      },
      error: (err) => {
        this.errorCarga = mensajeDeCarga(err);
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  cargarDetalles(): void {
    this.cargando = true;
    this.errorCarga = '';
    this.servicio.listarPorCiclo(this.idCiclo).subscribe({
      next: (datos) => {
        this.detalles = datos;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.detalles = [];
        this.errorCarga = mensajeDeError(err, 'No se pudo cargar la bitácora del ciclo.');
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  guardar(): void {
    this.mensaje = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.mensaje = 'Revisa la fecha, el nivel de energía y los demás campos.';
      return;
    }

    const valores = this.form.getRawValue();
    if (!(valores.fecha instanceof Date) || Number.isNaN(valores.fecha.getTime()) || aISO(valores.fecha) > aISO(this.hoy)) {
      this.form.controls.fecha.setErrors({ fechaInvalida: true });
      this.mensaje = 'La fecha debe ser válida y no puede estar en el futuro.';
      return;
    }

    const dto: DetalleDiarioCicloDTO = {
      idDetalleDiarioCiclo: this.detalleEditando?.idDetalleDiarioCiclo ?? null,
      idCiclo: this.idCiclo,
      fecha: aISO(valores.fecha),
      faseRegistrada: valores.faseRegistrada || null,
      nivelEnergia: Number(valores.nivelEnergia),
      observaciones: (valores.observaciones ?? '').trim() || null,
    };

    const estabaEditando = this.detalleEditando !== null;
    this.guardando = true;
    const solicitud = this.detalleEditando
      ? this.servicio.guardar(dto)
      : this.servicio.insertar(dto);
    solicitud.subscribe({
      next: () => {
        this.guardando = false;
        this.cancelarEdicion();
        this.mensaje = estabaEditando
          ? 'Registro diario actualizado correctamente.'
          : 'Registro diario guardado correctamente.';
        this.cargarDetalles();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.guardando = false;
        this.mensaje = mensajeDeError(err, 'No se pudo guardar el registro diario.');
        this.cdr.detectChanges();
      },
    });
  }

  editar(detalle: DetalleDiarioCicloDTO): void {
    this.detalleEditando = detalle;
    this.mensaje = '';
    this.form.patchValue({
      fecha: deISO(detalle.fecha),
      faseRegistrada: detalle.faseRegistrada,
      nivelEnergia: detalle.nivelEnergia,
      observaciones: detalle.observaciones ?? '',
    });
    // El backend resuelve el upsert por usuario y fecha; no se cambia la fecha al editar.
    this.form.controls.fecha.disable();
  }

  cancelarEdicion(): void {
    this.detalleEditando = null;
    this.form.controls.fecha.enable();
    this.form.reset({
      fecha: new Date(),
      faseRegistrada: null,
      nivelEnergia: null,
      observaciones: '',
    });
  }

  eliminar(detalle: DetalleDiarioCicloDTO): void {
    if (!detalle.idDetalleDiarioCiclo || this.eliminandoId !== null) return;
    if (!confirm(`¿Eliminar el registro del ${detalle.fecha.split('-').reverse().join('/')}?`)) return;

    this.eliminandoId = detalle.idDetalleDiarioCiclo;
    this.mensaje = '';
    this.servicio.eliminar(detalle.idDetalleDiarioCiclo).subscribe({
      next: () => {
        this.eliminandoId = null;
        if (this.detalleEditando?.idDetalleDiarioCiclo === detalle.idDetalleDiarioCiclo) {
          this.cancelarEdicion();
        }
        this.mensaje = 'Registro diario eliminado correctamente.';
        this.cargarDetalles();
      },
      error: (err) => {
        this.eliminandoId = null;
        this.mensaje = mensajeDeError(err, 'No se pudo eliminar el registro diario.');
        this.cdr.detectChanges();
      },
    });
  }
}
