import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UsuariosService } from '../../../services/usuariosservices';
import { Authservice } from '../../../services/authservice';
import { UsuarioDTO } from '../../../models/UsuarioDTO';

@Component({
  imports: [MatTableModule, MatIconModule, MatButtonModule, RouterLink, DatePipe],
  selector: 'app-clistusuarioscomponent',
  styleUrl: './clistusuarioscomponent.css',
  templateUrl: './clistusuarioscomponent.html',
})
export class Clistusuarioscomponent implements OnInit {
  us = inject(UsuariosService);
  private auth = inject(Authservice);

  columnas = ['id', 'nombres', 'apellidos', 'correo', 'rol', 'estado', 'fecha', 'acciones'];
  mensaje = signal('');

  ngOnInit(): void {
    this.us.listar();
  }

  eliminar(u: UsuarioDTO): void {
    if (u.idUsuario === this.auth.idUsuario()) {
      this.mensaje.set('No puedes eliminar tu propia cuenta.');
      return;
    }
    if (!confirm(`¿Eliminar a ${u.nombres} ${u.apellidos}?`)) return;

    this.us.eliminar(u.idUsuario).subscribe({
      next: () => {
        this.mensaje.set('Usuario eliminado.');
        this.us.listar();
      },
      error: (e: HttpErrorResponse) =>
        this.mensaje.set(
          e.status === 409
            ? 'No se puede eliminar: el usuario tiene registros relacionados.'
            : e.error?.message || 'No se pudo eliminar el usuario.'
        ),
    });
  }
}