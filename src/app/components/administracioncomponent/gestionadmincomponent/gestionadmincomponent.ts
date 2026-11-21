import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, forkJoin, map, of, switchMap, takeUntil } from 'rxjs';
import { Administracionservice } from '../../../services/administracionservice';
import { Ejerciciosservice } from '../../../services/ejerciciosservice';
import { Loginservice } from '../../../services/loginservice';
import {
  RegistroAdministracionDTO,
  ValorAdministracion,
} from '../../../models/RegistroAdministracionDTO';
import { UsuarioDTO } from '../../../models/UsuarioDTO';
import { mensajeDeError } from '../../../utils/errores';
import {
  CampoAdministracion,
  ModuloAdministracion,
  MODULOS_ADMINISTRACION,
} from './modulos-administracion';

interface OpcionAdministracion {
  valor: number | string;
  etiqueta: string;
  idUsuario?: number;
}

@Component({
  selector: 'app-gestionadmincomponent',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './gestionadmincomponent.html',
  styleUrls: ['../administracion.css', './gestionadmincomponent.css'],
})
export class Gestionadmincomponent implements OnInit {
  private admin = inject(Administracionservice);
  private ejercicios = inject(Ejerciciosservice);
  private auth = inject(Loginservice);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private recargar = new Subject<void>();
  private cancelarEditor = new Subject<void>();
  modulo: ModuloAdministracion | null = null;
  filtroUsuario = new FormControl('', { nonNullable: true });
  formulario = new FormGroup<Record<string, FormControl<ValorAdministracion>>>({});
  usuarios: UsuarioDTO[] = [];
  registros: RegistroAdministracionDTO[] = [];
  opciones: Record<string, OpcionAdministracion[]> = {};
  pagina = 0;
  totalPaginas = 1;
  totalRegistros = 0;
  cargando = false;
  cargandoOpciones = false;
  cargandoDetalle = false;
  guardando = false;
  eliminandoId: number | null = null;
  editorAbierto = false;
  idEdicion: number | null = null;
  detalle: RegistroAdministracionDTO | null = null;
  errorCarga = '';
  errorUsuarios = '';
  errorOpciones = '';
  mensaje = '';
  mensajeEditor = '';
  hoy = [
    new Date().getFullYear(),
    String(new Date().getMonth() + 1).padStart(2, '0'),
    String(new Date().getDate()).padStart(2, '0'),
  ].join('-');

