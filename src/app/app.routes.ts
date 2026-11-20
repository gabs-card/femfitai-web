import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { Layoutcomponent } from './components/layoutcomponent/layoutcomponent';
import { Landingcomponent } from './components/landingcomponent/landingcomponent';
import { Logincomponent } from './components/logincomponent/logincomponent';
import { Clistusuarioscomponent } from './components/usuarioscomponent/clistusuarioscomponent/clistusuarioscomponent';
import { Ceditusuarioscomponent } from './components/usuarioscomponent/ceditusuarioscomponent/ceditusuarioscomponent';
import { Clistcicloscomponent } from './components/cicloscomponent/clistcicloscomponent/clistcicloscomponent';
import { Ceditcicloscomponent } from './components/cicloscomponent/ceditcicloscomponent/ceditcicloscomponent';
import { Cinsertcicloscomponent } from './components/cicloscomponent/cinsertcicloscomponent/cinsertcicloscomponent';
import { Detallediariocomponent } from './components/cicloscomponent/detallediariocomponent/detallediariocomponent';
import { Cicloscomponent } from './components/cicloscomponent/cicloscomponent';
import { Homecomponent } from './components/homecomponent/homecomponent';
import { Routes } from '@angular/router';

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
      // ejercicios, perfil, rutinas, progreso, chat, recomendaciones y sesiones:
      // el mismo patrón → canActivate: [roleGuard], data: { roles: ['TESTER'] }
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
    ],
  },
  { path: '**', redirectTo: 'login' },
];