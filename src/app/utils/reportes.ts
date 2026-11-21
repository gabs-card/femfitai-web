import type { GraficoReporte, RegistroReporte, TipoReporte } from '../models/ReporteDTO';
import { contarPorCategoria, DatoGrafico } from './estadisticas';

const texto = (dato: unknown) => (typeof dato === 'string' ? dato : null);
export function fechaReporte(valor: unknown): string | null {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}(T|$)/.test(valor)) return null;
  const dia = valor.slice(0, 10),
    tiempo = Date.parse(dia + 'T00:00:00Z');
  return Number.isFinite(tiempo) && new Date(tiempo).toISOString().slice(0, 10) === dia
    ? dia
    : null;
}
export function agruparValores(
  registros: RegistroReporte[],
  categoria: (r: RegistroReporte) => string | null,
  valor: (r: RegistroReporte) => unknown,
  promedio = false,
): { datos: DatoGrafico[]; omitidos: number } {
  const grupos = new Map<string, { total: number; cantidad: number }>();
  let omitidos = 0;
  for (const registro of registros) {
    const etiqueta = categoria(registro),
      numero = valor(registro);
    if (!etiqueta || typeof numero !== 'number' || !Number.isFinite(numero) || numero < 0) {
      omitidos++;
      continue;
    }
    const grupo = grupos.get(etiqueta) ?? { total: 0, cantidad: 0 };
    grupo.total += numero;
    grupo.cantidad++;
    grupos.set(etiqueta, grupo);
  }
  return {
    omitidos,
    datos: [...grupos]
      .sort(([a], [b]) => a.localeCompare(b, 'es'))
      .map(([etiqueta, g]) => ({
        etiqueta: promedio ? `${etiqueta} (n=${g.cantidad})` : etiqueta,
        valor: Math.round((promedio ? g.total / g.cantidad : g.total) * 100) / 100,
      })),
  };
}
export function graficosReporte(tipo: TipoReporte, registros: RegistroReporte[]): GraficoReporte[] {
  const categoria = (titulo: string, campo: string, nota = ''): GraficoReporte => ({
    titulo,
    unidad: 'Registros',
    nota,
    omitidos: 0,
    datos: contarPorCategoria(registros, (r) => texto(r[campo])),
  });
  const numeros = (
    titulo: string,
    unidad: string,
    campo: string,
    clave: string,
    promedio = false,
    nota = '',
  ): GraficoReporte => ({
    titulo,
    unidad,
    nota,
    ...agruparValores(
      registros,
      (r) => (clave === 'fecha' ? fechaReporte(r['fecha']) : texto(r[clave])),
      (r) => r[campo],
      promedio,
    ),
  });
  const fechas = (titulo: string, campo = 'fecha'): GraficoReporte => ({
    titulo,
    unidad: 'Registros',
    nota: 'Fechas registradas, sin completar días sin datos.',
    ...agruparValores(
      registros,
      (r) => fechaReporte(r[campo]),
      () => 1,
    ),
  });
  switch (tipo) {
    case 'ciclos':
      return [
        {
          titulo: 'Estado de los ciclos',
          unidad: 'Ciclos',
          nota: 'La fecha estimada no se utiliza como cierre real.',
          omitidos: 0,
          datos: contarPorCategoria(registros, (r) => (r['fechaReal'] ? 'Cerrados' : 'Abiertos')),
        },
        {
          titulo: 'Duración de ciclos cerrados',
          unidad: 'Días transcurridos',
          nota: 'Diferencia entre inicio y cierre real. Se excluyen ciclos abiertos y fechas inválidas.',
          ...agruparValores(
            registros,
            (r) => (r['idCiclo'] != null ? `Ciclo #${r['idCiclo']}` : null),
            (r) => {
              const inicio = fechaReporte(r['fechaInicio']),
                fin = fechaReporte(r['fechaReal']);
              return inicio && fin ? (Date.parse(fin) - Date.parse(inicio)) / 86400000 : null;
            },
          ),
        },
      ];
    case 'detalle-diario':
      return [
        numeros(
          'Energía registrada por fecha',
          'Nivel de energía (1–5)',
          'nivelEnergia',
          'fecha',
          true,
          'Promedio de registros disponibles por fecha; n indica cuántos se incluyen. No estima energía ausente.',
        ),
        categoria(
          'Fases registradas',
          'faseRegistrada',
          'Fases declaradas en el diario; no se estiman fases ni diagnósticos.',
        ),
      ];
    case 'rutinas':
      return [
        {
          titulo: 'Estado de las rutinas',
          unidad: 'Rutinas',
          nota: 'Estado actual de los planes.',
          omitidos: 0,
          datos: contarPorCategoria(registros, (r) =>
            r['estado'] === true ? 'Activas' : r['estado'] === false ? 'Inactivas' : 'Sin estado',
          ),
        },
        categoria('Rutinas por nivel', 'nivel'),
        categoria('Rutinas por objetivo', 'objetivo'),
      ];
    case 'rutina-ejercicios':
      return [
        numeros('Series planificadas por ejercicio', 'Series', 'series', 'nombreEjercicio'),
        categoria(
          'Asignaciones por grupo muscular',
          'grupoMuscular',
          'Cuenta asignaciones; un ejercicio puede aparecer en más de una rutina.',
        ),
      ];
    case 'sesiones':
      return [
        fechas('Sesiones por fecha'),
        categoria('Sesiones por estado', 'estado'),
        numeros(
          'Tiempo registrado por fecha',
          'Minutos',
          'duracionMin',
          'fecha',
          false,
          'Solo suma duraciones disponibles; una sesión sin duración no equivale a cero minutos.',
        ),
      ];
    case 'detalle-sesion':
      return [
        categoria('Ejercicios registrados en sesiones', 'nombreEjercicio'),
        categoria('Registros por grupo muscular', 'grupoMuscular'),
      ];
    case 'detalle-serie':
      return [
        {
          titulo: 'Series registradas por ejercicio',
          unidad: 'Series',
          nota: 'Series efectivamente guardadas; no son las series planificadas.',
          omitidos: 0,
          datos: contarPorCategoria(registros, (r) => texto(r['nombreEjercicio'])),
        },
        numeros(
          'Repeticiones realizadas por ejercicio',
          'Repeticiones',
          'repeticiones',
          'nombreEjercicio',
        ),
      ];
    case 'progreso':
      return [
        fechas('Mediciones por fecha'),
        {
          titulo: 'Disponibilidad de medidas opcionales',
          unidad: 'Mediciones',
          nota: 'Los valores ausentes no se convierten en cero.',
          omitidos: 0,
          datos: contarPorCategoria(registros, (r) =>
            typeof r['medidaOpcional'] === 'number' && Number.isFinite(r['medidaOpcional'])
              ? 'Con medida opcional'
              : 'Sin medida opcional',
          ),
        },
      ];
    case 'perfiles':
      return [
        categoria('Perfiles por nivel', 'nivelEntrenamiento'),
        categoria('Objetivos registrados', 'objetivoPrincipal'),
        {
          titulo: 'Disponibilidad semanal',
          unidad: 'Perfiles',
          nota: 'Distribución según días disponibles; no inventa un calendario de entrenamiento.',
          omitidos: 0,
          datos: contarPorCategoria(registros, (r) =>
            typeof r['diasDisponibles'] === 'number'
              ? `${r['diasDisponibles']} días`
              : 'Sin registrar',
          ),
        },
      ];
    case 'recomendaciones':
      return [
        {
          titulo: 'Aceptación de recomendaciones',
          unidad: 'Recomendaciones',
          nota: 'Estado guardado de aceptación; no mide eficacia.',
          omitidos: 0,
          datos: contarPorCategoria(registros, (r) =>
            r['aceptada'] === true
              ? 'Aceptadas'
              : r['aceptada'] === false
                ? 'Pendientes'
                : 'Sin estado',
          ),
        },
        categoria('Recomendaciones por tipo', 'tipo'),
        fechas('Recomendaciones por fecha'),
      ];
    case 'catalogo':
      return [
        categoria('Ejercicios por tipo', 'tipo'),
        categoria('Catálogo por grupo muscular', 'grupoMuscular'),
      ];
  }
}
