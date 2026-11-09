import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { RutinaDTO } from '../../../models/RutinaDTO';
import { Rutinasservice } from '../../../services/rutinasservice';
import { Authservice } from '../../../services/authservice';
import { mensajeDeError } from '../../../utils/errores';

@Component({
  selector: 'app-clistrutinascomponent',
  imports: [MatTableModule, DatePipe],
  templateUrl: './clistrutinascomponent.html',
  styleUrl: './clistrutinascomponent.css',
})
export class Clistrutinascomponent implements OnInit {
  displayedColumns: string[] = ['C1', 'C2', 'C3', 'C4', 'C5'];
  dataSource: RutinaDTO[] = [];
  cargando = false;
  mensaje = '';

  private rs = inject(Rutinasservice);
  private auth = inject(Authservice);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.obtenerRutinas();
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
}