import { Routes } from '@angular/router';
import { Homecomponent } from './components/homecomponent/homecomponent';
import { Clistusuarioscomponent } from './components/usuarioscomponent/clistusuarioscomponent/clistusuarioscomponent';
import { Ceditusuarioscomponent } from './components/usuarioscomponent/ceditusuarioscomponent/ceditusuarioscomponent';
import { programadorGuard } from './guards/programadorguard';
import { Cicloscomponent } from './components/cicloscomponent/cicloscomponent';
import { Clistcicloscomponent } from './components/cicloscomponent/clistcicloscomponent/clistcicloscomponent';
import { Cinsertcicloscomponent } from './components/cicloscomponent/cinsertcicloscomponent/cinsertcicloscomponent';
import { Ejercicioscomponent } from './components/ejercicioscomponent/ejercicioscomponent';
import { Clistejercicioscomponent } from './components/ejercicioscomponent/clistejercicioscomponent/clistejercicioscomponent';
import { Ceditcicloscomponent } from './components/cicloscomponent/ceditcicloscomponent/ceditcicloscomponent';
import { Perfilcomponent } from './components/perfilcomponent/perfilcomponent';
import { Rutinascomponent } from './components/rutinascomponent/rutinascomponent';
import { Clistrutinascomponent } from './components/rutinascomponent/clistrutinascomponent/clistrutinascomponent';
export const routes: Routes = [
  {
    path: '',
    component: Homecomponent,
    pathMatch: 'full',
  },
  {
    path: 'ciclos',
    component: Cicloscomponent,
    children: [
      {
        path: '',
        redirectTo: 'listar',
        pathMatch: 'full',
      },
      {
        path: 'listar',
        component: Clistcicloscomponent,
      },
      {
        path: 'editar/:id',
        component: Ceditcicloscomponent,
      },
      {
        path: 'insertar',
        component: Cinsertcicloscomponent,
      },
    ],
  },
  {
    path: 'ejercicios',
    component: Ejercicioscomponent,
    children: [
      { 
        path: '',
        redirectTo: 'listar',
        pathMatch: 'full'
      },
      {
        path: 'listar',
        component: Clistejercicioscomponent
      },
    ],
  },
  {
    path: 'perfil',
    component: Perfilcomponent,
  },
    {
    path: 'rutinas',
    component: Rutinascomponent,
    children: [
      { 
        path: '',
        redirectTo: 'listar',
        pathMatch: 'full' 
      },
      { 
        path: 'listar',
        component: Clistrutinascomponent
      },
    ],
  },
  {
    path: 'usuarios',
    canActivate: [programadorGuard],
    children: [
      {
        path: '',
        redirectTo: 'listar',
        pathMatch: 'full',
      },
      { 
        path: 'listar',
        component: Clistusuarioscomponent
      },
      { 
        path: 'editar/:id',
        component: Ceditusuarioscomponent
      },
    ],
  },
];
