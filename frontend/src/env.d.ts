interface ImportMetaEnv {
  /** Origen de datos: "demo" o "api". */
  readonly VITE_DATA_MODE?: string
  /** Origen del backend en modo API, sin la ruta /api. Vacío = mismo origen que el frontend. */
  readonly VITE_API_BASE_URL?: string
}
