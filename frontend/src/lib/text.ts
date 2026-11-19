/**
 * Deja el texto en minúsculas, sin tildes y con espacios simples,
 * para comparar como lo pide el contrato de búsqueda ("licua" encuentra "Licuadora", "audifonos" encuentra "Audífonos").
 */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}
