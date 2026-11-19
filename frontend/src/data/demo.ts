/**
 * Datos de muestra del modo demo. Todo es ficticio.
 *
 * Para editarlos:
 * - Los `id` son strings únicos; los `slug` van en las URL y también deben ser únicos.
 * - `merchantId` y `categoryId` apuntan a un `id` de las listas de abajo.
 * - `price` va en quetzales (59.9 = Q59.90).
 * - `imageUrl` es una ruta dentro de `public/` (o una URL absoluta).
 *
 * `npm test` revisa que las referencias y las imágenes existan.
 */
import type { Category, Merchant, Product } from '../types.ts'

export const categories: Category[] = [
  { id: 'cat-01', slug: 'hogar', name: 'Hogar y cocina' },
  { id: 'cat-02', slug: 'tecnologia', name: 'Tecnología' },
  { id: 'cat-03', slug: 'moda', name: 'Moda y accesorios' },
  { id: 'cat-04', slug: 'juguetes', name: 'Juguetes' },
  { id: 'cat-05', slug: 'belleza', name: 'Belleza' },
]

export const merchants: Merchant[] = [
  {
    id: 'mer-01',
    slug: 'almacen-don-chepe',
    name: 'Almacén Don Chepe',
    description:
      'Almacén familiar con artículos para la cocina y la casa. Atiende en mostrador desde hace más de veinte años y recibe mercadería nueva cada semana.',
    location: 'Zona 1, Ciudad de Guatemala',
  },
  {
    id: 'mer-02',
    slug: 'variedades-la-bendicion',
    name: 'Variedades La Bendición',
    description:
      'Tienda de variedades con mochilas, accesorios y artículos de cuidado personal para toda la familia.',
    location: 'Antigua Guatemala, Sacatepéquez',
  },
  {
    id: 'mer-03',
    slug: 'importaciones-tikal',
    name: 'Importaciones Tikal',
    description:
      'Importadora de accesorios de tecnología y novedades. Prueba cada producto antes de entregarlo.',
    location: 'Zona 3, Quetzaltenango',
  },
]

