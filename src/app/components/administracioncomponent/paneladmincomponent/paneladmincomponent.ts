import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UsuariosService } from '../../../services/usuariosservices';
import { Ejerciciosservice } from '../../../services/ejerciciosservice';
import { EjercicioDTO } from '../../../models/EjercicioDTO';
import {
  contarPorCategoria,
  ejerciciosPorTipo,
  registrosPorMes,
} from '../../../utils/estadisticas';
import { mensajeDeError } from '../../../utils/errores';
import { Graficobarrascomponent } from '../graficobarrascomponent/graficobarrascomponent';

@Component({
  selector: 'app-paneladmincomponent',
  imports: [RouterLink, DatePipe, Graficobarrascomponent],
  templateUrl: './paneladmincomponent.html',
  styleUrl: '../administracion.css',
})
export class Paneladmincomponent implements OnInit {
  @Input() resumen = false;
  us = inject(UsuariosService);
  private ejerciciosService = inject(Ejerciciosservice);
  ejercicios = signal<EjercicioDTO[] | null>(null);
  cargandoEjercicios = signal(false);
  errorEjercicios = signal('');
  activas = computed(() => this.us.usuarios().filter((u) => u.estado === true).length);
  inactivas = computed(() => this.us.usuarios().filter((u) => u.estado === false).length);
  estados = computed(() =>
    contarPorCategoria(this.us.usuarios(), (u) =>
      u.estado === true ? 'Activas' : u.estado === false ? 'Inactivas' : 'Sin estado',
    ),
  );
  meses = computed(() => registrosPorMes(this.us.usuarios()));
  tipos = computed(() => ejerciciosPorTipo(this.ejercicios() ?? []));
  grupos = computed(() => contarPorCategoria(this.ejercicios() ?? [], (e) => e.grupoMuscular));
  recientes = computed(() =>
    [...this.us.usuarios()]
      .sort((a, b) => (b.fechaRegistro ?? '').localeCompare(a.fechaRegistro ?? ''))
      .slice(0, 4),
  );
  get usuariosDisponibles(): boolean {
    return !this.us.cargando() && !this.us.error();
  }
  ngOnInit(): void {
    this.us.listar();
    this.cargarEjercicios();
  }
  cargarEjercicios(): void {
    if (this.cargandoEjercicios()) return;
    this.cargandoEjercicios.set(true);
    this.errorEjercicios.set('');
    this.ejercicios.set(null);
    this.ejerciciosService.listarEjercicios().subscribe({
      next: (datos) => {
        this.ejercicios.set(datos);
        this.cargandoEjercicios.set(false);
      },
      error: (err) => {
        this.errorEjercicios.set(
          mensajeDeError(err, 'No se pudo cargar el catálogo para las métricas.'),
        );
        this.cargandoEjercicios.set(false);
      },
    });
  }
}
