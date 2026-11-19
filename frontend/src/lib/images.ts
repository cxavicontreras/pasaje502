const ABSOLUTE_URL = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i

/**
 * Resuelve el `imageUrl` del contrato: las URL absolutas pasan igual
 * y las rutas relativas se cuelgan de la raíz del frontend (`baseUrl`).
 */
export function resolveImageUrl(imageUrl: string, baseUrl: string): string {
  const value = imageUrl.trim()
  if (!value || ABSOLUTE_URL.test(value)) return value
  return `${baseUrl.replace(/\/+$/, '')}/${value.replace(/^\/+/, '')}`
}
