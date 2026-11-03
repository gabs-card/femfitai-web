
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatButton } from '@angular/material/button';import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Ciclosservice } from '../../../services/ciclosservice';
import { CicloDTO } from '../../../models/CicloDTO';
import { MatFormFieldModule } from '@angular/material/form-field';
@Component({
  selector: 'app-cinsertcicloscomponent',
  imports: [
    MatInputModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatButton,
    ReactiveFormsModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './cinsertcicloscomponent.html',
  styleUrl: './cinsertcicloscomponent.css',
})
export class Cinsertcicloscomponent {

  mensaje: string = '';
  form: any;

  private cs = inject(Ciclosservice);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  ngOnInit() {
    this.form = this.fb.group({
      fechaInicio: [new Date(), Validators.required],
    });
  }

  registrarCiclo() {

    if (this.form.invalid) {
      this.mensaje = 'Los campos son obligatorios';
      return;
    }

    const idUsuarioGuardado = localStorage.getItem('idUsuario');
    const idUsuario = Number(idUsuarioGuardado);

    if (!idUsuarioGuardado || !Number.isInteger(idUsuario) || idUsuario <= 0) {
      this.mensaje = 'No se encontró el usuario. Inicia sesión nuevamente.';
      return;
    }

    const fechaSeleccionada: Date = this.form.value.fechaInicio;

    const fechaInicio = [
      fechaSeleccionada.getFullYear(),
      String(fechaSeleccionada.getMonth() + 1).padStart(2, '0'),
      String(fechaSeleccionada.getDate()).padStart(2, '0')
    ].join('-');

    const ciclo: CicloDTO = {
      idCiclo: 0,
      idUsuario: idUsuario,
      fechaInicio: fechaInicio,
      fechaFinEstimada: null,
      fechaReal: null
    };

    this.cs.insertCiclos(ciclo).subscribe({
      next: (respuesta) => {
        this.mensaje = 'Ciclo registrado correctamente';
        this.cdr.detectChanges();
        this.form.reset();
      },
      error: (err) => {
        console.log('Ocurrió un error al registrar el ciclo', err);
        this.mensaje = err.error?.message || 'No se pudo registrar el ciclo';
        this.cdr.detectChanges();
      },
    });
  }
}
