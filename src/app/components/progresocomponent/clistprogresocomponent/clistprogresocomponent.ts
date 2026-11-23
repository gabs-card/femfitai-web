import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { ProgresoDTO } from '../../../models/ProgresoDTO';
import { Progresoservice } from '../../../services/progresoservice';
import { Loginservice } from '../../../services/loginservice';
import { mensajeDeError } from '../../../utils/errores';
import { RouterLink } from '@angular/router';
import { Graficoprogresocomponent } from '../graficoprogresocomponent/graficoprogresocomponent';
import { Iconoaccioncomponent } from '../../iconoaccioncomponent/iconoaccioncomponent';

@Component({
  selector: 'app-clistprogresocomponent',
  imports: [Iconoaccioncomponent, MatTableModule, MatButtonModule, DatePipe, RouterLink, Graficoprogresocomponent],
  templateUrl: './clistprogresocomponent.html',
  styleUrl: './clistprogresocomponent.css',
})
export class Clistprogresocomponent implements OnInit {
  displayedColumns: string[] = ['C1', 'C2', 'C3', 'C4', 'C5'];
  dataSource: ProgresoDTO[] = [];
  pagina = 0;
  totalPaginas = 1;
  cargando = false;
  cargaFallida = false;
  eliminandoId: number | null = null;
  mensaje = '';

  private ps = inject(Progresoservice);
  private auth = inject(Loginservice);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.obtenerProgreso(history.state?.mensaje ?? '');
  }

  obtenerProgreso(mensajeExito = ''): void {
    if (this.cargando || this.eliminandoId !== null) return;
    this.cargando = true;
    this.cargaFallida = false;
    this.mensaje = '';
    this.ps.getProgreso(this.pagina, 10).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.dataSource = data.content ?? [];
        this.totalPaginas = Math.max(data.totalPages ?? data.page?.totalPages ?? 1, 1);
        this.cargando = false;
        this.mensaje = mensajeExito;
        if (this.pagina >= this.totalPaginas) {
          this.pagina = this.totalPaginas - 1;
          this.obtenerProgreso(mensajeExito);
          return;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.dataSource = [];
        this.mensaje = mensajeDeError(err, 'No se pudo cargar tu historial de progreso.');
        this.cargaFallida = true;
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  cambiarPagina(salto: number): void {
    const destino = this.pagina + salto;
    if (this.cargando || this.eliminandoId !== null || !Number.isInteger(destino) || destino < 0 || destino >= this.totalPaginas) return;
    this.pagina = destino;
    this.obtenerProgreso();
  }

  eliminarProgreso(p: ProgresoDTO): void {
    if (this.cargando || this.eliminandoId !== null) return;
    const registro = this.dataSource.find((item) => item.idProgreso === p.idProgreso);
    if (!registro || !Number.isSafeInteger(registro.idProgreso) || registro.idProgreso <= 0 || registro.idUsuario !== this.auth.getIdUsuario()) {
      this.mensaje = 'No se pudo identificar un registro propio para eliminar.';
      return;
    }
    const fecha = (registro.fecha ?? '').split('-').reverse().join('/');
    if (!confirm(`¿Eliminar el registro del ${fecha}?`)) return;
    this.eliminandoId = registro.idProgreso;
    this.mensaje = '';
    this.ps.deleteProgreso(registro.idProgreso).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.eliminandoId = null;
        if (this.dataSource.length === 1 && this.pagina > 0) this.pagina--;
        this.obtenerProgreso('Registro eliminado correctamente.');
      },
      error: (err) => {
        this.eliminandoId = null;
        this.mensaje = mensajeDeError(err, 'No se pudo eliminar el registro.');
        this.cdr.detectChanges();
      },
    });
  }
}
