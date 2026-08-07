export const MATERIAL_UNITS = [
  { value: '', label: 'sin unidad' },
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

export const FIXED_COST_FREQUENCIES = [
  { value: 'daily', label: 'Diario', days: 1 },
  { value: 'weekly', label: 'Semanal', days: 7 },
  { value: 'monthly', label: 'Mensual', days: 30 },
  { value: 'yearly', label: 'Anual', days: 365 },
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
  if (!normalized) return ''
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

export function formatMoney(value, minimumSignificantDigits=undefined) {
  let options = {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }
  if (minimumSignificantDigits) options = {
    ...options,
    maximumSignificantDigits: 4,
    minimumSignificantDigits,
  }
  return new Intl.NumberFormat('es-CO', options).format(Number(value) || 0) 
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

export function getProductCost(product, materials) {
  return Object.entries(product.materials || {}).reduce((sum, [materialId, item]) => {
    const material = materials.find((m) => m.id === materialId)
    return sum + (material ? Number(material.avgCost || 0) * Number(item.quantity || 1) : 0)
  }, 0)
}

export function getProductMargins(product, materials) {
  const cost = getProductCost(product, materials)
  return {
    cost,
    price: cost * 1.35,
    margin: ((cost * 1.35 - cost) / cost) * 100,
  }
}

export function calculateFixedCostTotal(fixedCost) {
  const cost = Number(fixedCost.cost || 0)
  const startDate = fixedCost.startDate
  const endDate = fixedCost.endDate
  const frequency = fixedCost.frequency || 'monthly'

  if (!startDate || cost <= 0) return 0

  const freq = FIXED_COST_FREQUENCIES.find((f) => f.value === frequency)
  const intervalDays = freq?.days || 30

  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date()

  if (end < start) return 0

  const diffMs = end.getTime() - start.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  const intervals = Math.floor(diffDays / intervalDays) + 1

  return intervals * cost
}

export function getActiveEmployeeEntry(timeline, date) {
  if (!timeline || !timeline.length) return { employeeCount: 0, profitShare: 0 }
  const sorted = [...timeline].sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''))
  const target = date || new Date().toISOString().slice(0, 10)
  let active = sorted[0]
  for (const entry of sorted) {
    if ((entry.startDate || '') <= target) active = entry
    else break
  }
  return { employeeCount: Number(active.employeeCount || 0), profitShare: Number(active.profitShare || 0) }
}
