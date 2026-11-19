import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  catalogPath,
  filtersToSearchParams,
  hasRefinements,
  omitFilters,
  parseFilters,
  parsePrice,
} from '../src/lib/catalogFilters.ts'
import { formatPrice } from '../src/lib/format.ts'
import { resolveImageUrl } from '../src/lib/images.ts'
import { normalizeText } from '../src/lib/text.ts'

describe('filtros en la URL', () => {
  it('lee los filtros de la URL', () => {
    const params = new URLSearchParams(
      'q=+licua+&category=hogar&merchant=almacen-don-chepe&minPrice=50&maxPrice=199.9',
    )
    assert.deepEqual(parseFilters(params), {
      q: 'licua',
      category: 'hogar',
      merchant: 'almacen-don-chepe',
      minPrice: 50,
      maxPrice: 199.9,
    })
  })

  it('ignora valores vacíos o inválidos', () => {
    const params = new URLSearchParams('q=&category=&minPrice=abc&maxPrice=-5&otro=1')
    assert.deepEqual(parseFilters(params), {})
  })

  it('serializa y vuelve a leer sin perder nada', () => {
    const filters = { q: 'audífonos bluetooth', category: 'tecnologia', minPrice: 0, maxPrice: 59.9 }
    assert.deepEqual(parseFilters(filtersToSearchParams(filters)), filters)
  })

  it('arma la ruta del catálogo', () => {
    assert.equal(catalogPath(), '/productos')
    assert.equal(catalogPath({ q: 'gorra', maxPrice: 100 }), '/productos?q=gorra&maxPrice=100')
  })

  it('quita filtros sin tocar el original', () => {
    const filters = { q: 'gorra', category: 'moda', minPrice: 10 }
    assert.deepEqual(omitFilters(filters, 'category', 'minPrice'), { q: 'gorra' })
    assert.equal(filters.category, 'moda')
  })

  it('distingue la búsqueda por texto de los filtros', () => {
    assert.equal(hasRefinements({ q: 'gorra' }), false)
    assert.equal(hasRefinements({ minPrice: 0 }), true)
    assert.equal(hasRefinements({ merchant: 'x' }), true)
  })

  it('interpreta precios', () => {
    assert.equal(parsePrice('59.90'), 59.9)
    assert.equal(parsePrice('0'), 0)
    assert.equal(parsePrice(''), undefined)
    assert.equal(parsePrice(null), undefined)
    assert.equal(parsePrice('-1'), undefined)
    assert.equal(parsePrice('Q50'), undefined)
  })
})

describe('utilidades', () => {
  it('normaliza texto para comparar', () => {
    assert.equal(normalizeText('  Audífonos   INALÁMBRICOS '), 'audifonos inalambricos')
    assert.equal(normalizeText('Almacén Don Chepe'), 'almacen don chepe')
  })

  it('da formato a los precios en quetzales', () => {
    assert.equal(formatPrice(59.9), 'Q59.90')
    assert.equal(formatPrice(1250), 'Q1,250.00')
  })

  it('resuelve imageUrl absolutas y relativas a la raíz del frontend', () => {
    assert.equal(resolveImageUrl('/demo/products/a.svg', '/'), '/demo/products/a.svg')
    assert.equal(resolveImageUrl('demo/products/a.svg', '/'), '/demo/products/a.svg')
    assert.equal(resolveImageUrl('/demo/a.svg', '/tienda/'), '/tienda/demo/a.svg')
    assert.equal(resolveImageUrl('https://cdn.example.com/a.jpg', '/'), 'https://cdn.example.com/a.jpg')
    assert.equal(resolveImageUrl('//cdn.example.com/a.jpg', '/'), '//cdn.example.com/a.jpg')
    assert.equal(resolveImageUrl('', '/'), '')
  })
})
