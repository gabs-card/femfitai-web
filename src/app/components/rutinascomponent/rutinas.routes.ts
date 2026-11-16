import { Routes } from '@angular/router';
import { Rutinascomponent } from './rutinascomponent';
import { Clistrutinascomponent } from './clistrutinascomponent/clistrutinascomponent';
import { Cinsertrutinascomponent } from './cinsertrutinascomponent/cinsertrutinascomponent';
import { Ceditrutinascomponent } from './ceditrutinascomponent/ceditrutinascomponent';

export const RUTINAS_ROUTES: Routes = [
  {
    path: '',
    component: Rutinascomponent,
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Clistrutinascomponent },
      { path: 'insertar', component: Cinsertrutinascomponent },
      { path: 'editar/:id', component: Ceditrutinascomponent },
    ],
  },
];
