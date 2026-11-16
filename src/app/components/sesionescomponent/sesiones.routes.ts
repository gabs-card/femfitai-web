import { Routes } from '@angular/router';
import { Sesionescomponent } from './sesionescomponent';

export const SESIONES_ROUTES: Routes = [
  {
    path: '',
    component: Sesionescomponent,
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', loadComponent: () => import('./clistsesionescomponent/clistsesionescomponent').then((m) => m.Clistsesionescomponent) },
      { path: 'insertar', loadComponent: () => import('./cformsesionescomponent/cformsesionescomponent').then((m) => m.Cformsesionescomponent) },
      { path: 'editar/:id', loadComponent: () => import('./cformsesionescomponent/cformsesionescomponent').then((m) => m.Cformsesionescomponent) },
      { path: 'detalle/:id', loadComponent: () => import('./cdetallessesioncomponent/cdetallessesioncomponent').then((m) => m.Cdetallessesioncomponent) },
    ],
  },
];
