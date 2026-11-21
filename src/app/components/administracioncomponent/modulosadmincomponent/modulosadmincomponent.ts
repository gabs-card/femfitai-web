import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-modulosadmincomponent',
  imports: [RouterLink],
  templateUrl: './modulosadmincomponent.html',
  styleUrl: '../administracion.css',
})
export class Modulosadmincomponent {
  modulos = [
    {
      nombre: 'Rutinas',
      relacion: 'Usuaria → Rutina → Ejercicios',
      detalle: 'Crear, consultar, editar, desactivar y eliminar planes propios.',
    },
    {
      nombre: 'Sesiones y series',
      relacion: 'Rutina → Sesión → Detalle → Serie',
      detalle: 'Registro de entrenamientos, ejercicios y series propios.',
    },
    {
      nombre: 'Ciclos y diario',
      relacion: 'Usuaria → Ciclo → Registro diario',
      detalle: 'Consulta y mantenimiento de registros personales.',
    },
    {
      nombre: 'Progreso',
      relacion: 'Usuaria → Medición',
      detalle: 'Historial, edición, eliminación y gráfico de mediciones propias.',
    },
    {
      nombre: 'Perfil',
      relacion: 'Usuaria → Perfil de entrenamiento',
      detalle:
        'Preferencias y disponibilidad. No hay operación de eliminación en el backend actual.',
    },
    {
      nombre: 'Recomendaciones',
      relacion: 'Usuaria → Recomendación → Rutina opcional',
      detalle:
        'Generación, consulta y aceptación. No hay edición o eliminación genérica en el backend actual.',
    },
  ];
}
