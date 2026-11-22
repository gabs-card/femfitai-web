import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { UsuariosService } from '../../../services/usuariosservices';
import { Loginservice } from '../../../services/loginservice';
import { UsuarioDTO } from '../../../models/UsuarioDTO';
import { mensajeDeError } from '../../../utils/errores';

@Component({
  selector: 'app-clistusuarioscomponent',
  imports: [RouterLink, DatePipe],
  templateUrl: './clistusuarioscomponent.html',
  styleUrl: '../../administracioncomponent/administracion.css',
})
export class Clistusuarioscomponent implements OnInit {
  us = inject(UsuariosService);
  private auth = inject(Loginservice);
  mensaje = signal('');
  busqueda = signal('');
  rol = signal('');
  estado = signal('todos');
  procesandoId = signal<number | null>(null);
  verInactivos = computed(() => this.estado() === 'inactivas');
  activas = computed(() => this.us.usuarios().filter((u) => u.estado === true).length);
  inactivas = computed(() => this.us.usuarios().filter((u) => u.estado === false).length);
  administradores = computed(
    () => this.us.usuarios().filter((u) => this.normalizarRol(u.rol) === 'ADMIN').length,
  );
  usuariosVisibles = computed(() => {
    const busqueda = this.normalizar(this.busqueda());
    return this.us
      .usuarios()
      .filter(
        (u) =>
          this.normalizar(`${u.nombres} ${u.apellidos} ${u.correo}`).includes(busqueda) &&
          (!this.rol() || this.normalizarRol(u.rol) === this.rol()) &&
          (this.estado() === 'todos' ||
            (this.estado() === 'activas' ? u.estado === true : u.estado === false)),
      );
  });
  ngOnInit(): void {
    this.us.listar();
    this.mensaje.set(history.state?.mensaje ?? '');
  }
  private normalizar(valor: string): string {
    return valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }
  private normalizarRol(rol: string): string {
    return (rol ?? '').replace(/^ROLE_/, '');
  }
  alternarVista(estado?: string): void {
    this.estado.set(estado ?? (this.verInactivos() ? 'activas' : 'inactivas'));
    this.mensaje.set('');
  }
  desactivar(u: UsuarioDTO): void {
    if (this.procesandoId() !== null || this.us.cargando()) return;
    if (u.idUsuario === this.auth.getIdUsuario()) {
      this.mensaje.set('No puedes desactivar tu propia cuenta.');
      return;
    }
    if (
      !confirm(
        `¿Desactivar a ${u.nombres} ${u.apellidos}? No podrá iniciar sesión, pero sus datos se conservan.`,
      )
    )
      return;
    this.procesandoId.set(u.idUsuario);
    this.us.desactivar(u.idUsuario).subscribe({
      next: () => {
        this.procesandoId.set(null);
        this.us.listar();
        this.mensaje.set('Usuario desactivado correctamente.');
      },
      error: (e: HttpErrorResponse) => {
        this.procesandoId.set(null);
        this.mensaje.set(mensajeDeError(e, 'No se pudo desactivar al usuario.'));
      },
    });
  }
  reactivar(u: UsuarioDTO): void {
    if (this.procesandoId() !== null || this.us.cargando()) return;
    if (!confirm(`¿Reactivar a ${u.nombres} ${u.apellidos}?`)) return;
    this.procesandoId.set(u.idUsuario);
    this.us.reactivar(u).subscribe({
      next: () => {
        this.procesandoId.set(null);
        this.us.listar();
        this.mensaje.set('Usuario reactivado correctamente.');
      },
      error: (e: HttpErrorResponse) => {
        this.procesandoId.set(null);
        this.mensaje.set(mensajeDeError(e, 'No se pudo reactivar al usuario.'));
      },
    });
  }
}
