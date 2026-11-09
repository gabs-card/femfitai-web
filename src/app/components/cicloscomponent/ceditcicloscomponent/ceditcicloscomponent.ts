import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { Ciclosservice } from '../../../services/ciclosservice';
import { CicloUpdateDTO } from '../../../models/CicloUpdateDTO';
import { aISO, deISO } from '../../../utils/fechas';
import { mensajeDeCarga, mensajeDeError } from '../../../utils/errores';

@Component({
  selector: 'app-ceditcicloscomponent',
  imports: [MatInputModule, MatDatepickerModule, MatButtonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './ceditcicloscomponent.html',
  styleUrl: './ceditcicloscomponent.css',
})
export class Ceditcicloscomponent implements OnInit {
  form: any;
  id = 0;
  idUsuario = 0;
  hoy = new Date();
  mensaje: string = '';
  guardando = false;
  cargado = false;
  errorCarga = '';

  private cs = inject(Ciclosservice);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  ngOnInit(): void {
    this.form = this.fb.group({
      fechaInicio: [null, Validators.required],
      fechaReal: [null],
    });
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.cs.getCiclo(this.id).subscribe({
      next: (c) => {
        
        this.idUsuario = c.idUsuario;
        this.form.patchValue({
          fechaInicio: deISO(c.fechaInicio),
          fechaReal: c.fechaReal ? deISO(c.fechaReal) : null,
        });
        this.cargado = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorCarga = mensajeDeCarga(err);
        this.cdr.detectChanges();
      },
    });
  }

  guardarCiclo() {
    if (this.form.invalid) {
      this.mensaje = 'Selecciona la fecha de inicio.';
      return;
    }
    const v = this.form.value;
    if (v.fechaReal && v.fechaReal < v.fechaInicio) {
      this.mensaje = 'La fecha de fin real no puede ser anterior a la de inicio.';
      return;
    }
    const dto: CicloUpdateDTO = {
      idUsuario: this.idUsuario,
      fechaInicio: aISO(v.fechaInicio),
      fechaReal: v.fechaReal ? aISO(v.fechaReal) : null,
    };
    this.guardando = true;
    this.cs.updateCiclo(this.id, dto).subscribe({
      next: () => 
        this.router.navigate(['/ciclos/listar'],
        { state: { mensaje: 'Ciclo actualizado correctamente.' } }),
      error: (err) => {
        this.mensaje = mensajeDeError(err, 'No se pudieron guardar los cambios.', 'Ya tienes otro ciclo activo.');
        this.guardando = false;
        this.cdr.detectChanges();
      },
    });
  }
}