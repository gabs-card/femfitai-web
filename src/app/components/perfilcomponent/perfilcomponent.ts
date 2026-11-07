import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PerfilDTO } from '../../models/PerfilDTO';
import { Perfilservice } from '../../services/perfilservice';
import { mensajeDeError } from '../../utils/errores';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { NIVELES, OBJETIVOS } from '../../models/catalogos';
import { Authservice } from '../../services/authservice';
import { aISO } from '../../utils/fechas';
@Component({
  selector: 'app-perfilcomponent',
  imports: [DatePipe, ReactiveFormsModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatButtonModule],  templateUrl: './perfilcomponent.html',
  styleUrl: './perfilcomponent.css',
})
export class Perfilcomponent implements OnInit {
  perfil: PerfilDTO | null = null;
  cargando = false;
  sinPerfil = false;
  mensaje = '';
  niveles = NIVELES;
  objetivos = OBJETIVOS;
  dias = [1, 2, 3, 4, 5, 6, 7];
  hoy = new Date();
  guardando = false;
  form: any;

  private ps = inject(Perfilservice);
  private cdr = inject(ChangeDetectorRef);

  private fb = inject(FormBuilder);
  private auth = inject(Authservice);
  
  ngOnInit(): void {
    this.form = this.fb.group({
      nivel: ['', Validators.required],
      objetivo: ['', Validators.required],
      fechaNacimiento: [null, Validators.required],
      dias: [null, Validators.required],
      tiempo: [null, [Validators.required, Validators.min(10), Validators.max(180), Validators.pattern(/^\d+$/)]],
    });
    this.obtenerPerfil();
  }

  obtenerPerfil() {
    this.cargando = true;
    this.mensaje = '';
    this.sinPerfil = false;
    this.ps.getPerfil().subscribe({
      next: (data) => {
        this.perfil = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.perfil = null;
        if (err.status === 404) {
          this.sinPerfil = true;
        } else {
          this.mensaje = mensajeDeError(err, 'No se pudo cargar tu perfil de entrenamiento.');
        }
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

    registrarPerfil() {
    if (this.form.invalid) {
      this.mensaje = 'Completa correctamente todos los campos.';
      return;
    }
    const idUsuario = this.auth.idUsuario();
    if (!idUsuario) {
      this.mensaje = 'No se encontró el usuario. Inicia sesión nuevamente.';
      return;
    }
    const v = this.form.value;
    const perfil: PerfilDTO = {
      idPerfil: 0,
      idUsuario: idUsuario,
      nivelEntrenamiento: v.nivel,
      objetivoPrincipal: v.objetivo,
      diasDisponibles: v.dias,
      tiempoDisponible: v.tiempo,
      fechaNacimiento: aISO(v.fechaNacimiento),
    };
    this.guardando = true;
    this.ps.insertPerfil(perfil).subscribe({
      next: () => {
        this.guardando = false;
        this.obtenerPerfil();
        this.mensaje = 'Perfil registrado correctamente.';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.guardando = false;
        if (err.status === 409) {
          this.obtenerPerfil();
          this.mensaje = 'Ya tienes un perfil registrado.';
        } else {
          this.mensaje = mensajeDeError(err, 'No se pudo registrar el perfil.');
        }
        this.cdr.detectChanges();
      },
    });
  }
}
