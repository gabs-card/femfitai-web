import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UsuariosService } from '../../../services/usuariosservices';
import { Authservice } from '../../../services/authservice';
import { UsuarioDTO } from '../../../models/UsuarioDTO';
import { mensajeDeError } from '../../../utils/errores';

@Component({
  selector: 'app-clistusuarioscomponent',
  imports: [MatTableModule, MatIconModule, MatButtonModule, RouterLink, DatePipe],
  templateUrl: './clistusuarioscomponent.html',
  styleUrl: './clistusuarioscomponent.css',
})
export class Clistusuarioscomponent implements OnInit {
  us = inject(UsuariosService);
  private auth = inject(Authservice);

  columnas = ['id', 'nombres', 'apellidos', 'correo', 'rol', 'fecha', 'acciones'];
  mensaje = signal('');
  verInactivos = signal(false);
  usuariosVisibles = computed(() =>
    this.us.usuarios().filter((u) => (u.estado === false) === this.verInactivos()),
  );

  ngOnInit(): void {
    this.us.listar();
    this.mensaje.set(history.state?.mensaje ?? '');
  }

  alternarVista(): void {
    this.verInactivos.update((v) => !v);
    this.mensaje.set('');
  }

  desactivar(u: UsuarioDTO): void {
    if (u.idUsuario === this.auth.idUsuario()) {
      this.mensaje.set('No puedes desactivar tu propia cuenta.');
      return;
    }
    if (!confirm(`¿Desactivar a ${u.nombres} ${u.apellidos}? No podrá iniciar sesión, pero sus datos se conservan.`)) return;
    this.us.desactivar(u.idUsuario).subscribe({
      next: () => {
        this.us.listar();
        this.mensaje.set('Usuario desactivado correctamente.');
      },
      error: (e: HttpErrorResponse) => this.mensaje.set(mensajeDeError(e, 'No se pudo desactivar al usuario.')),
    });
  }

  reactivar(u: UsuarioDTO): void {
    if (!confirm(`¿Reactivar a ${u.nombres} ${u.apellidos}?`)) return;
    this.us.reactivar(u).subscribe({
      next: () => {
        this.us.listar();
        this.mensaje.set('Usuario reactivado correctamente.');
      },
      error: (e: HttpErrorResponse) => this.mensaje.set(mensajeDeError(e, 'No se pudo reactivar al usuario.')),
    });
  }
}