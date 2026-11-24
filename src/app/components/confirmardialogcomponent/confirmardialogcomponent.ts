import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmarDialogData {
  titulo: string;
  mensaje: string;
  confirmar?: string;
  cancelar?: string;
}

@Component({
  selector: 'app-confirmardialogcomponent',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './confirmardialogcomponent.html',
})
export class Confirmardialogcomponent {
  datos = inject<ConfirmarDialogData>(MAT_DIALOG_DATA);
}