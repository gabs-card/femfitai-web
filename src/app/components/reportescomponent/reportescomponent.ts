import { Component, DestroyRef, Input, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, map, of, startWith, switchMap } from 'rxjs';
import { Reportesservice } from '../../services/reportesservice';
import { Administracionservice } from '../../services/administracionservice';
import { DatosReporte, TipoReporte } from '../../models/ReporteDTO';
import { UsuarioDTO } from '../../models/UsuarioDTO';
import { ProgresoDTO } from '../../models/ProgresoDTO';
import { fechaReporte, graficosReporte } from '../../utils/reportes';
import { mensajeDeError } from '../../utils/errores';
import { Graficobarrascomponent } from '../administracioncomponent/graficobarrascomponent/graficobarrascomponent';
import { Graficoprogresocomponent } from '../progresocomponent/graficoprogresocomponent/graficoprogresocomponent';

@Component({
  selector: 'app-reportescomponent',
  imports: [FormsModule, Graficobarrascomponent, Graficoprogresocomponent],
  templateUrl: './reportescomponent.html',
  styleUrl: './reportescomponent.css',
})
export class Reportescomponent implements OnInit {
  @Input() administracion = false;
  private servicio = inject(Reportesservice);
  private admin = inject(Administracionservice);
  private destroyRef = inject(DestroyRef);
  private solicitudes = new Subject<void>();
  tipo: TipoReporte = 'ciclos';
  cuenta: number | null = null;
  referencia: number | null = null;
  grupo = '';
  mes = signal('');
  cargando = signal(false);
  error = signal('');
  errorCuentas = signal('');
  cuentas = signal<UsuarioDTO[]>([]);
  resultado = signal<DatosReporte | null>(null);
  tipos: { clave: TipoReporte; nombre: string }[] = [
    { clave: 'ciclos', nombre: 'Ciclos' },
    { clave: 'detalle-diario', nombre: 'Diario del ciclo' },
    { clave: 'rutinas', nombre: 'Rutinas' },
    { clave: 'rutina-ejercicios', nombre: 'Ejercicios de rutina' },
    { clave: 'sesiones', nombre: 'Sesiones' },
    { clave: 'detalle-sesion', nombre: 'Ejercicios de sesión' },
    { clave: 'detalle-serie', nombre: 'Series realizadas' },
    { clave: 'progreso', nombre: 'Progreso' },
    { clave: 'perfiles', nombre: 'Perfiles' },
    { clave: 'recomendaciones', nombre: 'Recomendaciones' },
    { clave: 'catalogo', nombre: 'Catálogo de ejercicios' },
  ];
  private campoFecha(): string | null {
    return this.tipo === 'ciclos'
      ? 'fechaInicio'
      : this.tipo === 'rutinas'
        ? 'fechaCreacion'
        : ['detalle-diario', 'sesiones', 'progreso', 'recomendaciones'].includes(this.tipo)
          ? 'fecha'
          : null;
  }
  get permiteMes(): boolean {
    return this.campoFecha() !== null;
  }
  filtrados = computed(() => {
    const registros = this.resultado()?.registros ?? [],
      campo = this.campoFecha(),
      mes = this.mes();
    return campo && mes
      ? registros.filter((r) => fechaReporte(r[campo])?.startsWith(mes))
      : registros;
  });
  graficos = computed(() => graficosReporte(this.tipo, this.filtrados()));
  mediciones = computed(() => {
    const registros = this.filtrados();
    return this.tipo === 'progreso' && (!this.administracion || this.cuenta !== null)
      ? (registros as unknown as ProgresoDTO[])
      : [];
  });
  ngOnInit(): void {
    if (this.administracion) this.cargarCuentas();
    this.solicitudes
      .pipe(
        startWith(undefined),
        switchMap(() => {
          this.cargando.set(true);
          this.error.set('');
          this.resultado.set(null);
          return this.servicio
            .consultar(this.tipo, this.administracion, this.cuenta, this.referencia, this.grupo)
            .pipe(
              map((datos) => ({ datos, error: '' })),
              catchError((err) =>
                of({
                  datos: null,
                  error: mensajeDeError(
                    err,
                    'No se pudo cargar el reporte completo. Vuelve a intentar.',
                  ),
                }),
              ),
            );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ datos, error }) => {
        if (datos) this.referencia = datos.referencia;
        this.resultado.set(datos);
        this.error.set(error);
        this.cargando.set(false);
      });
  }
  cargarCuentas(): void {
    this.errorCuentas.set('');
    this.admin
      .usuarios()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (datos) => this.cuentas.set(datos),
        error: (err) =>
          this.errorCuentas.set(
            mensajeDeError(err, 'No se pudieron cargar las cuentas para el filtro.'),
          ),
      });
  }
  cambiarReporte(): void {
    this.referencia = null;
    this.grupo = '';
    this.mes.set('');
    this.cargar();
  }
  cambiarCuenta(): void {
    this.referencia = null;
    this.cargar();
  }
  cargar(): void {
    this.solicitudes.next();
  }
}
