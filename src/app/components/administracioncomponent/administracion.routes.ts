import { Routes } from '@angular/router';

export const ADMINISTRACION_ROUTES: Routes = [
  {
    path: 'modulos/:modulo',
    loadComponent: () =>
      import('./gestionadmincomponent/gestionadmincomponent').then((m) => m.Gestionadmincomponent),
  },
  { path: '', redirectTo: 'modulos', pathMatch: 'full' },
  {
    path: 'metricas',
    loadComponent: () =>
      import('./paneladmincomponent/paneladmincomponent').then((m) => m.Paneladmincomponent),
  },
  {
    path: 'modulos',
    loadComponent: () =>
      import('./modulosadmincomponent/modulosadmincomponent').then((m) => m.Modulosadmincomponent),
  },
  {
    path: 'ejercicios',
    loadComponent: () =>
      import('./clistadminejercicioscomponent/clistadminejercicioscomponent').then(
        (m) => m.Clistadminejercicioscomponent,
      ),
  },
  {
    path: 'ejercicios/insertar',
    loadComponent: () =>
      import('./cformejercicioscomponent/cformejercicioscomponent').then(
        (m) => m.Cformejercicioscomponent,
      ),
  },
  {
    path: 'ejercicios/editar/:id',
    loadComponent: () =>
      import('./cformejercicioscomponent/cformejercicioscomponent').then(
        (m) => m.Cformejercicioscomponent,
      ),
  },
];
