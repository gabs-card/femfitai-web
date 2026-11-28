import { Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { urlImagenSegura } from '../../utils/imagenes';

@Component({
  selector: 'app-fotoejerciciocomponent',
  imports: [],
  templateUrl: './fotoejerciciocomponent.html',
  styleUrl: './fotoejerciciocomponent.css',
})
export class Fotoejerciciocomponent implements OnChanges {
  @Input() imagenUrl: string | null | undefined = null;
  @Input() nombre = '';
  @Input() autor: string | null | undefined = null;
  @Input() licencia: string | null | undefined = null;
  @Input() licenciaUrl: string | null | undefined = null;
  imagenFallida = false;
  @ViewChild('dialogoImagen') detalle?: ElementRef<HTMLDialogElement>;

  abrir(): void {
    if (this.fuente && !this.imagenFallida) this.detalle?.nativeElement.showModal();
  }
  cerrar(): void { this.detalle?.nativeElement.close(); }

  get fuente(): string { return urlImagenSegura(this.imagenUrl); }
  get enlaceLicencia(): string { return urlImagenSegura(this.licenciaUrl); }

  ngOnChanges(): void { this.imagenFallida = false; }
}
