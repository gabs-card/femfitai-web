import { EMPTY, Observable, expand, map, reduce } from 'rxjs';
import { Page } from '../models/Page';

// No se entrega un total parcial si una página falla o la respuesta es inconsistente.
export function recorrerPaginas<T>(
  solicitar: (pagina: number) => Observable<Page<T>>,
): Observable<T[]> {
  const pagina = (numero: number) =>
    solicitar(numero).pipe(
      map((respuesta) => {
        const total = respuesta.totalPages ?? respuesta.page?.totalPages;
        const actual = respuesta.number ?? respuesta.page?.number;
        if (
          !Array.isArray(respuesta.content) ||
          !Number.isInteger(total) ||
          total! < 0 ||
          actual !== numero ||
          (numero + 1 < total! && respuesta.content.length === 0)
        ) {
          throw new Error('La API no confirmó todas las páginas del reporte. Vuelve a cargar.');
        }
        return { respuesta, numero, total: total! };
      }),
    );
  return pagina(0).pipe(
    expand(({ numero, total }) => (numero + 1 < total ? pagina(numero + 1) : EMPTY), 1),
    reduce((todos, { respuesta }) => todos.concat(respuesta.content), [] as T[]),
  );
}
