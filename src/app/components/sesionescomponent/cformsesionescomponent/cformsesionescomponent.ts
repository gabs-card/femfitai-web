import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RutinaDTO } from '../../../models/RutinaDTO';
import { SesionEntrenamientoDTO } from '../../../models/SesionEntrenamientoDTO';
import { Loginservice } from '../../../services/loginservice';
import { Rutinasservice } from '../../../services/rutinasservice';
import { Sesionesservice } from '../../../services/sesionesservice';
import { mensajeDeCarga, mensajeDeError } from '../../../utils/errores';

@Component({
  selector: 'app-cformsesionescomponent',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cformsesionescomponent.html',
  styleUrl: './cformsesionescomponent.css',
})
export class Cformsesionescomponent implements OnInit {
  readonly energia = [1, 2, 3, 4, 5];
  readonly esfuerzos = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  readonly form: any;
  rutinas: RutinaDTO[] = [];
  idSesion: number | null = null;
  cargando = true;
  guardando = false;
  mensaje = '';
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(Loginservice);
  private readonly rutinasService = inject(Rutinasservice);
  private readonly sesionesService = inject(Sesionesservice);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    this.form = this.fb.group({
      idRutina: [null, Validators.required],
      fecha: [this.fechaLocalActual(), Validators.required],
      duracionMin: [null, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
      nivelEnergia: [null, [Validators.required, Validators.min(1), Validators.max(5), Validators.pattern(/^[1-5]$/)]],
      esfuerzoPercibido: [null, [Validators.required, Validators.min(1), Validators.max(10), Validators.pattern(/^(10|[1-9])$/)]],
      estado: ['EN_CURSO', Validators.required],
    });
  }

  get editando(): boolean { return this.idSesion !== null; }

  ngOnInit(): void {
    const idUsuario = this.auth.getIdUsuario();
    this.idSesion = this.route.snapshot.paramMap.has('id') ? Number(this.route.snapshot.paramMap.get('id')) : null;
    if (!idUsuario || (this.idSesion !== null && (!Number.isInteger(this.idSesion) || this.idSesion <= 0))) {
      this.mensaje = 'No se pudo identificar la cuenta o la sesión solicitada.';
      this.cargando = false;
      return;
    }
    this.rutinasService.getRutinasUsuario(idUsuario).subscribe({
      next: (rutinas) => {
        this.rutinas = rutinas.filter((r) => r.idUsuario === idUsuario);
        if (this.idSesion !== null) this.cargarSesion(idUsuario);
        else { this.cargando = false; this.cdr.detectChanges(); }
      },
      error: (err) => {
        this.mensaje = mensajeDeError(err, 'No se pudieron cargar tus rutinas.');
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  private cargarSesion(idUsuario: number): void {
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
      error: (err) => {
        this.mensaje = mensajeDeCarga(err);
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  private cargarSesionPropia(idUsuario: number): void {
    this.sesionesService.obtener(this.idSesion!).subscribe({
      next: (sesion) => {
        if (sesion.idUsuario !== idUsuario) {
          this.mensaje = 'Esta sesión pertenece a otra cuenta.';
        } else if (!this.rutinas.some((r) => r.idRutina === sesion.idRutina)) {
          this.mensaje = 'La rutina asociada no está disponible en tu cuenta.';
        } else {
          this.form.patchValue({
            idRutina: sesion.idRutina,
            fecha: sesion.fecha?.slice(0, 16) ?? '',
            duracionMin: sesion.duracionMin,
            nivelEnergia: sesion.nivelEnergia,
            esfuerzoPercibido: sesion.esfuerzoPercibido,
            estado: (sesion.estado ?? 'EN_CURSO').trim().toUpperCase(),
          });
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mensaje = mensajeDeCarga(err);
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  guardar(): void {
    this.mensaje = '';
    const idUsuario = this.auth.getIdUsuario();
    if (!idUsuario || this.form.invalid) {
      this.form.markAllAsTouched();
      this.mensaje = 'Revisa los campos obligatorios y sus rangos permitidos.';
      return;
    }
    const valores = this.form.getRawValue();
    const rutina = this.rutinas.find((r) => r.idRutina === Number(valores.idRutina));
    if (!rutina || rutina.idUsuario !== idUsuario) {
      this.mensaje = 'Selecciona una rutina propia para asociarla a la sesión.';
      return;
    }
    const fecha = String(valores.fecha ?? '');
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(fecha) || Number.isNaN(new Date(fecha).getTime())) {
      this.mensaje = 'Ingresa una fecha y hora válidas.';
      return;
    }
    const dto: SesionEntrenamientoDTO = {
      idSesion: this.idSesion ?? 0,
      idRutina: rutina.idRutina,
      idUsuario,
      fecha: `${fecha}:00`,
      duracionMin: Number(valores.duracionMin),
       nivelEnergia: Number(valores.nivelEnergia),
      esfuerzoPercibido: Number(valores.esfuerzoPercibido),
      estado: String(valores.estado ?? '').trim().toUpperCase() || null,
    };
    this.guardando = true;
    const solicitud = this.editando
      ? this.sesionesService.actualizar(this.idSesion!, dto)
      : this.sesionesService.insertar(dto);
    solicitud.subscribe({
      next: (sesion) => {
        this.guardando = false;
        if (!this.editando && sesion?.idSesion) {
          this.router.navigate(['/sesiones/detalle', sesion.idSesion]);
        } else {
          this.router.navigate(['/sesiones/listar'], { state: { mensaje: 'Sesión actualizada correctamente.' } });
        }
      },
      error: (err) => {
        this.guardando = false;
        this.mensaje = mensajeDeError(err, 'No se pudo guardar la sesión.');
        this.cdr.detectChanges();
      },
    });
  }

  private fechaLocalActual(): string {
    const ahora = new Date();
    const dos = (n: number) => String(n).padStart(2, '0');
    return `${ahora.getFullYear()}-${dos(ahora.getMonth() + 1)}-${dos(ahora.getDate())}T${dos(ahora.getHours())}:${dos(ahora.getMinutes())}`;
  }
}
