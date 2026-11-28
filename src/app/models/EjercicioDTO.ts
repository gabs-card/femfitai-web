export class EjercicioDTO {
    idEjercicio: number = 0;
    nombre: string = '';
    grupoMuscular: string = '';
    tipo: string = '';
    descripcion: string = '';
    imagenUrl?: string | null;
    imagenAutor?: string | null;
    imagenLicencia?: string | null;
    imagenLicenciaUrl?: string | null;
}