  ngOnInit(): void {
    this.admin
      .usuarios()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (usuarios) => {
          this.usuarios = usuarios;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorUsuarios = mensajeDeError(err, 'No se pudieron cargar las cuentas.');
          this.cdr.detectChanges();
        },
      });
    this.recargar
      .pipe(
        switchMap(() => {
          this.cargando = true;
          this.errorCarga = '';
          this.cdr.markForCheck();
          return this.admin.listar(this.modulo!.clave, this.idUsuarioFiltro(), this.pagina).pipe(
            map((page) => ({ page, error: '' })),
            catchError((err) =>
              of({
                page: null,
                error:
                  err.status === 404
                    ? 'El backend no tiene disponible este módulo administrativo. Reinicia Spring Boot con los cambios del Centro de gestión.'
                    : mensajeDeError(err, 'No se pudieron cargar los registros.'),
              }),
            ),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ page, error }) => {
        this.cargando = false;
        this.errorCarga = error;
        this.registros = page?.content ?? [];
        this.totalPaginas = Math.max(1, page?.totalPages ?? page?.page?.totalPages ?? 1);
        this.totalRegistros = page?.totalElements ?? page?.page?.totalElements ?? 0;
        if (page && this.pagina >= this.totalPaginas) {
          this.pagina = this.totalPaginas - 1;
          this.recargar.next();
        }
        this.cdr.detectChanges();
      });
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.cancelarEditor.next();
      this.editorAbierto = false;
      this.detalle = null;
      this.cargandoDetalle = false;
      this.modulo = MODULOS_ADMINISTRACION.find((m) => m.clave === params.get('modulo')) ?? null;
      this.pagina = 0;
      this.mensaje = '';
      this.registros = [];
      this.guardando = false;
      this.eliminandoId = null;
      this.filtroUsuario.enable({ emitEvent: false });
      if (this.modulo) this.recargar.next();
      this.cdr.markForCheck();
    });
    this.filtroUsuario.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.cerrarEditor();
      this.detalle = null;
      this.pagina = 0;
      if (this.modulo) this.recargar.next();
    });
  }
  idUsuarioFiltro(): number | null {
    return this.filtroUsuario.value ? Number(this.filtroUsuario.value) : null;
  }
  id(registro: RegistroAdministracionDTO): number {
    return Number(registro.datos[this.modulo!.id]);
  }
  nombreUsuario(id: number): string {
    const u = this.usuarios.find((v) => v.idUsuario === id);
    return u ? `${u.nombres} ${u.apellidos} · ${u.correo}` : `Cuenta #${id}`;
  }
  mostrar(valor: ValorAdministracion | undefined): string {
    if (valor === null || valor === undefined || valor === '') return 'Sin registrar';
    if (typeof valor === 'boolean') return valor ? 'Sí' : 'No';
    return String(valor).replace(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}).*$/, '$1 $2');
  }
  cambiarPagina(salto: number): void {
    if (this.cargando || this.guardando || this.eliminandoId !== null) return;
    const destino = this.pagina + salto;
    if (destino < 0 || destino >= this.totalPaginas) return;
    this.pagina = destino;
    this.recargar.next();
  }
  volverACargar(): void {
    if (this.modulo && !this.cargando) this.recargar.next();
  }
  camposVisibles(): CampoAdministracion[] {
    return this.modulo?.campos.filter((c) => this.idEdicion !== null || !c.soloEditar) ?? [];
  }
  camposDetalle(): { clave: string; etiqueta: string }[] {
    const campos = [...(this.modulo?.columnas ?? []), ...(this.modulo?.campos ?? [])];
    return campos.filter(
      (campo, i) =>
        campo.clave !== 'idUsuario' && campos.findIndex((otro) => otro.clave === campo.clave) === i,
    );
  }
  opcionesCampo(campo: CampoAdministracion): OpcionAdministracion[] {
    const opciones = this.opciones[campo.clave] ?? [];
    if (campo.clave !== 'idRutina' || this.modulo?.clave !== 'recomendaciones') return opciones;
    const usuario = Number(this.formulario.controls['idUsuario']?.value);
    return usuario ? opciones.filter((o) => o.idUsuario === usuario) : opciones;
  }
  private construirFormulario(registro?: RegistroAdministracionDTO): void {
    const controls: Record<string, FormControl<ValorAdministracion>> = {};
    for (const campo of this.camposVisibles()) {
      let valor = registro?.datos[campo.clave];
      if (valor === undefined || valor === null) {
        valor =
          campo.tipo === 'checkbox'
            ? campo.clave === 'estado'
            : campo.tipo === 'number'
              ? null
              : '';
        if (campo.clave === 'idUsuario' && this.idUsuarioFiltro() !== null)
          valor = this.idUsuarioFiltro();
        if (campo.clave === 'fecha') valor = this.hoy;
        if (campo.clave === 'tipo' && this.modulo?.clave === 'recomendaciones')
          valor = 'Administrativa';
      }
      const validadores = [];
      if (campo.requerido) validadores.push(Validators.required);
      if (campo.tipo === 'text' && campo.requerido) validadores.push(Validators.pattern(/\S/));
      if (campo.maxLongitud) validadores.push(Validators.maxLength(campo.maxLongitud));
      if (campo.min !== undefined) validadores.push(Validators.min(campo.min));
      if (campo.max !== undefined) validadores.push(Validators.max(campo.max));
      if (campo.tipo === 'number')
        validadores.push(Validators.pattern(campo.paso === 0.01 ? /^\d+(\.\d{1,2})?$/ : /^\d+$/));
      controls[campo.clave] = new FormControl<ValorAdministracion>(
        { value: valor, disabled: this.idEdicion !== null && !!campo.referencia },
        validadores,
      );
    }
    this.formulario = new FormGroup(controls);
  }
  nuevo(): void {
    if (
      !this.modulo ||
      this.guardando ||
      this.eliminandoId !== null ||
      this.errorCarga ||
      !this.auth.hasAnyRole(['ADMIN'])
    )
      return;
    this.cancelarEditor.next();
    this.cargandoDetalle = false;
    this.idEdicion = null;
    this.detalle = null;
    this.editorAbierto = true;
    this.mensajeEditor = '';
    this.errorOpciones = '';
    this.construirFormulario();
    this.cargarOpciones();
  }
  editar(registro: RegistroAdministracionDTO): void {
    if (
      this.guardando ||
      this.eliminandoId !== null ||
      registro.modificable === false ||
      !this.auth.hasAnyRole(['ADMIN'])
    )
      return;
    this.leerRegistro(registro, true);
  }
  ver(registro: RegistroAdministracionDTO): void {
    if (!this.guardando && this.eliminandoId === null) this.leerRegistro(registro, false);
  }
  private leerRegistro(registro: RegistroAdministracionDTO, editar: boolean): void {
    this.cancelarEditor.next();
    this.editorAbierto = false;
    this.detalle = null;
    this.cargandoDetalle = true;
    this.mensaje = '';
    this.admin
      .buscar(this.modulo!.clave, this.id(registro))
      .pipe(takeUntil(this.cancelarEditor), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (actual) => {
          this.cargandoDetalle = false;
          if (editar && actual.modificable !== false) {
            this.idEdicion = this.id(actual);
            this.mensajeEditor = '';
            this.errorOpciones = '';
            this.editorAbierto = true;
            this.construirFormulario(actual);
            this.cargarOpciones(actual);
          } else this.detalle = actual;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.cargandoDetalle = false;
          this.mensaje = mensajeDeError(err, 'No se pudo consultar el registro.');
          this.cdr.detectChanges();
        },
      });
  }
  private cargarOpciones(registro?: RegistroAdministracionDTO): void {
    const campos = this.camposVisibles().filter((c) => c.relacion);
    this.cargandoOpciones = true;
    const requests = campos.map((campo) => {
      if (campo.relacion === 'usuarios')
        return this.admin.usuarios().pipe(
          map((usuarios) =>
            usuarios.map((u) => ({
              valor: u.idUsuario,
              etiqueta: `${u.nombres} ${u.apellidos} · ${u.correo}`,
              idUsuario: u.idUsuario,
            })),
          ),
        );
      if (campo.relacion === 'ejercicios')
        return this.ejercicios.listarEjercicios().pipe(
          map((datos) =>
            datos.map((d) => ({
              valor: d.idEjercicio,
              etiqueta: `#${d.idEjercicio} · ${d.nombre}`,
            })),
          ),
        );
      return this.admin
        .opciones(campo.relacion!, registro?.idUsuario ?? this.idUsuarioFiltro())
        .pipe(
          map((datos) => {
            const modulo = MODULOS_ADMINISTRACION.find((m) => m.clave === campo.relacion)!;
            return datos.map((d) => ({
              valor: Number(d.datos[modulo.id]),
              idUsuario: d.idUsuario,
              etiqueta: `#${d.datos[modulo.id]} · ${d.datos['nombre'] ?? d.datos['fechaInicio'] ?? d.datos['fecha'] ?? (d.datos['idEjercicio'] ? 'Ejercicio #' + d.datos['idEjercicio'] : modulo.singular)} · Cuenta #${d.idUsuario}`,
            }));
          }),
        );
    });
    forkJoin(requests)
      .pipe(takeUntil(this.cancelarEditor), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resultados) => {
          this.opciones = {};
          campos.forEach((campo, i) => {
            const opciones = resultados[i] as OpcionAdministracion[];
            const valor = registro?.datos[campo.clave];
            if (
              valor !== undefined &&
              valor !== null &&
              !opciones.some((o) => Number(o.valor) === Number(valor))
            )
              opciones.push({ valor: Number(valor), etiqueta: `#${valor} · Referencia actual` });
            this.opciones[campo.clave] = opciones;
          });
          this.cargandoOpciones = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.cargandoOpciones = false;
          this.errorOpciones = mensajeDeError(
            err,
            'No se pudieron cargar las referencias. Cierra el formulario y vuelve a abrirlo.',
          );
          this.cdr.detectChanges();
        },
      });
  }
  cerrarEditor(): void {
    if (this.guardando) return;
    this.cancelarEditor.next();
    this.editorAbierto = false;
    this.cargandoOpciones = false;
    this.cargandoDetalle = false;
  }
  guardar(): void {
    if (
      !this.modulo ||
      this.guardando ||
      this.cargandoOpciones ||
      this.errorOpciones ||
      !this.auth.hasAnyRole(['ADMIN'])
    )
      return;
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.mensajeEditor = 'Revisa los campos señalados antes de guardar.';
      return;
    }
    const datos: Record<string, ValorAdministracion> = {};
    const valores = this.formulario.getRawValue();
    for (const campo of this.camposVisibles()) {
      const valor = valores[campo.clave];
      datos[campo.clave] =
        campo.tipo === 'checkbox'
          ? !!valor
          : campo.tipo === 'number' || campo.relacion
            ? valor === '' || valor === null
              ? null
              : Number(valor)
            : typeof valor === 'string'
              ? valor.trim() || null
              : valor;
    }
    if (this.modulo.clave === 'sesiones')
      datos['estado'] = this.idEdicion === null ? 'EN_CURSO' : 'FINALIZADA';
    const clave = this.modulo.clave;
    const esNuevo = this.idEdicion === null;
    this.guardando = true;
    this.mensajeEditor = '';
    this.filtroUsuario.disable({ emitEvent: false });
    this.admin
      .guardar(clave, this.idEdicion, datos)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.guardando = false;
          this.filtroUsuario.enable({ emitEvent: false });
          if (this.modulo?.clave !== clave) return;
          this.cerrarEditor();
          this.mensaje = 'Cambios guardados correctamente en la base de datos.';
          if (esNuevo) this.pagina = 0;
          this.detalle = null;
          this.recargar.next();
        },
        error: (err) => {
          this.guardando = false;
          this.filtroUsuario.enable({ emitEvent: false });
          if (this.modulo?.clave !== clave) return;
          this.mensajeEditor = mensajeDeError(
            err,
            'No se pudieron guardar los cambios.',
            err.error?.message || 'La operación entra en conflicto con registros relacionados.',
          );
          this.cdr.detectChanges();
        },
      });
  }
  eliminar(registro: RegistroAdministracionDTO): void {
    if (
      !this.modulo ||
      this.modulo.eliminar === false ||
      registro.modificable === false ||
      this.guardando ||
      this.eliminandoId !== null ||
      !this.auth.hasAnyRole(['ADMIN'])
    )
      return;
    const id = this.id(registro),
      clave = this.modulo.clave;
    if (
      !confirm(
        `¿Eliminar ${this.modulo.singular} #${id} de ${this.nombreUsuario(registro.idUsuario)}? Esta acción elimina el registro real y no se puede deshacer.`,
      )
    )
      return;
    this.eliminandoId = id;
    this.mensaje = '';
    this.filtroUsuario.disable({ emitEvent: false });
    this.admin
      .eliminar(clave, id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.eliminandoId = null;
          this.filtroUsuario.enable({ emitEvent: false });
          if (this.modulo?.clave !== clave) return;
          this.mensaje = 'Registro eliminado correctamente.';
          this.detalle = null;
          this.cerrarEditor();
          this.recargar.next();
        },
        error: (err) => {
          this.eliminandoId = null;
          this.filtroUsuario.enable({ emitEvent: false });
          if (this.modulo?.clave !== clave) return;
          this.mensaje = mensajeDeError(
            err,
            'No se pudo eliminar el registro.',
            err.error?.message ||
              'Hay registros relacionados. Retíralos antes de eliminar este registro.',
          );
          this.cdr.detectChanges();
        },
      });
  }
}
