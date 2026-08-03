export const NAV_ITEMS = [
  { key: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
  { key: 'ventures', path: '/ventures', label: 'Emprendimientos', icon: 'store' },
  { key: 'inventory', path: '/inventory', label: 'Inventario', icon: 'boxes' },
  { key: 'finance', path: '/finance', label: 'Finanzas', icon: 'landmark' },
  { key: 'sales', path: '/sales', label: 'Ventas', icon: 'receipt' },
]

export const starterData = {
  ventures: [
    { id: 'venture-1', name: 'Café de barrio', description: 'Emprendimiento de café y postres', products: 2 },
    { id: 'venture-2', name: 'Tienda artesanal', description: 'Venta de productos hechos a mano', products: 1 },
  ],
  materials: [
    { id: 'material-1', name: 'Café molido', unit: 'kg', cost: 14, stock: 40, pricePerUnit: 14 },
    { id: 'material-2', name: 'Azúcar', unit: 'kg', cost: 3.2, stock: 25, pricePerUnit: 3.2 },
  ],
  fixedCosts: [
    { id: 'fixed-1', name: 'Alquiler', cost: 320 },
    { id: 'fixed-2', name: 'Transporte', cost: 95 },
  ],
  products: [
    { id: 'product-1', ventureId: 'venture-1', name: 'Combo clásico', description: 'Café + postre', cost: 48, materialIds: ['material-1', 'material-2'] },
    { id: 'product-2', ventureId: 'venture-1', name: 'Especial frío', description: 'Bebida premium', cost: 61, materialIds: ['material-1'] },
    { id: 'product-3', ventureId: 'venture-2', name: 'Pack artesanal', description: 'Kit de regalo', cost: 34, materialIds: ['material-2'] },
  ],
  sales: [
    { id: 'sale-1', ventureId: 'venture-1', date: '2026-07-20', units: 6, amount: 360 },
    { id: 'sale-2', ventureId: 'venture-2', date: '2026-07-22', units: 5, amount: 170 },
  ],
}

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

export function normalizeUnit(unit) {
  const normalized = String(unit || '').trim().toLowerCase()
  const aliases = {
    'gramo': 'g',
    'gramos': 'g',
    'g': 'g',
    'kilogramo': 'kg',
    'kilogramos': 'kg',
    'kg': 'kg',
    'mg': 'mg',
    'miligramo': 'mg',
    'miligramos': 'mg',
    'litro': 'l',
    'litros': 'l',
    'l': 'l',
    'mililitro': 'ml',
    'mililitros': 'ml',
    'ml': 'ml',
    'cl': 'cl',
    'centilitro': 'cl',
    'centilitros': 'cl',
    'metro': 'm',
    'metros': 'm',
    'm': 'm',
    'kilometro': 'km',
    'kilometros': 'km',
    'km': 'km',
    'centimetro': 'cm',
    'centimetros': 'cm',
    'cm': 'cm',
    'milimetro': 'mm',
    'milimetros': 'mm',
    'mm': 'mm',
    'unidad': 'ud',
    'unidades': 'ud',
    'ud': 'ud',
    'u': 'ud',
  }

  return aliases[normalized] || normalized || 'ud'
}

export function convertUnitValue(value, fromUnit, toUnit, { invertForCost = false } = {}) {
  const from = normalizeUnit(fromUnit)
  const to = normalizeUnit(toUnit)

  if (from === to || value == null || value === '') return Number(value || 0)

  const factors = {
    g: 1,
    kg: 1000,
    mg: 0.001,
    l: 1000,
    ml: 1,
    cl: 10,
    m: 1,
    km: 1000,
    cm: 0.01,
    mm: 0.001,
    ud: 1,
  }

  if (!factors[from] || !factors[to] || from === to) return Number(value || 0)
  const fromFactor = factors[from]
  const toFactor = factors[to]
  const ratio = fromFactor / toFactor

  if (invertForCost) {
    return Number(value || 0) / ratio
  }

  return Number(value || 0) * ratio
}

export function formatMeasurement(value, unit) {
  const normalizedValue = Number(value || 0)
  const normalizedUnit = normalizeUnit(unit)
  const formattedValue = normalizedValue.toLocaleString('es-CO', {
    maximumFractionDigits: 3,
    minimumFractionDigits: normalizedValue % 1 === 0 ? 0 : 3,
  })

  return `${formattedValue} ${normalizedUnit}`
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
  const assignedMaterials = Array.isArray(product.materials) && product.materials.length
    ? product.materials
    : (product.materialIds || []).map((id) => ({ materialId: id, quantity: 1 }))

  const materialCost = assignedMaterials.reduce((sum, entry) => {
    const material = materials.find((item) => item.id === entry.materialId)
    if (!material) return sum

    const quantity = Number(entry.quantity || 0)
    const unitCost = Number(material.pricePerUnit ?? material.cost ?? 0)
    const normalizedQuantity = convertUnitValue(quantity, entry.unit || material.unit, material.unit)
    return sum + normalizedQuantity * unitCost
  }, 0)

  const fixedCostTotal = (product.fixedCostIds || []).reduce((sum, id) => {
    const fixedCost = fixedCosts.find((item) => item.id === id)
    return sum + (fixedCost ? Number(fixedCost.cost || 0) : 0)
  }, 0)

  if (assignedMaterials.length) {
    return materialCost + fixedCostTotal
  }

  return Number(product.cost || 0) + fixedCostTotal
}

export function getProductMargins(product, materials, fixedCosts) {
  const cost = getProductCost(product, materials, fixedCosts)
  return {
    cost,
    price: cost * 1.35,
    margin: ((cost * 1.35 - cost) / cost) * 100,
  }
}
