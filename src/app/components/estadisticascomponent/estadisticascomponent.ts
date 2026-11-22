import { Reportescomponent } from '../reportescomponent/reportescomponent';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Sesionesservice } from '../../services/sesionesservice';
import { Rutinasservice } from '../../services/rutinasservice';
import { Progresoservice } from '../../services/progresoservice';
import { Loginservice } from '../../services/loginservice';
import { SesionEntrenamientoDTO } from '../../models/SesionEntrenamientoDTO';
import { RutinaDTO } from '../../models/RutinaDTO';
import { ProgresoDTO } from '../../models/ProgresoDTO';
import { contarPorCategoria } from '../../utils/estadisticas';
import { mensajeDeError } from '../../utils/errores';
import { Graficobarrascomponent } from '../administracioncomponent/graficobarrascomponent/graficobarrascomponent';
import { Graficoprogresocomponent } from '../progresocomponent/graficoprogresocomponent/graficoprogresocomponent';

@Component({
  selector: 'app-estadisticascomponent',
  imports: [
    Reportescomponent,
    DatePipe,
    RouterLink,
    Graficobarrascomponent,
    Graficoprogresocomponent,
  ],
  templateUrl: './estadisticascomponent.html',
  styleUrls: ['../administracioncomponent/administracion.css', './estadisticascomponent.css'],
})
export class Estadisticascomponent implements OnInit {
  private ss = inject(Sesionesservice);
  private rs = inject(Rutinasservice);
  private ps = inject(Progresoservice);
  private auth = inject(Loginservice);
  private destroyRef = inject(DestroyRef);
  private hoy = new Date();
  periodo = signal(`${this.hoy.getFullYear()}-${String(this.hoy.getMonth() + 1).padStart(2, '0')}`);
  sesiones = signal<SesionEntrenamientoDTO[] | null>(null);
  rutinas = signal<RutinaDTO[] | null>(null);
  progreso = signal<ProgresoDTO[] | null>(null);
  errores = signal({ sesiones: '', rutinas: '', progreso: '' });
  cargando = signal(false);
  private pendientes = 0;
  sesionesPeriodo = computed(() =>
    (this.sesiones() ?? []).filter((s) => s.fecha?.slice(0, 7) === this.periodo()),
  );
  minutos = computed(() =>
    this.sesionesPeriodo().reduce(
      (total, s) =>
        total +
        (typeof s.duracionMin === 'number' && Number.isFinite(s.duracionMin) && s.duracionMin >= 0
          ? s.duracionMin
          : 0),
      0,
    ),
  );
  sinDuracion = computed(
    () =>
      this.sesionesPeriodo().filter(
        (s) => s.duracionMin === null || !Number.isFinite(s.duracionMin) || s.duracionMin < 0,
      ).length,
  );
  activas = computed(() => (this.rutinas() ?? []).filter((r) => r.estado === true).length);
  porFecha = computed(() =>
    contarPorCategoria(this.sesionesPeriodo(), (s) => s.fecha?.slice(0, 10)).sort((a, b) =>
      a.etiqueta.localeCompare(b.etiqueta),
    ),
  );
  recientes = computed(() =>
    [...this.sesionesPeriodo()].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5),
  );
  ngOnInit(): void {
    this.cargar();
  }
  private completar(): void {
    this.pendientes--;
    if (this.pendientes === 0) this.cargando.set(false);
  }
  cargar(): void {
    if (this.cargando()) return;
    const id = this.auth.getIdUsuario();
    if (!id) {
      this.errores.set({ sesiones: 'Inicia sesión nuevamente.', rutinas: '', progreso: '' });
      return;
    }
    this.cargando.set(true);
    this.pendientes = 3;
    this.errores.set({ sesiones: '', rutinas: '', progreso: '' });
    this.sesiones.set(null);
    this.rutinas.set(null);
    this.progreso.set(null);
    this.ss
      .listarUsuario(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (datos) => {
          this.sesiones.set(datos);
          this.completar();
        },
        error: (err) => {
          this.errores.update((e) => ({
            ...e,
            sesiones: mensajeDeError(err, 'No se pudieron cargar tus sesiones.'),
          }));
          this.completar();
        },
      });
    this.rs
      .getRutinasUsuario(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (datos) => {
          this.rutinas.set(datos);
          this.completar();
        },
        error: (err) => {
          this.errores.update((e) => ({
            ...e,
            rutinas: mensajeDeError(err, 'No se pudieron cargar tus rutinas.'),
          }));
          this.completar();
        },
      });
    this.ps
      .getProgreso(0, 10)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (datos) => {
          this.progreso.set(datos.content ?? []);
          this.completar();
        },
        error: (err) => {
          this.errores.update((e) => ({
            ...e,
            progreso: mensajeDeError(err, 'No se pudo cargar tu progreso.'),
          }));
          this.completar();
        },
      });
  }
}
