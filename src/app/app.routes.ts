import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { Layoutcomponent } from './components/layoutcomponent/layoutcomponent';
import { Landingcomponent } from './components/landingcomponent/landingcomponent';
import { Logincomponent } from './components/logincomponent/logincomponent';
import { Homecomponent } from './components/homecomponent/homecomponent';
import { Recomendacionescomponent } from './components/recomendacionescomponent/recomendacionescomponent';
import { Chatcomponent } from './components/chatcomponent/chatcomponent';
import { Ceditprogresocomponent } from './components/progresocomponent/ceditprogresocomponent/ceditprogresocomponent';
import { Cinsertprogresocomponent } from './components/progresocomponent/cinsertprogresocomponent/cinsertprogresocomponent';
import { Clistprogresocomponent } from './components/progresocomponent/clistprogresocomponent/clistprogresocomponent';
import { Progresocomponent } from './components/progresocomponent/progresocomponent';
import { Perfilcomponent } from './components/perfilcomponent/perfilcomponent';
import { Clistejercicioscomponent } from './components/ejercicioscomponent/clistejercicioscomponent/clistejercicioscomponent';
import { Ejercicioscomponent } from './components/ejercicioscomponent/ejercicioscomponent';
import { Detallediariocomponent } from './components/cicloscomponent/detallediariocomponent/detallediariocomponent';
import { Cinsertcicloscomponent } from './components/cicloscomponent/cinsertcicloscomponent/cinsertcicloscomponent';
import { Ceditcicloscomponent } from './components/cicloscomponent/ceditcicloscomponent/ceditcicloscomponent';
import { Clistcicloscomponent } from './components/cicloscomponent/clistcicloscomponent/clistcicloscomponent';
import { Cicloscomponent } from './components/cicloscomponent/cicloscomponent';

export const routes: Routes = [
  { path: '', component: Landingcomponent, pathMatch: 'full' },
  { path: 'login', component: Logincomponent },
  { path: 'registro', component: Logincomponent, data: { registroInicial: true } },
  {
    path: '',
    component: Layoutcomponent,
    canActivate: [authGuard],
    children: [
      { path: 'inicio', component: Homecomponent },
      {
        path: 'estadisticas',
        canActivate: [roleGuard],
        data: { roles: ['USUARIA'] },
        loadComponent: () =>
          import('./components/estadisticascomponent/estadisticascomponent').then(
            (m) => m.Estadisticascomponent,
          ),
      },
      {
        path: 'administracion',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadChildren: () =>
          import('./components/administracioncomponent/administracion.routes').then(
            (m) => m.ADMINISTRACION_ROUTES,
          ),
      },
      {
        path: 'ciclos',
        component: Cicloscomponent,
        canActivate: [roleGuard],
        data: { roles: ['USUARIA'] },
        children: [
          { path: '', redirectTo: 'listar', pathMatch: 'full' },
          { path: 'listar', component: Clistcicloscomponent },
          { path: 'editar/:id', component: Ceditcicloscomponent },
          { path: 'insertar', component: Cinsertcicloscomponent },
          { path: 'diario/:id', component: Detallediariocomponent },
        ],
      },
      {
        path: 'ejercicios',
        component: Ejercicioscomponent,
        canActivate: [roleGuard],
        data: { roles: ['USUARIA'] },
        children: [
          { path: '', redirectTo: 'listar', pathMatch: 'full' },
          { path: 'listar', component: Clistejercicioscomponent },
        ],
      },
      {
        path: 'perfil',
        component: Perfilcomponent,
        canActivate: [roleGuard],
        data: { roles: ['USUARIA'] },
      },
      {
        path: 'rutinas',
        canActivate: [roleGuard],
        data: { roles: ['USUARIA'] },
        loadChildren: () =>
          import('./components/rutinascomponent/rutinas.routes').then((m) => m.RUTINAS_ROUTES),
      },
      {
        path: 'progreso',
        component: Progresocomponent,
        canActivate: [roleGuard],
        data: { roles: ['USUARIA'] },
        children: [
          { path: '', redirectTo: 'listar', pathMatch: 'full' },
          { path: 'listar', component: Clistprogresocomponent },
          { path: 'insertar', component: Cinsertprogresocomponent },
          { path: 'editar/:id', component: Ceditprogresocomponent },
        ],
      },
      {
        path: 'usuarios',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          { path: '', redirectTo: 'listar', pathMatch: 'full' },
          {
            path: 'listar',
            loadComponent: () =>
              import('./components/usuarioscomponent/clistusuarioscomponent/clistusuarioscomponent').then(
                (m) => m.Clistusuarioscomponent,
              ),
          },
          {
            path: 'insertar',
            loadComponent: () =>
              import('./components/usuarioscomponent/cinsertusuarioscomponent/cinsertusuarioscomponent').then(
                (m) => m.Cinsertusuarioscomponent,
              ),
          },
          {
            path: 'editar/:id',
            loadComponent: () =>
              import('./components/usuarioscomponent/ceditusuarioscomponent/ceditusuarioscomponent').then(
                (m) => m.Ceditusuarioscomponent,
              ),
          },
        ],
      },
      {
        path: 'chat',
        component: Chatcomponent,
        canActivate: [roleGuard],
        data: { roles: ['USUARIA'] },
      },
      {
        path: 'recomendaciones',
        component: Recomendacionescomponent,
        canActivate: [roleGuard],
        data: { roles: ['USUARIA'] },
      },
      {
        path: 'sesiones',
        canActivate: [roleGuard],
        data: { roles: ['USUARIA'] },
        loadChildren: () =>
          import('./components/sesionescomponent/sesiones.routes').then((m) => m.SESIONES_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
