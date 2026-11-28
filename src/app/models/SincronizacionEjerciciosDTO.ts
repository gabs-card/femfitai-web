export interface SincronizacionEjerciciosDTO {
  totalConsultados: number;
  insertados: number;
  actualizados: number;
  omitidos: number;
  completo: boolean;
  offsetError: number | null;
  mensaje: string | null;
  imagenesImportadas?: number;
}
