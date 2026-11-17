export interface DetalleDiarioCicloDTO {
  idDetalleDiarioCiclo: number | null;
  idCiclo: number;
  fecha: string;
  faseRegistrada: string | null;
  nivelEnergia: number | null;
  observaciones: string | null;
}
