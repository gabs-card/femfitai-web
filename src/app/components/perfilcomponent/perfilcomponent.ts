import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PerfilDTO } from '../../models/PerfilDTO';
import { Perfilservice } from '../../services/perfilservice';
import { mensajeDeError } from '../../utils/errores';

@Component({
  selector: 'app-perfilcomponent',
  imports: [DatePipe],
  templateUrl: './perfilcomponent.html',
  styleUrl: './perfilcomponent.css',
})
export class Perfilcomponent implements OnInit {
  perfil: PerfilDTO | null = null;
  cargando = false;
  sinPerfil = false;
  mensaje = '';

  private ps = inject(Perfilservice);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
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
}
