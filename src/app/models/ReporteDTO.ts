import { DatoGrafico } from '../utils/estadisticas';

export type TipoReporte =
  | 'ciclos'
  | 'detalle-diario'
  | 'rutinas'
  | 'rutina-ejercicios'
  | 'sesiones'
  | 'detalle-sesion'
  | 'detalle-serie'
  | 'progreso'
  | 'perfiles'
  | 'recomendaciones'
  | 'catalogo';
export type RegistroReporte = Record<string, unknown>;
export interface OpcionReporte {
  id: number;
  etiqueta: string;
}
export interface DatosReporte {
  registros: RegistroReporte[];
  referencias: OpcionReporte[];
  referencia: number | null;
  grupos: string[];
  detalle: string;
}
export interface GraficoReporte {
  titulo: string;
  unidad: string;
  nota: string;
  datos: DatoGrafico[];
  omitidos: number;
}
