export class UsuarioDTO {
    idUsuario: number = 0;
    nombres: string = '';
    apellidos: string = '';
    correo: string = '';
    rol: string = '';
    estado: boolean | null = null;
    fechaRegistro: string | null = null;
}
