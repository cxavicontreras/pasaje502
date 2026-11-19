export function productPath(slug: string): string {
  return `/productos/${encodeURIComponent(slug)}`
}

export function merchantPath(slug: string): string {
  return `/comercios/${encodeURIComponent(slug)}`
}
