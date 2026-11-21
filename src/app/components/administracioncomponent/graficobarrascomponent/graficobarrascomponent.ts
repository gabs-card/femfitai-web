import { Component, Input } from '@angular/core';
import { DatoGrafico } from '../../../utils/estadisticas';

@Component({
  selector: 'app-graficobarrascomponent',
  templateUrl: './graficobarrascomponent.html',
  styleUrl: './graficobarrascomponent.css',
})
export class Graficobarrascomponent {
  @Input() datos: DatoGrafico[] = [];
  @Input() titulo = '';
  @Input() unidad = 'Cantidad';
  get maximo(): number {
    return Math.max(1, ...this.datos.map((dato) => dato.valor));
  }
  get ancho(): number {
    return Math.max(560, this.datos.length * 88 + 64);
  }
  get anchoBarra(): number {
    return Math.min(54, ((this.ancho - 60) / Math.max(1, this.datos.length)) * 0.58);
  }
  centro(indice: number): number {
    return 48 + ((indice + 0.5) * (this.ancho - 60)) / Math.max(1, this.datos.length);
  }
}
