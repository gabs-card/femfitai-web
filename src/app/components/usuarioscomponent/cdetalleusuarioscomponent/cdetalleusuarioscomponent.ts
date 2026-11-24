import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UsuariosService } from '../../../services/usuariosservices';
import { UsuarioDetalleDTO } from '../../../models/UsuarioDTO';
import { mensajeDeCarga } from '../../../utils/errores';

@Component({
  selector: 'app-cdetalleusuarioscomponent',
  imports: [RouterLink, DatePipe],
  templateUrl: './cdetalleusuarioscomponent.html',
  styleUrls: ['../../administracioncomponent/administracion.css', './cdetalleusuarioscomponent.css'],
})
export class Cdetalleusuarioscomponent implements OnInit {
  private route = inject(ActivatedRoute);
  private us = inject(UsuariosService);

  usuario = signal<UsuarioDetalleDTO | null>(null);
  cargando = signal(true);
  error = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.us.detalle(id).subscribe({
      next: (u) => {
        this.usuario.set(u);
        this.cargando.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.error.set(mensajeDeCarga(e));
        this.cargando.set(false);
      },
    });
  }
}