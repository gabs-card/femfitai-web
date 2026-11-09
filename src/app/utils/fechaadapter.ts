import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

// Las fechas escritas a mano se leen como dd/MM/yyyy (por defecto se leían como MM/dd/yyyy).
@Injectable()
export class FechaAdapter extends NativeDateAdapter {
  override parse(valor: any): Date | null {
    if (typeof valor !== 'string') return super.parse(valor);
    const texto = valor.trim();
    if (!texto) return null;
    const m = texto.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
    if (!m) return this.invalid();
    const dia = +m[1];
    const mes = +m[2];
    const anio = +m[3];
    const fecha = new Date(anio, mes - 1, dia);
    const valida = fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 && fecha.getDate() === dia;
    return valida ? fecha : this.invalid();
  }
}