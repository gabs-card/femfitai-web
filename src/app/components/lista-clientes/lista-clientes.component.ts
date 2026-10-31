import { Component, OnInit } from '@angular/core';
import { NgForOf } from '@angular/common';
import { UsuariosService } from '../../services/usuariosservices';

@Component({
  imports: [NgForOf],
  selector: 'app-lista-clientes',
  styleUrl: './lista-clientes.component.css',
  templateUrl: './lista-clientes.component.html',
})
export class ListaClientesComponent implements OnInit {
  constructor(public usuariosService: UsuariosService) {}

  ngOnInit(): void {
    this.usuariosService.listar();
  }
}