export const products: Product[] = [
  {
    id: 'prd-001',
    slug: 'licuadora-vaso-de-vidrio-600w',
    name: 'Licuadora con vaso de vidrio 600 W',
    description:
      'Licuadora de tres velocidades con pulso. El vaso de vidrio de 1.5 litros resiste bebidas calientes y las cuchillas se desmontan para lavarlas.',
    price: 349,
    imageUrl: '/demo/products/licuadora.svg',
    merchantId: 'mer-01',
    categoryId: 'cat-01',
    featured: true,
  },
  {
    id: 'prd-002',
    slug: 'juego-de-ollas-antiadherentes-5-piezas',
    name: 'Juego de ollas antiadherentes, 5 piezas',
    description:
      'Dos ollas con tapa y un sartén con recubrimiento antiadherente. Sirven en estufa de gas y eléctrica.',
    price: 425,
    imageUrl: '/demo/products/juego-de-ollas.svg',
    merchantId: 'mer-01',
    categoryId: 'cat-01',
    featured: true,
  },
  {
    id: 'prd-003',
    slug: 'organizador-de-cocina-dos-niveles',
    name: 'Organizador de cocina de dos niveles',
    description:
      'Estante metálico de dos niveles para especias, frascos y trastos. Se arma sin herramientas.',
    price: 129.9,
    imageUrl: '/demo/products/organizador-de-cocina.svg',
    merchantId: 'mer-01',
    categoryId: 'cat-01',
    featured: false,
  },
  {
    id: 'prd-004',
    slug: 'lampara-led-de-escritorio',
    name: 'Lámpara LED de escritorio',
    description:
      'Lámpara con brazo articulado y tres tonos de luz. Se conecta por USB y se regula con un botón táctil.',
    price: 149,
    imageUrl: '/demo/products/lampara-led.svg',
    merchantId: 'mer-01',
    categoryId: 'cat-01',
    featured: false,
  },
  {
    id: 'prd-005',
    slug: 'secadora-de-pelo-1800w',
    name: 'Secadora de pelo 1800 W',
    description:
      'Secadora con dos velocidades, tres temperaturas y golpe de aire frío. Incluye boquilla concentradora.',
    price: 189,
    imageUrl: '/demo/products/secadora-de-pelo.svg',
    merchantId: 'mer-01',
    categoryId: 'cat-05',
    featured: false,
  },
  {
    id: 'prd-006',
    slug: 'rompecabezas-500-piezas',
    name: 'Rompecabezas de 500 piezas',
    description:
      'Rompecabezas de cartón grueso para armar en familia. Armado mide 48 por 34 centímetros.',
    price: 75,
    imageUrl: '/demo/products/rompecabezas-500-piezas.svg',
    merchantId: 'mer-01',
    categoryId: 'cat-04',
    featured: false,
  },
  {
    id: 'prd-007',
    slug: 'mochila-urbana-impermeable',
    name: 'Mochila urbana impermeable',
    description:
      'Mochila de 22 litros con compartimento acolchado para computadora de hasta 15 pulgadas y bolsa frontal con zíper.',
    price: 215,
    imageUrl: '/demo/products/mochila-urbana.svg',
    merchantId: 'mer-02',
    categoryId: 'cat-03',
    featured: true,
  },
  {
    id: 'prd-008',
    slug: 'gorra-bordada',
    name: 'Gorra bordada',
    description: 'Gorra de algodón con bordado al frente y cierre ajustable en la parte de atrás.',
    price: 65,
    imageUrl: '/demo/products/gorra-bordada.svg',
    merchantId: 'mer-02',
    categoryId: 'cat-03',
    featured: false,
  },
  {
    id: 'prd-009',
    slug: 'billetera-de-cuero',
    name: 'Billetera de cuero',
    description:
      'Billetera de cuero cosida a mano, con ocho espacios para tarjetas, monedero y broche.',
    price: 119.5,
    imageUrl: '/demo/products/billetera-de-cuero.svg',
    merchantId: 'mer-02',
    categoryId: 'cat-03',
    featured: false,
  },
  {
    id: 'prd-010',
    slug: 'lentes-de-sol-polarizados',
    name: 'Lentes de sol polarizados',
    description: 'Lentes con protección UV400 y aro liviano. Incluyen estuche y paño de limpieza.',
    price: 95,
    imageUrl: '/demo/products/lentes-de-sol.svg',
    merchantId: 'mer-02',
    categoryId: 'cat-03',
    featured: true,
  },
  {
    id: 'prd-011',
    slug: 'set-de-brochas-de-maquillaje-8-piezas',
    name: 'Set de brochas de maquillaje, 8 piezas',
    description: 'Ocho brochas de cerdas sintéticas para rostro y ojos, con estuche para viaje.',
    price: 89,
    imageUrl: '/demo/products/set-de-brochas.svg',
    merchantId: 'mer-02',
    categoryId: 'cat-05',
    featured: false,
  },
  {
    id: 'prd-012',
    slug: 'audifonos-inalambricos-bluetooth',
    name: 'Audífonos inalámbricos Bluetooth',
    description:
      'Audífonos de diadema con micrófono y hasta 20 horas de batería. Se doblan para guardarlos.',
    price: 199,
    imageUrl: '/demo/products/audifonos-bluetooth.svg',
    merchantId: 'mer-03',
    categoryId: 'cat-02',
    featured: true,
  },
  {
    id: 'prd-013',
    slug: 'cargador-rapido-usb-c-20w',
    name: 'Cargador rápido USB-C de 20 W',
    description: 'Cargador de pared con carga rápida. Incluye cable USB-C de un metro.',
    price: 59.9,
    imageUrl: '/demo/products/cargador-usb-c.svg',
    merchantId: 'mer-03',
    categoryId: 'cat-02',
    featured: false,
  },
  {
    id: 'prd-014',
    slug: 'bocina-bluetooth-portatil',
    name: 'Bocina Bluetooth portátil',
    description:
      'Bocina resistente a salpicaduras con 12 horas de batería, radio FM y entrada para memoria USB.',
    price: 259,
    imageUrl: '/demo/products/bocina-bluetooth.svg',
    merchantId: 'mer-03',
    categoryId: 'cat-02',
    featured: true,
  },
  {
    id: 'prd-015',
    slug: 'soporte-ajustable-para-celular',
    name: 'Soporte ajustable para celular',
    description:
      'Soporte de escritorio con altura y ángulo ajustables. Sirve para celulares y tabletas pequeñas.',
    price: 45,
    imageUrl: '/demo/products/soporte-para-celular.svg',
    merchantId: 'mer-03',
    categoryId: 'cat-02',
    featured: false,
  },
  {
    id: 'prd-016',
    slug: 'carro-a-control-remoto',
    name: 'Carro a control remoto',
    description:
      'Carro con batería recargable y control de cuatro direcciones. Recomendado a partir de los 6 años.',
    price: 175,
    imageUrl: '/demo/products/carro-control-remoto.svg',
    merchantId: 'mer-03',
    categoryId: 'cat-04',
    featured: false,
  },
]
