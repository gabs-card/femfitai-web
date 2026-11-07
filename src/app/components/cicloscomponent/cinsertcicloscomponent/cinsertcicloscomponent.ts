import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButton } from '@angular/material/button';
import { Ciclosservice } from '../../../services/ciclosservice';
import { Authservice } from '../../../services/authservice';
import { CicloDTO } from '../../../models/CicloDTO';
import { aISO } from '../../../utils/fechas';
import { mensajeDeError } from '../../../utils/errores';

@Component({
  selector: 'app-cinsertcicloscomponent',
  imports: [MatInputModule, MatDatepickerModule, MatButton, ReactiveFormsModule],
  templateUrl: './cinsertcicloscomponent.html',
  styleUrl: './cinsertcicloscomponent.css',
})
export class Cinsertcicloscomponent {
  mensaje: string = '';
  hoy = new Date();
  form: any;

  private cs = inject(Ciclosservice);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private auth = inject(Authservice);

  ngOnInit() {
    this.form = this.fb.group({
      fechaInicio: [new Date(), Validators.required],
    });
  }

  registrarCiclo(f: FormGroupDirective) {
    if (this.form.invalid) {
      this.mensaje = 'Selecciona la fecha de inicio.';
      return;
    }
    const idUsuario = this.auth.idUsuario();
    if (!idUsuario) {
      this.mensaje = 'No se encontró el usuario. Inicia sesión nuevamente.';
      return;
    }
    const ciclo: CicloDTO = {
      idCiclo: 0,
      idUsuario: idUsuario,
      fechaInicio: aISO(this.form.value.fechaInicio),
      fechaFinEstimada: null,
      fechaReal: null,
    };
    this.cs.insertCiclos(ciclo).subscribe({
      next: () => {
        this.mensaje = 'Ciclo registrado correctamente.';
        f.resetForm({ fechaInicio: new Date() });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mensaje = mensajeDeError(err, 'No se pudo registrar el ciclo.', 'Ya tienes un ciclo activo.');
        this.cdr.detectChanges();
      },
    });
  }
}