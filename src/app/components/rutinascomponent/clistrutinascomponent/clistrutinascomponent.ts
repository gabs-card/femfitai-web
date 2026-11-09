import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { RutinaDTO } from '../../../models/RutinaDTO';
import { Rutinasservice } from '../../../services/rutinasservice';
import { Authservice } from '../../../services/authservice';
import { mensajeDeError } from '../../../utils/errores';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-clistrutinascomponent',
  imports: [MatTableModule, DatePipe, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './clistrutinascomponent.html',
  styleUrl: './clistrutinascomponent.css',
})
export class Clistrutinascomponent implements OnInit {
  displayedColumns: string[] = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];
  dataSource: RutinaDTO[] = [];
  cargando = false;
  mensaje = '';

  private rs = inject(Rutinasservice);
  private auth = inject(Authservice);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.obtenerRutinas();
    this.mensaje = history.state?.mensaje ?? '';
  }

  obtenerRutinas() {
    const idUsuario = this.auth.idUsuario();
    if (!idUsuario) {
      this.mensaje = 'No se encontró el usuario. Inicia sesión nuevamente.';
      return;
    }
    this.cargando = true;
    this.mensaje = '';
    this.rs.getRutinasUsuario(idUsuario).subscribe({
      next: (data) => {
        this.dataSource = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.dataSource = [];
        this.mensaje = mensajeDeError(err, 'No se pudo cargar tus rutinas.');
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }
  cambiarEstado(r: RutinaDTO) {
    const activar = !r.estado;
    const pregunta = activar
      ? `¿Reactivar la rutina "${r.nombre}"?`
      : `¿Desactivar la rutina "${r.nombre}"? Podrás reactivarla después.`;
    if (!confirm(pregunta)) return;
    this.rs.updateRutina(r.idRutina, { ...r, estado: activar }).subscribe({
      next: () => {
        this.obtenerRutinas();
        this.mensaje = activar ? 'Rutina reactivada correctamente.' : 'Rutina desactivada correctamente.';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mensaje = mensajeDeError(err, 'No se pudo cambiar el estado de la rutina.');
        this.cdr.detectChanges();
      },
    });
  }
}