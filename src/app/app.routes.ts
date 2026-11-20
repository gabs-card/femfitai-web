import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { Layoutcomponent } from './components/layoutcomponent/layoutcomponent';
import { Landingcomponent } from './components/landingcomponent/landingcomponent';
import { Logincomponent } from './components/logincomponent/logincomponent';
import { Homecomponent } from './components/homecomponent/homecomponent';
import { Recomendacionescomponent } from './components/recomendacionescomponent/recomendacionescomponent';
import { Chatcomponent } from './components/chatcomponent/chatcomponent';
import { Ceditusuarioscomponent } from './components/usuarioscomponent/ceditusuarioscomponent/ceditusuarioscomponent';
import { Clistusuarioscomponent } from './components/usuarioscomponent/clistusuarioscomponent/clistusuarioscomponent';
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
// ... el resto de imports de componentes (están completos en el patch 4)

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
        path: 'ciclos',
        component: Cicloscomponent,
        canActivate: [roleGuard],
        data: { roles: ['TESTER'] },
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
        data: { roles: ['TESTER'] },
        children: [
          { path: '', redirectTo: 'listar', pathMatch: 'full' },
          { path: 'listar', component: Clistejercicioscomponent },
        ],
      },
      { path: 'perfil', component: Perfilcomponent, canActivate: [roleGuard], data: { roles: ['TESTER'] } },
      {
        path: 'rutinas',
        canActivate: [roleGuard],
        data: { roles: ['TESTER'] },
        loadChildren: () =>
          import('./components/rutinascomponent/rutinas.routes').then((m) => m.RUTINAS_ROUTES),
      },
      {
        path: 'progreso',
        component: Progresocomponent,
        canActivate: [roleGuard],
        data: { roles: ['TESTER'] },
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
        data: { roles: ['PROGRAMADOR'] },
        children: [
          { path: '', redirectTo: 'listar', pathMatch: 'full' },
          { path: 'listar', component: Clistusuarioscomponent },
          { path: 'editar/:id', component: Ceditusuarioscomponent },
        ],
      },
      { path: 'chat', component: Chatcomponent, canActivate: [roleGuard], data: { roles: ['TESTER'] } },
      { path: 'recomendaciones', component: Recomendacionescomponent, canActivate: [roleGuard], data: { roles: ['TESTER'] } },
      {
        path: 'sesiones',
        canActivate: [roleGuard],
        data: { roles: ['TESTER'] },
        loadChildren: () =>
          import('./components/sesionescomponent/sesiones.routes').then((m) => m.SESIONES_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];