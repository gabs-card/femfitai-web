import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Ejerciciosservice } from '../../../services/ejerciciosservice';
import { Loginservice } from '../../../services/loginservice';
import { TIPOS_EJERCICIO, GRUPOS_MUSCULARES } from '../../../models/catalogos';
import { mensajeDeCarga, mensajeDeError } from '../../../utils/errores';
import { decodificarHtml } from '../../../utils/texto';

@Component({
  selector: 'app-cformejercicioscomponent',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cformejercicioscomponent.html',
  styleUrl: '../administracion.css',
})
export class Cformejercicioscomponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private es = inject(Ejerciciosservice);
  private auth = inject(Loginservice);
  private cdr = inject(ChangeDetectorRef);
  id: number | null = null;
  cargando = false;
  guardando = false;
  errorCarga = '';
  mensaje = '';
  tipos = [...TIPOS_EJERCICIO];
  grupos = [...GRUPOS_MUSCULARES];
  formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)]],
    grupoMuscular: ['', Validators.maxLength(100)],
    tipo: ['', Validators.maxLength(50)],
    descripcion: [''],
  });
  ngOnInit(): void {
    if (!this.route.snapshot.paramMap.has('id')) return;
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isSafeInteger(this.id) || this.id <= 0) {
      this.errorCarga = 'El identificador no es válido.';
      return;
    }
    this.cargando = true;
    this.es.getEjercicio(this.id).subscribe({
      next: (ejercicio) => {
        if (ejercicio.tipo && !this.tipos.includes(ejercicio.tipo)) this.tipos.push(ejercicio.tipo);
        if (ejercicio.grupoMuscular && !this.grupos.includes(ejercicio.grupoMuscular))
          this.grupos.push(ejercicio.grupoMuscular);
        this.formulario.patchValue({
          nombre: ejercicio.nombre ?? '',
          grupoMuscular: ejercicio.grupoMuscular ?? '',
          tipo: ejercicio.tipo ?? '',
          descripcion: decodificarHtml(ejercicio.descripcion),
        });
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorCarga = mensajeDeCarga(err);
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }
  guardar(): void {
    if (this.guardando || this.cargando || this.errorCarga || !this.auth.hasAnyRole(['ADMIN']))
      return;
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.mensaje = 'Revisa los campos del formulario.';
      return;
    }
    const valores = this.formulario.getRawValue();
    const dto = {
      ...valores,
      idEjercicio: this.id ?? 0,
      nombre: valores.nombre.trim(),
      grupoMuscular: valores.grupoMuscular.trim(),
      tipo: valores.tipo.trim(),
    };
    this.guardando = true;
    this.mensaje = '';
    const solicitud =
      this.id === null ? this.es.insertEjercicio(dto) : this.es.updateEjercicio(this.id, dto);
    solicitud.subscribe({
      next: () =>
        this.router.navigate(['/administracion/ejercicios'], {
          state: {
            mensaje:
              this.id === null
                ? 'Ejercicio creado correctamente.'
                : 'Ejercicio actualizado correctamente.',
          },
        }),
      error: (err) => {
        this.guardando = false;
        this.mensaje = mensajeDeError(err, 'No se pudo guardar el ejercicio.');
        this.cdr.detectChanges();
      },
    });
  }
}
