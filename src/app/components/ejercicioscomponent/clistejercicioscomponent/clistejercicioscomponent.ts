import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime } from 'rxjs';
import { EjercicioDTO } from '../../../models/EjercicioDTO';
import { TIPOS_EJERCICIO } from '../../../models/catalogos';
import { Ejerciciosservice } from '../../../services/ejerciciosservice';
import { mensajeDeError } from '../../../utils/errores';
import { decodificarHtml } from '../../../utils/texto';

@Component({
  selector: 'app-clistejercicioscomponent',
  imports: [MatTableModule, MatButtonModule, MatInputModule, MatSelectModule, ReactiveFormsModule],
  templateUrl: './clistejercicioscomponent.html',
  styleUrl: './clistejercicioscomponent.css',
})
export class Clistejercicioscomponent implements OnInit {
  displayedColumns: string[] = ['C1', 'C2', 'C3', 'C4'];
  dataSource: EjercicioDTO[] = [];
  tipos = TIPOS_EJERCICIO;
  filtros: any;
  pagina = 0;
  totalPaginas = 1;
  cargando = false;
  mensaje = '';

  private es = inject(Ejerciciosservice);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.filtros = this.fb.group({ query: [''], tipo: [''] });
    this.filtros.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.pagina = 0;
      this.obtenerEjercicios();
    });
    this.obtenerEjercicios();
  }

  obtenerEjercicios() {
    this.cargando = true;
    this.mensaje = '';
    const f = this.filtros.value;
    this.es.buscarEjercicios(f.tipo ?? '', (f.query ?? '').trim(), this.pagina, 10).subscribe({
      next: (data) => {
        this.dataSource = data.content;
        this.totalPaginas = Math.max(data.totalPages ?? data.page?.totalPages ?? 1, 1);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.dataSource = [];
        this.mensaje = mensajeDeError(err, 'No se pudo cargar el listado de ejercicios.');
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  cambiarPagina(salto: number) {
    this.pagina += salto;
    this.obtenerEjercicios();
  }

  descripcionCorta(texto: string): string {
    const limpio = decodificarHtml(texto);
    return limpio.length > 60 ? limpio.substring(0, 60) + '…' : limpio || '—';
  }
}