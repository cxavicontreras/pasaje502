import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import { NotFoundError } from '../src/api/dataSource.ts'
import { createDemoSource, filterDemoProducts } from '../src/api/demoSource.ts'
import { categories, merchants, products } from '../src/data/demo.ts'

const slugs = (list: { slug: string }[]) => list.map((item) => item.slug).sort()

describe('datos de muestra', () => {
  it('tiene 16 productos de tres comercios', () => {
    assert.equal(products.length, 16)
    assert.equal(merchants.length, 3)
    assert.equal(new Set(products.map((product) => product.merchantId)).size, 3)
  })

  it('no repite ids ni slugs', () => {
    for (const list of [categories, merchants, products]) {
      assert.equal(new Set(list.map((item) => item.id)).size, list.length)
      assert.equal(new Set(list.map((item) => item.slug)).size, list.length)
    }
  })

  it('cada producto apunta a un comercio, una categoría y una imagen local que existen', () => {
    const publicDir = join(import.meta.dirname, '..', 'public')
    for (const product of products) {
      assert.ok(
        merchants.some((merchant) => merchant.id === product.merchantId),
        `${product.slug}: comercio inexistente`,
      )
      assert.ok(
        categories.some((category) => category.id === product.categoryId),
        `${product.slug}: categoría inexistente`,
      )
      assert.ok(
        existsSync(join(publicDir, product.imageUrl)),
        `${product.slug}: falta ${product.imageUrl}`,
      )
      assert.ok(Number.isFinite(product.price) && product.price > 0, `${product.slug}: precio`)
    }
  })
})

describe('filtros de productos (contrato de GET /api/products)', () => {
  it('sin filtros devuelve todo', () => {
    assert.equal(filterDemoProducts().length, products.length)
    assert.equal(filterDemoProducts({}).length, products.length)
  })

  it('q busca coincidencias parciales en el nombre, sin distinguir mayúsculas ni tildes', () => {
    assert.deepEqual(slugs(filterDemoProducts({ q: 'AUDIFONOS' })), [
      'audifonos-inalambricos-bluetooth',
    ])
    assert.deepEqual(slugs(filterDemoProducts({ q: 'lámpara' })), ['lampara-led-de-escritorio'])
    assert.deepEqual(slugs(filterDemoProducts({ q: '  blue  ' })), [
      'audifonos-inalambricos-bluetooth',
      'bocina-bluetooth-portatil',
    ])
  })

  it('q también busca en el nombre del comercio', () => {
    const found = filterDemoProducts({ q: 'bendicion' })
    assert.equal(found.length, 5)
    assert.ok(found.every((product) => product.merchantId === 'mer-02'))
  })

  it('category y merchant reciben slugs', () => {
    assert.equal(filterDemoProducts({ category: 'tecnologia' }).length, 4)
    assert.equal(filterDemoProducts({ merchant: 'almacen-don-chepe' }).length, 6)
    assert.deepEqual(filterDemoProducts({ category: 'cat-02' }), [])
    assert.deepEqual(filterDemoProducts({ merchant: 'no-existe' }), [])
  })

  it('los límites de precio son inclusivos', () => {
    assert.deepEqual(slugs(filterDemoProducts({ minPrice: 59.9, maxPrice: 59.9 })), [
      'cargador-rapido-usb-c-20w',
    ])
    assert.deepEqual(slugs(filterDemoProducts({ minPrice: 349 })), [
      'juego-de-ollas-antiadherentes-5-piezas',
      'licuadora-vaso-de-vidrio-600w',
    ])
    assert.deepEqual(slugs(filterDemoProducts({ maxPrice: 59.9 })), [
      'cargador-rapido-usb-c-20w',
      'soporte-ajustable-para-celular',
    ])
  })

  it('los filtros se combinan', () => {
    assert.deepEqual(slugs(filterDemoProducts({ category: 'belleza', merchant: 'almacen-don-chepe' })), [
      'secadora-de-pelo-1800w',
    ])
    assert.deepEqual(
      slugs(filterDemoProducts({ q: 'almacen', category: 'hogar', minPrice: 100, maxPrice: 200 })),
      ['lampara-led-de-escritorio', 'organizador-de-cocina-dos-niveles'],
    )
  })

  it('una combinación sin coincidencias devuelve una lista vacía', () => {
    assert.deepEqual(filterDemoProducts({ category: 'tecnologia', merchant: 'almacen-don-chepe' }), [])
    assert.deepEqual(filterDemoProducts({ q: 'zzz' }), [])
    assert.deepEqual(filterDemoProducts({ minPrice: 500, maxPrice: 100 }), [])
  })
})

describe('origen de datos de demo', () => {
  const source = createDemoSource(0)

  it('devuelve categorías, comercios y productos', async () => {
    assert.equal((await source.getCategories()).length, categories.length)
    assert.equal((await source.getMerchants()).length, merchants.length)
    assert.equal((await source.getProducts({ merchant: 'importaciones-tikal' })).length, 5)
  })

  it('busca un producto y un comercio por slug', async () => {
    assert.equal((await source.getProduct('gorra-bordada')).name, 'Gorra bordada')
    assert.equal((await source.getMerchant('importaciones-tikal')).name, 'Importaciones Tikal')
  })

  it('un slug inexistente falla con NotFoundError, como el 404 del contrato', async () => {
    await assert.rejects(source.getProduct('no-existe'), NotFoundError)
    await assert.rejects(source.getMerchant('no-existe'), NotFoundError)
  })

  it('entrega copias: modificar la respuesta no altera los datos de muestra', async () => {
    const [first] = await source.getProducts()
    first.name = 'Cambiado'
    assert.notEqual(products[0].name, 'Cambiado')
  })

  it('respeta la cancelación de la petición', async () => {
    const controller = new AbortController()
    const pending = createDemoSource(50).getProducts({}, controller.signal)
    controller.abort()
    await assert.rejects(pending, { name: 'AbortError' })
  })
})
