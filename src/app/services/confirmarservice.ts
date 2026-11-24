import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { map, Observable } from 'rxjs';
import {
  Confirmardialogcomponent,
  ConfirmarDialogData,
} from '../components/confirmardialogcomponent/confirmardialogcomponent';

@Injectable({ providedIn: 'root' })
export class Confirmarservice {
  private readonly dialog = inject(MatDialog);

  confirmar(datos: ConfirmarDialogData): Observable<boolean> {
    return this.dialog
      .open(Confirmardialogcomponent, { data: datos, width: '420px' })
      .afterClosed()
      .pipe(map((respuesta) => respuesta === true));
  }
}