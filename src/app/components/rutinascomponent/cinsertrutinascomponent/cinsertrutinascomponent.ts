import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Rutinasservice } from '../../../services/rutinasservice';
import { Authservice } from '../../../services/authservice';
import { RutinaDTO } from '../../../models/RutinaDTO';
import { NIVELES, OBJETIVOS } from '../../../models/catalogos';
import { mensajeDeError } from '../../../utils/errores';

@Component({
  selector: 'app-cinsertrutinascomponent',
  imports: [MatInputModule, MatSelectModule, MatButtonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './cinsertrutinascomponent.html',
  styleUrl: './cinsertrutinascomponent.css',
})
export class Cinsertrutinascomponent {
  niveles = NIVELES;
  objetivos = OBJETIVOS;
  formulario: any;
  mensaje: string = '';
  guardando = false;

  private rs = inject(Rutinasservice);
  private auth = inject(Authservice);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  constructor() {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      objetivo: ['', Validators.required],
      nivel: ['', Validators.required],
    });
  }

  registrarRutina() {
    if (this.formulario.invalid) {
      this.mensaje = 'Completa correctamente los campos obligatorios.';
      return;
    }
    const idUsuario = this.auth.idUsuario();
    if (!idUsuario) {
      this.mensaje = 'No se encontró el usuario. Inicia sesión nuevamente.';
      return;
    }
    const v = this.formulario.value;
    const rutina: RutinaDTO = {
      idRutina: 0,
      idUsuario: idUsuario,
      nombre: v.nombre.trim(),
      objetivo: v.objetivo,
      nivel: v.nivel,
      fechaCreacion: null,
      estado: true,
    };
    this.guardando = true;
    this.rs.insertRutina(rutina).subscribe({
      next: () => 
        this.router.navigate(['/rutinas/listar'], 
        { state: { mensaje: 'Rutina registrada correctamente.' } }),
      error: (err) => {
        this.mensaje = mensajeDeError(err, 'No se pudo registrar la rutina.');
        this.guardando = false;
        this.cdr.detectChanges();
      },
    });
  }
}