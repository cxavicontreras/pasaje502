export type DataMode = 'demo' | 'api'

const rawMode = import.meta.env.VITE_DATA_MODE?.trim()

/** Valor de VITE_DATA_MODE tal como llegó, para mostrarlo si es inválido. */
export const rawDataMode: string = rawMode ?? ''

/** `null` si VITE_DATA_MODE falta o no es válido: la app lo avisa en vez de adivinar un modo. */
export const dataMode: DataMode | null = rawMode === 'demo' || rawMode === 'api' ? rawMode : null

export const apiBaseUrl: string = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''
