import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { CicloDTO } from '../../../models/CicloDTO';
import { Ciclosservice } from '../../../services/ciclosservice';
import { mensajeDeError } from '../../../utils/errores';

@Component({
  selector: 'app-clistcicloscomponent',
  imports: [MatTableModule, DatePipe],
  templateUrl: './clistcicloscomponent.html',
  styleUrl: './clistcicloscomponent.css',
})
export class Clistcicloscomponent implements OnInit {
  displayedColumns: string[] = ['C1', 'C2', 'C3', 'C4'];
  dataSource: CicloDTO[] = [];
  cargando = false;
  mensaje = '';

  private cs = inject(Ciclosservice);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.obtenerCiclos();
  }

  obtenerCiclos() {
    this.cargando = true;
    this.mensaje = '';
    this.cs.getCiclos().subscribe({
      next: (data) => {
        this.dataSource = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.dataSource = [];
        this.mensaje = mensajeDeError(err, 'No se pudo cargar la lista de ciclos.');
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }
}