import { formatAmount, formatPrice } from '../lib/format.ts'

/** Precio en quetzales. Los lectores de pantalla escuchan "349.00 quetzales" en vez de "Q349.00". */
export function Price({ value }: { value: number }) {
  return (
    <>
      <span aria-hidden="true">{formatPrice(value)}</span>
      <span className="visually-hidden">{formatAmount(value)} quetzales</span>
    </>
  )
}
