import { RutinaDTO } from './RutinaDTO';

export interface CiclosUsuarioDTO {
  idCiclo: number;
  idUsuario: number;
  nombres: string;
  apellidos: string;
  fechaInicio: string;
  fechaFinEstimada: string | null;
  fechaFinReal: string | null;
}
export interface RutinasUsuarioDTO extends RutinaDTO {
  nombres: string;
  apellidos: string;
}
export interface EjerciciosUsuarioDTO {
  idUsuario: number;
  nombres: string;
  apellidos: string;
  idRutina: number;
  nombreRutina: string;
  idRutinaEjercicio: number;
  idEjercicio: number;
  nombreEjercicio: string;
  grupoMuscular: string | null;
  tipo: string | null;
  series: number | null;
  repeticiones: number | null;
  descansoSeg: number | null;
}
