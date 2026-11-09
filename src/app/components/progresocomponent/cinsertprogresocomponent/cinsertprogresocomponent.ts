import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { Progresoservice } from '../../../services/progresoservice';
import { Authservice } from '../../../services/authservice';
import { ProgresoDTO } from '../../../models/ProgresoDTO';
import { aISO } from '../../../utils/fechas';
import { mensajeDeError } from '../../../utils/errores';

@Component({
  selector: 'app-cinsertprogresocomponent',
  imports: [MatInputModule, MatDatepickerModule, MatButtonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './cinsertprogresocomponent.html',
  styleUrl: './cinsertprogresocomponent.css',
})
export class Cinsertprogresocomponent {
  hoy = new Date();
  formulario: any;
  mensaje: string = '';
  guardando = false;

  private ps = inject(Progresoservice);
  private auth = inject(Authservice);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  constructor() {
    const decimales = /^\d+(\.\d{1,2})?$/;
    this.formulario = this.fb.group({
      fecha: [new Date(), Validators.required],
      peso: [null, [Validators.required, Validators.min(20), Validators.max(400), Validators.pattern(decimales)]],
      medida: [null, [Validators.min(10), Validators.max(300), Validators.pattern(decimales)]],
      nota: ['', Validators.maxLength(255)],
    });
  }

  registrarProgreso(f: FormGroupDirective) {
    if (this.formulario.invalid) {
      this.mensaje = 'Completa correctamente los campos.';
      return;
    }
    const idUsuario = this.auth.idUsuario();
    if (!idUsuario) {
      this.mensaje = 'No se encontró el usuario. Inicia sesión nuevamente.';
      return;
    }
    const v = this.formulario.value;
    const progreso: ProgresoDTO = {
      idProgreso: 0,
      idUsuario: idUsuario,
      fecha: aISO(v.fecha),
      pesoKg: v.peso,
      medidaOpcional: v.medida ?? null,
      notaPersonal: (v.nota ?? '').trim() || null,
    };
    this.guardando = true;
    this.ps.insertProgreso(progreso).subscribe({
      next: () => {
        this.mensaje = 'Progreso registrado correctamente.';
        this.guardando = false;
        f.resetForm({ fecha: new Date() });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mensaje = mensajeDeError(err, 'No se pudo registrar el progreso.');
        this.guardando = false;
        this.cdr.detectChanges();
      },
    });
  }
}