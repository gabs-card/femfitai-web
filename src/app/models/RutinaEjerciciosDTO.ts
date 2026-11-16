export interface RutinaEjerciciosDTO {
  idRutinaEjercicio: number | null;
  idRutina: number;
  idEjercicio: number;
  series: number | null;
  repeticiones: number | null;
  descansoSeg: number | null;
}

export interface RutinaEjercicioDetalleDTO extends RutinaEjerciciosDTO {
  idRutinaEjercicio: number;
  nombre: string;
  grupoMuscular: string | null;
  tipo: string | null;
  descripcion: string | null;
}
