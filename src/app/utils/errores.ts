import { HttpErrorResponse } from '@angular/common/http';

export function mensajeDeError(
  err: HttpErrorResponse,
  porDefecto: string,
  conflicto = 'La operación entra en conflicto con otros registros.',
): string {
  switch (err.status) {
    case 0: return 'No se pudo conectar con el servidor.';
    case 400: return err.error?.message || porDefecto;
    case 401: return 'Tu sesión venció. Inicia sesión nuevamente.';
    case 403: return 'No tienes permiso para realizar esta acción.';
    case 404: return 'El registro no existe.';
    case 409: return conflicto;
    default: return porDefecto;
  }
}