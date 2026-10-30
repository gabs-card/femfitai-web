export class LoginResponseDTO {
    accessToken: string = '';
    tokenType: string = 'Bearer';
    rol: string = '';
    idUsuario?: number;
}