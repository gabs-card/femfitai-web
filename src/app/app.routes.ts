
import { Routes } from '@angular/router';
import { ListaClientesComponent } from './components/lista-clientes/lista-clientes.component';
import { Cicloscomponent } from './components/cicloscomponent/cicloscomponent';
import { Clistcicloscomponent } from './components/cicloscomponent/clistcicloscomponent/clistcicloscomponent';
import { Cinsertcicloscomponent } from './components/cicloscomponent/cinsertcicloscomponent/cinsertcicloscomponent';

export const routes: Routes = [
  {
    path: '',
    component: ListaClientesComponent,
    pathMatch: 'full'
  },
  {
    path: 'ciclos',
    component: Cicloscomponent,
    children: [
      {
        path: '',
        redirectTo: 'listar',
        pathMatch: 'full'
      },
      {
        path: 'listar',
        component: Clistcicloscomponent
      },
      {
        path: 'insertar',
        component: Cinsertcicloscomponent
      }
    ]
  }
];
