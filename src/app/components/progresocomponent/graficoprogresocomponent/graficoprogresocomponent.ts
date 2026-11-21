import { Component, Input, OnChanges } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ProgresoDTO } from '../../../models/ProgresoDTO';
import { crearGraficoProgreso, MedicionProgreso } from '../../../utils/graficos-progreso';

@Component({
  selector: 'app-graficoprogresocomponent',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './graficoprogresocomponent.html',
  styleUrl: './graficoprogresocomponent.css',
})
export class Graficoprogresocomponent implements OnChanges {
  @Input() registros: ProgresoDTO[] = [];
  @Input() descripcion = 'Mediciones de la página actual, ordenadas por fecha.';
  @Input() alcance = 'página actual';
  @Input() idTitulo = 'titulo-grafico-progreso';
  medicion: MedicionProgreso = 'pesoKg';
  grafico = crearGraficoProgreso([], this.medicion);

  get unidad(): string {
    return this.medicion === 'pesoKg' ? 'kg' : 'cm';
  }
  get etiqueta(): string {
    return this.medicion === 'pesoKg' ? 'Peso' : 'Medida opcional';
  }

  ngOnChanges(): void {
    this.grafico = crearGraficoProgreso(this.registros, this.medicion);
  }

  cambiarMedicion(medicion: MedicionProgreso): void {
    this.medicion = medicion;
    this.ngOnChanges();
  }
}
