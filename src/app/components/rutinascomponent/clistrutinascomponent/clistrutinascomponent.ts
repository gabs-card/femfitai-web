import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { RutinaDTO } from '../../../models/RutinaDTO';
import { Rutinasservice } from '../../../services/rutinasservice';
import { Loginservice } from '../../../services/loginservice';
import { Sesionesservice } from '../../../services/sesionesservice';
import { mensajeDeError } from '../../../utils/errores';
import { Router, RouterLink } from '@angular/router';
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
  iniciandoRutinaId: number | null = null;
  eliminandoRutinaId: number | null = null;
  cambiandoEstadoId: number | null = null;

  get operacionPendiente(): boolean {
    return this.cargando || this.iniciandoRutinaId !== null || this.eliminandoRutinaId !== null || this.cambiandoEstadoId !== null;
  }

  private rs = inject(Rutinasservice);
  private sesiones = inject(Sesionesservice);
  private router = inject(Router);
  private auth = inject(Loginservice);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.obtenerRutinas();
    this.mensaje = history.state?.mensaje ?? '';
  }

  obtenerRutinas() {
    if (this.operacionPendiente) return;
    const idUsuario = this.auth.getIdUsuario();
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
    if (this.operacionPendiente) return;
    if (r.idUsuario !== this.auth.getIdUsuario()) {
      this.mensaje = 'Esta rutina pertenece a otra cuenta.';
      return;
    }
    const activar = !r.estado;
    const pregunta = activar
      ? `¿Reactivar la rutina "${r.nombre}"?`
      : `¿Desactivar la rutina "${r.nombre}"? Podrás reactivarla después.`;
    if (!confirm(pregunta)) return;
    this.cambiandoEstadoId = r.idRutina;
    this.rs.updateRutina(r.idRutina, { ...r, estado: activar }).subscribe({
      next: () => {
        this.cambiandoEstadoId = null;
        this.obtenerRutinas();
        this.mensaje = activar ? 'Rutina reactivada correctamente.' : 'Rutina desactivada correctamente.';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cambiandoEstadoId = null;
        this.mensaje = mensajeDeError(err, 'No se pudo cambiar el estado de la rutina.');
        this.cdr.detectChanges();
      },
    });
  }

  eliminarRutina(rutina: RutinaDTO): void {
    if (this.operacionPendiente) return;
    const registro = this.dataSource.find((item) => item.idRutina === rutina.idRutina);
    if (!registro || !Number.isSafeInteger(registro.idRutina) || registro.idRutina <= 0 || registro.idUsuario !== this.auth.getIdUsuario()) {
      this.mensaje = 'No se pudo identificar una rutina propia para eliminar.';
      return;
    }
    if (!confirm(`¿Eliminar permanentemente la rutina "${registro.nombre}"? Esta acción no se puede deshacer. Si prefieres conservarla, puedes desactivarla.`)) return;
    this.eliminandoRutinaId = registro.idRutina;
    this.mensaje = '';
    this.rs.deleteRutina(registro.idRutina).subscribe({
      next: () => {
        this.dataSource = this.dataSource.filter((item) => item.idRutina !== registro.idRutina);
        this.eliminandoRutinaId = null;
        this.mensaje = 'Rutina eliminada correctamente.';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.eliminandoRutinaId = null;
        this.mensaje = mensajeDeError(err, 'No se pudo eliminar la rutina.', 'No se puede eliminar esta rutina porque tiene registros relacionados. Puedes desactivarla para conservar su historial.');
        this.cdr.detectChanges();
      },
    });
  }

  iniciarEntrenamiento(rutina: RutinaDTO): void {
    if (!rutina.estado || this.operacionPendiente) return;

    this.iniciandoRutinaId = rutina.idRutina;
    this.mensaje = '';
    this.sesiones.iniciarDesdeRutina(rutina.idRutina).subscribe({
      next: (sesion) => {
        if (!Number.isSafeInteger(sesion?.idSesion) || sesion.idSesion <= 0) {
          this.mensaje = 'El servidor no devolvió un identificador de sesión válido.';
          this.iniciandoRutinaId = null;
          this.cdr.detectChanges();
          return;
        }

        this.router.navigate(['/sesiones/detalle', sesion.idSesion]).then((navegado) => {
          if (!navegado) this.mensaje = 'La sesión se inició, pero no se pudo abrir su detalle.';
          this.iniciandoRutinaId = null;
          this.cdr.detectChanges();
        }).catch((err) => {
          this.mensaje = mensajeDeError(err, 'La sesión se inició, pero no se pudo abrir su detalle.');
          this.iniciandoRutinaId = null;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.mensaje = mensajeDeError(err, 'No se pudo iniciar el entrenamiento.');
        this.iniciandoRutinaId = null;
        this.cdr.detectChanges();
      },
    });
  }
}
