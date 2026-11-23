import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type TipoIconoAccion = 'editar' | 'eliminar';

@Component({
  selector: 'app-iconoaccion',
  templateUrl: './iconoaccioncomponent.html',
  styleUrl: './iconoaccioncomponent.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Iconoaccioncomponent {
  readonly tipo = input.required<TipoIconoAccion>();
}