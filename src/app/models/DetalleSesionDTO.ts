export interface DetalleSesionDTO {
  idDetalle: number | null;
  idSesion: number;
  idEjercicio: number;
  observacion: string | null;
}

export interface DetalleSesionEjercicioDTO extends DetalleSesionDTO {
  nombre: string;
  grupoMuscular: string | null;
}
