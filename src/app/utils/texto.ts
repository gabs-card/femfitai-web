export function decodificarHtml(texto: string | null | undefined): string {
  if (!texto) return '';
  const el = document.createElement('textarea');
  el.innerHTML = texto;
  return el.value;
}