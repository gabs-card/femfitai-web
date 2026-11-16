
export interface RecomendacionesIADTO {
  idRecomendacion: number;
  idUsuario: number;
  idRutina: number | null;
  fecha: string;
  tipo: string;
  contenido: string;
  motivo: string;
  aceptada: boolean;
}
