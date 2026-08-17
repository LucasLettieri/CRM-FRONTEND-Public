export function formatearEstado(estado: string): string {
  return estado
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())//
}