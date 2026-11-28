export function urlImagenSegura(valor: string | null | undefined): string {
  const texto = typeof valor === 'string' ? valor.trim() : '';
  if (!texto || texto.length > 2048 || !/^https:\/\//i.test(texto) || /[\u0000-\u0020\u007f]/.test(texto)) return '';
  try {
    const url = new URL(texto);
    return url.protocol === 'https:' && url.hostname && !url.username && !url.password && !url.hash
      ? texto : '';
  } catch {
    return '';
  }
}
