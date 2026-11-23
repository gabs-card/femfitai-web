import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { CicloDTO } from '../../../models/CicloDTO';
import { Ciclosservice } from '../../../services/ciclosservice';
import { mensajeDeError } from '../../../utils/errores';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Iconoaccioncomponent } from '../../iconoaccioncomponent/iconoaccioncomponent';

@Component({
  selector: 'app-clistcicloscomponent',
  imports: [Iconoaccioncomponent, MatTableModule, DatePipe,RouterLink, MatButtonModule],
  templateUrl: './clistcicloscomponent.html',
  styleUrl: './clistcicloscomponent.css',
})
export class Clistcicloscomponent implements OnInit {
  displayedColumns: string[] = ['C1', 'C2', 'C3', 'C4', 'C5'];
  dataSource: CicloDTO[] = []; // ciclos de la página visible
  todos: CicloDTO[] = []; // todos los ciclos recibidos
  pagina = 0;
  readonly tamano = 5;
  cargando = false;
  mensaje = '';

  private cs = inject(Ciclosservice);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.obtenerCiclos();
    this.mensaje = history.state?.mensaje ?? '';
  }

  obtenerCiclos() {
    this.cargando = true;
    this.mensaje = '';
    this.cs.getCiclos().subscribe({
      next: (data) => {
        this.todos = [...data].sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio));
        this.mostrarPagina();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.todos = [];
        this.mostrarPagina();
        this.mensaje = mensajeDeError(err, 'No se pudo cargar la lista de ciclos.');
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
    }


  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.todos.length / this.tamano));
  }

  private mostrarPagina(): void {
    if (this.pagina >= this.totalPaginas) this.pagina = this.totalPaginas - 1;
    const inicio = this.pagina * this.tamano;
    this.dataSource = this.todos.slice(inicio, inicio + this.tamano);
  }

  cambiarPagina(salto: number): void {
    const destino = this.pagina + salto;
    if (this.cargando || destino < 0 || destino >= this.totalPaginas) return;
    this.pagina = destino;
    this.mostrarPagina();
    this.cdr.detectChanges();
  }

  eliminarCiclo(c: CicloDTO) {
    const inicio = c.fechaInicio.split('-').reverse().join('/');
    if (!confirm(`¿Eliminar el ciclo que inició el ${inicio}?`)) return;
    this.cs.deleteCiclo(c.idCiclo).subscribe({
      next: () => {
        this.obtenerCiclos();
        this.mensaje = 'Ciclo eliminado correctamente.';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mensaje = mensajeDeError(
          err,
          'No se pudo eliminar el ciclo.',
          'No se puede eliminar: el ciclo tiene registros relacionados.',
        );
        this.cdr.detectChanges();
      },
    });
  }
}