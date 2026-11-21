export type ValorAdministracion = string | number | boolean | null;
export interface RegistroAdministracionDTO {
  idUsuario: number;
  datos: Record<string, ValorAdministracion>;
  modificable: boolean;
}
