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
//     { id: 'product-1', ventureId: 'venture-1', name: 'Combo clásico', description: 'Café + postre', cost: 48, materials: [{ materialId: 'material-1', quantity: 1 }, { materialId: 'material-2', quantity: 2 }] },
//     { id: 'product-2', ventureId: 'venture-1', name: 'Especial frío', description: 'Bebida premium', cost: 61, materials: [{ materialId: 'material-1', quantity: 2 }] },
//     { id: 'product-3', ventureId: 'venture-2', name: 'Pack artesanal', description: 'Kit de regalo', cost: 34, materials: [{ materialId: 'material-3', quantity: 4 }] },
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
  const materialCost = (product.materials || []).reduce((sum, item) => {
    const material = materials.find((m) => m.id === item.materialId)
    return sum + (material ? Number(material.cost || 0) * Number(item.quantity || 1) : 0)
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
