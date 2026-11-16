export interface SesionEntrenamientoDTO {
  idSesion: number;
  idRutina: number;
  idUsuario: number;
  fecha: string;
  duracionMin: number | null;
  nivelEnergia: number | null;
  esfuerzoPercibido: number | null;
  estado: string | null;
}
