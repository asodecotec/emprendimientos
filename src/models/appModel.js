export const MATERIAL_UNITS = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'mg', label: 'mg' },
  { value: 'm', label: 'm' },
  { value: 'km', label: 'km' },
  { value: 'cm', label: 'cm' },
  { value: 'mm', label: 'mm' },
  { value: 'l', label: 'l' },
  { value: 'ml', label: 'ml' },
  { value: 'ud', label: 'ud' },
  { value: 'u', label: 'u' },
  { value: 'lb', label: 'lb' },
  { value: 'oz', label: 'oz' },
]

const UNIT_ALIASES = {
  kg: ['kg', 'kilo', 'kilos', 'kilogramo', 'kilogramos'],
  g: ['g', 'gr', 'gramo', 'gramos'],
  mg: ['mg', 'miligramo', 'miligramo'],
  m: ['m', 'metro', 'metros'],
  km: ['km', 'kilometro', 'kilometros'],
  cm: ['cm', 'centimetro', 'centimetros'],
  mm: ['mm', 'milimetro', 'milimetros'],
  l: ['l', 'litro', 'litros'],
  ml: ['ml', 'mililitro', 'mililitros'],
  ud: ['ud', 'unidad', 'unidades', 'u', 'unid'],
  lb: ['lb', 'libra', 'libras'],
  oz: ['oz', 'onza', 'onzas'],
}

const BASE_UNIT_FACTORS = {
  kg: 1,
  g: 0.001,
  mg: 0.000001,
  m: 1,
  km: 1000,
  cm: 0.01,
  mm: 0.001,
  l: 1,
  ml: 0.001,
  ud: null,
  lb: 0.45359237,
  oz: 0.0283495231,
}

function normalizeUnit(unit) {
  const normalized = String(unit || '').trim().toLocaleLowerCase('es-419')
  if (!normalized) return 'ud'
  for (const [canonical, aliases] of Object.entries(UNIT_ALIASES)) {
    if (aliases.includes(normalized)) return canonical
  }
  return normalized
}

export function convertQuantity(value, fromUnit, toUnit) {
  const parsedValue = Number(value)
  if (!Number.isFinite(parsedValue)) return 0
  const normalizedFrom = normalizeUnit(fromUnit)
  const normalizedTo = normalizeUnit(toUnit)
  if (!normalizedFrom || !normalizedTo || normalizedFrom === normalizedTo) return parsedValue

  const fromBase = BASE_UNIT_FACTORS[normalizedFrom]
  const toBase = BASE_UNIT_FACTORS[normalizedTo]
  if (fromBase == null || toBase == null) return parsedValue
  if (fromBase === null || toBase === null) return parsedValue

  return parsedValue * fromBase / toBase
}

export const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
  { key: 'ventures', label: 'Emprendimientos', icon: 'store' },
  { key: 'finance', label: 'Finanzas', icon: 'landmark' },
  { key: 'inventory', label: 'Inventario', icon: 'boxes' },
  { key: 'purchases', label: 'Compras', icon: 'shopping-cart' },
  { key: 'products', label: 'Productos', icon: 'package' },
  { key: 'sales', label: 'Ventas', icon: 'receipt' },
]

export const starterData = {
  ventures: [],
  materials: [],
  purchases: [],
  fixedCosts: [],
  products: [],
  sales: [],
}
// Starter data that can be used for testing
// export const starterData = {
//   ventures: [
//     { id: 'venture-1', name: 'Café de barrio', description: 'Emprendimiento de café y postres', products: 2 },
//     { id: 'venture-2', name: 'Tienda artesanal', description: 'Venta de productos hechos a mano', products: 1 },
//   ],
//   materials: [
//     { id: 'material-1', name: 'Café molido', unit: 'kg', cost: 14, ventureId: 'venture-1' },
//     { id: 'material-2', name: 'Azúcar', unit: 'kg', cost: 3.2, ventureId: 'venture-1' },
//     { id: 'material-3', name: 'Cuentas de madera', unit: 'ud', cost: 5, ventureId: 'venture-2' },
//   ],
//   purchases: [
//     { id: 'purchase-1', materialId: 'material-1', date: '2026-07-05', quantity: 25, cost: 350 },
//     { id: 'purchase-2', materialId: 'material-1', date: '2026-07-15', quantity: 15, cost: 210 },
//     { id: 'purchase-3', materialId: 'material-2', date: '2026-07-12', quantity: 25, cost: 80 },
//     { id: 'purchase-4', materialId: 'material-3', date: '2026-07-18', quantity: 50, cost: 250 },
//   ],
//   fixedCosts: [
//     { id: 'fixed-1', name: 'Alquiler', cost: 320, ventureId: 'venture-1' },
//     { id: 'fixed-2', name: 'Transporte', cost: 95, ventureId: 'venture-2' },
//   ],
//   products: [
//     { id: 'product-1', ventureId: 'venture-1', name: 'Combo clásico', description: 'Café + postre', cost: 48, materials: { 'material-1': { quantity: 1 }, 'material-2': { quantity: 2 } } },
//     { id: 'product-2', ventureId: 'venture-1', name: 'Especial frío', description: 'Bebida premium', cost: 61, materials: { 'material-1': { quantity: 2 } } },
//     { id: 'product-3', ventureId: 'venture-2', name: 'Pack artesanal', description: 'Kit de regalo', cost: 34, materials: { 'material-3': { quantity: 4 } } },
//   ],
//   sales: [
//     { id: 'sale-1', ventureId: 'venture-1', date: '2026-07-20', units: 6, amount: 360 },
//     { id: 'sale-2', ventureId: 'venture-2', date: '2026-07-22', units: 5, amount: 170 },
//   ],
// }

export function formatMoney(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)
}

export function formatNumber(value) {
  return new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}

export function createId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function normalize(value) {
  return String(value || '').trim().toLocaleLowerCase('es-419')
}

export function getProductCost(product, materials, fixedCosts) {
  const materialCost = Object.entries(product.materials || {}).reduce((sum, [materialId, item]) => {
    const material = materials.find((m) => m.id === materialId)
    return sum + (material ? Number(0) * Number(item.quantity || 1) : 0)
  }, 0)

  const fixedCostTotal = (product.fixedCostIds || []).reduce((sum, id) => {
    const fixedCost = fixedCosts.find((item) => item.id === id)
    return sum + (fixedCost ? Number(fixedCost.cost || 0) : 0)
  }, 0)

  return materialCost + fixedCostTotal + Number(product.cost || 0)
}

export function getProductMargins(product, materials, fixedCosts) {
  const cost = getProductCost(product, materials, fixedCosts)
  return {
    cost,
    price: cost * 1.35,
    margin: ((cost * 1.35 - cost) / cost) * 100,
  }
}
