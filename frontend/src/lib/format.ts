const amountFormat = new Intl.NumberFormat('es-GT', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Monto con dos decimales y separador de miles: 1,250.00 */
export function formatAmount(value: number): string {
  return amountFormat.format(value)
}

/** Precio en quetzales: Q1,250.00 */
export function formatPrice(value: number): string {
  return `Q${formatAmount(value)}`
}
