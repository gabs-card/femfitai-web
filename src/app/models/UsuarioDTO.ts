import { PerfilDTO } from './PerfilDTO';

export class UsuarioDTO {
  idUsuario: number = 0;
  nombres: string = '';
  apellidos: string = '';
  correo: string = '';
  rol: string = '';
  estado: boolean | null = null;
  fechaRegistro: string | null = null;
}

export interface UsuarioEditDTO {
  nombres: string;
  apellidos: string;
  correo: string;
  estado?: boolean;
  passwordHash?: string;
}

export interface UsuarioDetalleDTO extends UsuarioDTO {
  perfil: PerfilDTO | null;
  totalRutinas: number;
  totalSesiones: number;
  totalProgreso: number;
  totalCiclos: number;
}