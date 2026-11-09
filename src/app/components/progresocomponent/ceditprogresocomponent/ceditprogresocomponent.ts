import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { Progresoservice } from '../../../services/progresoservice';
import { ProgresoDTO } from '../../../models/ProgresoDTO';
import { aISO, deISO } from '../../../utils/fechas';
import { mensajeDeCarga, mensajeDeError } from '../../../utils/errores';

@Component({
  selector: 'app-ceditprogresocomponent',
  imports: [MatInputModule, MatDatepickerModule, MatButtonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './ceditprogresocomponent.html',
  styleUrl: './ceditprogresocomponent.css',
})
export class Ceditprogresocomponent implements OnInit {
  hoy = new Date();
  formulario: any;
  id = 0;
  idUsuario = 0;
  cargado = false;
  mensaje: string = '';
  guardando = false;
  errorCarga = '';

  private ps = inject(Progresoservice);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  ngOnInit(): void {
    const decimales = /^\d+(\.\d{1,2})?$/;
    this.formulario = this.fb.group({
      fecha: [null, Validators.required],
      peso: [null, [Validators.required, Validators.min(20), Validators.max(400), Validators.pattern(decimales)]],
      medida: [null, [Validators.min(10), Validators.max(300), Validators.pattern(decimales)]],
      nota: ['', Validators.maxLength(255)],
    });
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.ps.getProgresoPorId(this.id).subscribe({
      next: (p) => {
        this.idUsuario = p.idUsuario;
        this.formulario.patchValue({
          fecha: p.fecha ? deISO(p.fecha) : null,
          peso: p.pesoKg,
          medida: p.medidaOpcional,
          nota: p.notaPersonal ?? '',
        });
        this.cargado = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorCarga = mensajeDeCarga(err);;
        this.cdr.detectChanges();
      },
    });
  }

  guardarProgreso() {
    if (this.formulario.invalid) {
      this.mensaje = 'Completa correctamente los campos.';
      return;
    }
    const v = this.formulario.value;
    const progreso: ProgresoDTO = {
      idProgreso: this.id,
      idUsuario: this.idUsuario,
      fecha: aISO(v.fecha),
      pesoKg: v.peso,
      medidaOpcional: v.medida ?? null,
      notaPersonal: (v.nota ?? '').trim() || null,
    };
    this.guardando = true;
    this.ps.updateProgreso(this.id, progreso).subscribe({
      next: () =>
        this.router.navigate(['/progreso/listar'],
        { state: { mensaje: 'Registro actualizado correctamente.' } }),
      error: (err) => {
        this.mensaje = mensajeDeError(err, 'No se pudieron guardar los cambios.');
        this.guardando = false;
        this.cdr.detectChanges();
      },
    });
  }
}