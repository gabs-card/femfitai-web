export interface CampoAdministracion {
  clave: string;
  etiqueta: string;
  tipo: 'text' | 'date' | 'number' | 'textarea' | 'select' | 'checkbox';
  requerido?: boolean;
  maxLongitud?: number;
  min?: number;
  max?: number;
  paso?: number;
  relacion?: string;
  opciones?: string[];
  referencia?: boolean;
  soloEditar?: boolean;
  noFutura?: boolean;
  ayuda?: string;
}
export interface ModuloAdministracion {
  clave: string;
  nombre: string;
  singular: string;
  descripcion: string;
  id: string;
  campos: CampoAdministracion[];
  columnas: { clave: string; etiqueta: string }[];
  nota?: string;
  eliminar?: boolean;
}
const usuario: CampoAdministracion = {
  clave: 'idUsuario',
  etiqueta: 'Cuenta propietaria',
  tipo: 'select',
  requerido: true,
  relacion: 'usuarios',
  referencia: true,
};
const relacion = (
  clave: string,
  etiqueta: string,
  modulo: string,
  requerido = true,
): CampoAdministracion => ({
  clave,
  etiqueta,
  tipo: 'select',
  requerido,
  relacion: modulo,
  referencia: true,
});
const texto = (
  clave: string,
  etiqueta: string,
  maxLongitud: number,
  requerido = false,
): CampoAdministracion => ({ clave, etiqueta, tipo: 'text', maxLongitud, requerido });
const numero = (
  clave: string,
  etiqueta: string,
  min: number,
  max?: number,
  requerido = false,
  paso = 1,
): CampoAdministracion => ({ clave, etiqueta, tipo: 'number', min, max, requerido, paso });
const fecha = (clave: string, etiqueta: string, requerido = true): CampoAdministracion => ({
  clave,
  etiqueta,
  tipo: 'date',
  requerido,
  noFutura: true,
});
const columna = (clave: string, etiqueta: string) => ({ clave, etiqueta });
export const MODULOS_ADMINISTRACION: ModuloAdministracion[] = [
  {
    clave: 'ciclos',
    nombre: 'Ciclos',
    singular: 'ciclo',
    descripcion: 'Fechas, historial y cierre de ciclos de las usuarias.',
    id: 'idCiclo',
    campos: [
      usuario,
      fecha('fechaInicio', 'Fecha de inicio'),
      { ...fecha('fechaReal', 'Fecha de fin real', false), noFutura: false },
    ],
    columnas: [
      columna('fechaInicio', 'Inicio'),
      columna('fechaFinEstimada', 'Fin estimado'),
      columna('fechaReal', 'Fin real'),
    ],
    nota: 'La fecha estimada se calcula a 28 días del inicio. Solo puede existir un ciclo abierto por usuaria. Un ciclo con diario no se elimina hasta retirar sus entradas.',
  },
  {
    clave: 'detalle-diario',
    nombre: 'Diario del ciclo',
    singular: 'registro diario',
    descripcion: 'Fase, energía y observaciones de cada día.',
    id: 'idDetalleDiarioCiclo',
    campos: [
      relacion('idCiclo', 'Ciclo', 'ciclos'),
      fecha('fecha', 'Fecha'),
      {
        clave: 'faseRegistrada',
        etiqueta: 'Fase registrada',
        tipo: 'select',
        opciones: ['Menstrual', 'Folicular', 'Ovulatoria', 'Lútea'],
      },
      numero('nivelEnergia', 'Nivel de energía', 1, 5, true),
      { clave: 'observaciones', etiqueta: 'Observaciones', tipo: 'textarea', maxLongitud: 255 },
    ],
    columnas: [
      columna('idCiclo', 'Ciclo'),
      columna('fecha', 'Fecha'),
      columna('faseRegistrada', 'Fase'),
      columna('nivelEnergia', 'Energía'),
    ],
    nota: 'Cada usuaria puede tener un único registro diario por fecha.',
  },
  {
    clave: 'rutinas',
    nombre: 'Rutinas',
    singular: 'rutina',
    descripcion: 'Planes de entrenamiento, objetivos y estado.',
    id: 'idRutina',
    campos: [
      usuario,
      texto('nombre', 'Nombre', 100, true),
      texto('objetivo', 'Objetivo', 100),
      texto('nivel', 'Nivel', 50),
      { clave: 'estado', etiqueta: 'Rutina activa', tipo: 'checkbox' },
    ],
    columnas: [
      columna('nombre', 'Nombre'),
      columna('objetivo', 'Objetivo'),
      columna('estado', 'Activa'),
    ],
    nota: 'Desactiva una rutina para conservarla. La eliminación se bloquea si tiene ejercicios, sesiones o recomendaciones relacionadas.',
  },
  {
    clave: 'rutina-ejercicios',
    nombre: 'Ejercicios de rutina',
    singular: 'asignación',
    descripcion: 'Ejercicios, series, repeticiones y descanso de cada plan.',
    id: 'idRutinaEjercicio',
    campos: [
      relacion('idRutina', 'Rutina', 'rutinas'),
      relacion('idEjercicio', 'Ejercicio', 'ejercicios'),
      numero('series', 'Series', 1),
      numero('repeticiones', 'Repeticiones', 1),
      numero('descansoSeg', 'Descanso (segundos)', 0),
    ],
    columnas: [
      columna('idRutina', 'Rutina'),
      columna('idEjercicio', 'Ejercicio'),
      columna('series', 'Series'),
      columna('repeticiones', 'Repeticiones'),
    ],
    nota: 'Las referencias se conservan al editar. Para cambiar el ejercicio, elimina la asignación y crea otra.',
  },
  {
    clave: 'sesiones',
    nombre: 'Sesiones',
    singular: 'sesión',
    descripcion: 'Iniciar entrenamientos desde una rutina y finalizar sesiones en curso.',
    id: 'idSesion',
    campos: [
      relacion('idRutina', 'Rutina planificada', 'rutinas'),
      { ...numero('duracionMin', 'Duración (minutos)', 1, undefined, true), soloEditar: true },
      { ...numero('nivelEnergia', 'Nivel de energía', 1, 5, true), soloEditar: true },
      { ...numero('esfuerzoPercibido', 'Esfuerzo percibido', 1, 10, true), soloEditar: true },
    ],
    columnas: [
      columna('idRutina', 'Rutina'),
      columna('fecha', 'Fecha'),
      columna('estado', 'Estado'),
      columna('duracionMin', 'Minutos'),
    ],
    eliminar: false,
    nota: 'Al iniciar se copian los ejercicios planificados y el estado es EN_CURSO. Finalizar conserva el historial; una sesión finalizada no se edita ni elimina.',
  },
  {
    clave: 'detalle-sesion',
    nombre: 'Ejercicios de sesión',
    singular: 'ejercicio de sesión',
    descripcion: 'Ejercicios ejecutados y observaciones de cada entrenamiento.',
    id: 'idDetalle',
    campos: [
      relacion('idSesion', 'Sesión', 'sesiones'),
      relacion('idEjercicio', 'Ejercicio', 'ejercicios'),
      { clave: 'observacion', etiqueta: 'Observación', tipo: 'textarea', maxLongitud: 255 },
    ],
    columnas: [
      columna('idSesion', 'Sesión'),
      columna('idEjercicio', 'Ejercicio'),
      columna('observacion', 'Observación'),
    ],
    nota: 'Se modifica únicamente durante una sesión EN_CURSO. Para eliminar un ejercicio, retira primero sus series.',
  },
  {
    clave: 'detalle-serie',
    nombre: 'Series',
    singular: 'serie',
    descripcion: 'Número de serie, repeticiones y peso registrado.',
    id: 'idSerie',
    campos: [
      relacion('idDetalle', 'Ejercicio de sesión', 'detalle-sesion'),
      { ...numero('numeroSerie', 'Número de serie', 1, undefined, true), referencia: true },
      numero('repeticiones', 'Repeticiones', 1, undefined, true),
      numero('pesoKg', 'Peso (kg)', 0, 9999.99, true, 0.01),
    ],
    columnas: [
      columna('idDetalle', 'Detalle'),
      columna('numeroSerie', 'Serie'),
      columna('repeticiones', 'Repeticiones'),
      columna('pesoKg', 'Peso (kg)'),
    ],
    nota: 'Solo se modifican series de sesiones EN_CURSO. El número y el ejercicio de una serie existente se conservan.',
  },
  {
    clave: 'progreso',
    nombre: 'Progreso',
    singular: 'medición',
    descripcion: 'Historial de peso, medida opcional y notas personales.',
    id: 'idProgreso',
    campos: [
      usuario,
      fecha('fecha', 'Fecha'),
      numero('pesoKg', 'Peso (kg)', 0.01, 9999.99, true, 0.01),
      numero('medidaOpcional', 'Medida opcional', 0.01, 9999.99, false, 0.01),
      { clave: 'notaPersonal', etiqueta: 'Nota personal', tipo: 'textarea', maxLongitud: 255 },
    ],
    columnas: [
      columna('fecha', 'Fecha'),
      columna('pesoKg', 'Peso (kg)'),
      columna('medidaOpcional', 'Medida opcional'),
    ],
    nota: 'Los cambios se guardan para la cuenta seleccionada y son visibles en su historial personal.',
  },
  {
    clave: 'perfiles',
    nombre: 'Perfiles',
    singular: 'perfil',
    descripcion: 'Nivel, objetivo y disponibilidad para entrenar.',
    id: 'idPerfil',
    campos: [
      usuario,
      texto('nivelEntrenamiento', 'Nivel de entrenamiento', 50, true),
      texto('objetivoPrincipal', 'Objetivo principal', 100, true),
      numero('diasDisponibles', 'Días disponibles', 1, 7, true),
      numero('tiempoDisponible', 'Tiempo disponible (minutos)', 1, undefined, true),
      fecha('fechaNacimiento', 'Fecha de nacimiento'),
    ],
    columnas: [
      columna('nivelEntrenamiento', 'Nivel'),
      columna('objetivoPrincipal', 'Objetivo'),
      columna('diasDisponibles', 'Días'),
    ],
    nota: 'Cada cuenta tiene como máximo un perfil. Eliminarlo retira sus preferencias de entrenamiento.',
  },
  {
    clave: 'recomendaciones',
    nombre: 'Recomendaciones',
    singular: 'recomendación',
    descripcion: 'Consultar y mantener recomendaciones de las usuarias.',
    id: 'idRecomendacion',
    campos: [
      usuario,
      relacion('idRutina', 'Rutina relacionada (opcional)', 'rutinas', false),
      texto('tipo', 'Tipo', 50, true),
      {
        clave: 'contenido',
        etiqueta: 'Contenido',
        tipo: 'textarea',
        requerido: true,
        maxLongitud: 1000000,
      },
      { clave: 'motivo', etiqueta: 'Motivo', tipo: 'textarea', maxLongitud: 1000000 },
      { clave: 'aceptada', etiqueta: 'Aceptada', tipo: 'checkbox' },
    ],
    columnas: [
      columna('fecha', 'Fecha'),
      columna('tipo', 'Tipo'),
      columna('idRutina', 'Rutina'),
      columna('aceptada', 'Aceptada'),
    ],
    nota: 'Este formulario permite mantenimiento manual; no ejecuta el generador de IA. Una rutina relacionada debe pertenecer a la misma usuaria.',
  },
];
