export class Page<T> {
  content: T[] = [];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  page?: { size: number; number: number; totalElements: number; totalPages: number };
}