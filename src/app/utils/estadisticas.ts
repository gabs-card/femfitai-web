import type { UsuarioDTO } from '../models/UsuarioDTO';
import type { EjercicioDTO } from '../models/EjercicioDTO';

export interface DatoGrafico {
  etiqueta: string;
  valor: number;
}

export function contarPorCategoria<T>(
  registros: readonly T[],
  categoria: (registro: T) => string | null | undefined,
): DatoGrafico[] {
  const grupos = new Map<string, number>();
  for (const registro of registros) {
    const etiqueta = categoria(registro)?.trim() || 'Sin especificar';
    grupos.set(etiqueta, (grupos.get(etiqueta) ?? 0) + 1);
  }
  return [...grupos]
    .map(([etiqueta, valor]) => ({ etiqueta, valor }))
    .sort((a, b) => b.valor - a.valor || a.etiqueta.localeCompare(b.etiqueta, 'es'));
}

export function registrosPorMes(usuarios: readonly UsuarioDTO[]): DatoGrafico[] {
  const grupos = new Map<string, number>();
  for (const usuario of usuarios) {
    const fecha = usuario.fechaRegistro;
    if (!fecha || !/^\d{4}-(0[1-9]|1[0-2])-\d{2}(T|$)/.test(fecha)) continue;
    const dia = fecha.slice(0, 10);
    const tiempo = Date.parse(dia + 'T00:00:00Z');
    if (!Number.isFinite(tiempo) || new Date(tiempo).toISOString().slice(0, 10) !== dia) continue;
    const mes = fecha.slice(0, 7);
    grupos.set(mes, (grupos.get(mes) ?? 0) + 1);
  }
  return [...grupos]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([etiqueta, valor]) => ({ etiqueta, valor }));
}

export function ejerciciosPorTipo(ejercicios: readonly EjercicioDTO[]): DatoGrafico[] {
  return contarPorCategoria(ejercicios, (ejercicio) => ejercicio.tipo);
}
