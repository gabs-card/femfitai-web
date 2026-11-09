import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { ProgresoDTO } from '../../../models/ProgresoDTO';
import { Progresoservice } from '../../../services/progresoservice';
import { mensajeDeError } from '../../../utils/errores';

@Component({
  selector: 'app-clistprogresocomponent',
  imports: [MatTableModule, MatButtonModule, DatePipe],
  templateUrl: './clistprogresocomponent.html',
  styleUrl: './clistprogresocomponent.css',
})
export class Clistprogresocomponent implements OnInit {
  displayedColumns: string[] = ['C1', 'C2', 'C3', 'C4'];
  dataSource: ProgresoDTO[] = [];
  pagina = 0;
  totalPaginas = 1;
  cargando = false;
  mensaje = '';

  private ps = inject(Progresoservice);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.obtenerProgreso();
  }

  obtenerProgreso() {
    this.cargando = true;
    this.mensaje = '';
    this.ps.getProgreso(this.pagina, 10).subscribe({
      next: (data) => {
        this.dataSource = data.content;
        this.totalPaginas = Math.max(data.totalPages ?? data.page?.totalPages ?? 1, 1);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.dataSource = [];
        this.mensaje = mensajeDeError(err, 'No se pudo cargar tu historial de progreso.');
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  cambiarPagina(salto: number) {
    this.pagina += salto;
    this.obtenerProgreso();
  }
}