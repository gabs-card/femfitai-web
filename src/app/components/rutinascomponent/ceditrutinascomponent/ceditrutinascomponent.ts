import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Rutinasservice } from '../../../services/rutinasservice';
import { Authservice } from '../../../services/authservice';
import { RutinaDTO } from '../../../models/RutinaDTO';
import { NIVELES, OBJETIVOS } from '../../../models/catalogos';
import { mensajeDeCarga, mensajeDeError } from '../../../utils/errores';

@Component({
  selector: 'app-ceditrutinascomponent',
  imports: [MatInputModule, MatSelectModule, MatButtonModule, RouterLink, ReactiveFormsModule],
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
  private rs = inject(Rutinasservice);
  private auth = inject(Authservice);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      objetivo: ['', Validators.required],
      nivel: ['', Validators.required],
    });
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.rs.getRutina(this.id).subscribe({
      next: (r) => {
        if (r.idUsuario !== this.auth.idUsuario()) {
          this.errorCarga = 'Esta rutina pertenece a otra cuenta.';
          this.cdr.detectChanges();
          return;
        }
        this.rutina = r;
        // si el valor guardado no está en el catálogo, se agrega para no perderlo
        if (r.objetivo && !this.objetivos.includes(r.objetivo)) this.objetivos.push(r.objetivo);
        if (r.nivel && !this.niveles.includes(r.nivel)) this.niveles.push(r.nivel);
        this.formulario.patchValue({ nombre: r.nombre, objetivo: r.objetivo, nivel: r.nivel });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorCarga = mensajeDeCarga(err);
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
      next: (data) => {
        this.rutina = data;
        this.mensaje = 'Rutina actualizada correctamente.';
        this.guardando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mensaje = mensajeDeError(err, 'No se pudieron guardar los cambios.');
        this.guardando = false;
        this.cdr.detectChanges();
      },
    });
  }
}