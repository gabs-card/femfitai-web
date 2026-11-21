import type { ProgresoDTO } from '../models/ProgresoDTO';

export type MedicionProgreso = 'pesoKg' | 'medidaOpcional';

export interface PuntoProgreso {
  id: number;
  fecha: string;
  fechaCorta: string;
  valor: number;
  x: number;
  y: number;
}

export interface GraficoProgreso {
  puntos: PuntoProgreso[];
  linea: string;
  ejeVertical: { valor: number; y: number }[];
  ejeHorizontal: { etiqueta: string; x: number }[];
  omitidos: number;
}

function fechaValida(fecha: string | null): number | null {
  if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return null;
  const tiempo = Date.parse(`${fecha}T00:00:00Z`);
  if (!Number.isFinite(tiempo) || new Date(tiempo).toISOString().slice(0, 10) !== fecha) return null;
  return tiempo;
}

export function crearGraficoProgreso(
  registros: readonly ProgresoDTO[],
  medicion: MedicionProgreso,
): GraficoProgreso {
  const datos = registros.flatMap((registro) => {
    const tiempo = fechaValida(registro.fecha);
    const valor = registro[medicion];
    if (tiempo === null || typeof valor !== 'number' || !Number.isFinite(valor) || valor <= 0) return [];
    return [{ registro, tiempo, valor }];
  }).sort((a, b) => a.tiempo - b.tiempo || a.registro.idProgreso - b.registro.idProgreso);

  if (datos.length === 0) {
    return { puntos: [], linea: '', ejeVertical: [], ejeHorizontal: [], omitidos: registros.length };
  }

  const valores = datos.map((dato) => dato.valor);
  const minimo = Math.min(...valores);
  const maximo = Math.max(...valores);
  const margen = Math.max((maximo - minimo) * 0.15, 1);
  const inicioEscala = Math.max(0, Math.floor((minimo - margen) * 10) / 10);
  const finEscala = Math.ceil((maximo + margen) * 10) / 10;
  const primeraFecha = datos[0].tiempo;
  const ultimaFecha = datos[datos.length - 1].tiempo;

  const puntos = datos.map(({ registro, tiempo, valor }) => ({
    id: registro.idProgreso,
    fecha: registro.fecha!,
    fechaCorta: registro.fecha!.split('-').reverse().slice(0, 2).join('/'),
    valor,
    x: ultimaFecha === primeraFecha ? 398 : 60 + (tiempo - primeraFecha) / (ultimaFecha - primeraFecha) * 676,
    y: 228 - (valor - inicioEscala) / (finEscala - inicioEscala) * 204,
  }));
  const ejeVertical = Array.from({ length: 5 }, (_, indice) => ({
    valor: Math.round((finEscala - (finEscala - inicioEscala) * indice / 4) * 100) / 100,
    y: 24 + indice * 51,
  }));
  const indices = primeraFecha === ultimaFecha
    ? [0]
    : [...new Set([0, Math.floor((puntos.length - 1) / 2), puntos.length - 1])];
  const ejeHorizontal = indices.map((indice) => ({ etiqueta: puntos[indice].fechaCorta, x: puntos[indice].x }))
    .filter((marca, indice, marcas) => indice === 0 || marca.x - marcas[indice - 1].x >= 80);

  return {
    puntos,
    linea: puntos.map((punto) => `${punto.x},${punto.y}`).join(' '),
    ejeVertical,
    ejeHorizontal,
    omitidos: registros.length - puntos.length,
  };
}
