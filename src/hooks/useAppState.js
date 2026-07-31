import { useEffect, useMemo, useState } from 'react'
import { createId, normalize, starterData } from '../models/appModel'

const STORAGE_KEY = 'asodeco-app-state-v1'
const STORAGE_SHAPE = ['ventures', 'materials', 'purchases', 'fixedCosts', 'products', 'sales']

const loadStoredState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (STORAGE_SHAPE.every((key) => Array.isArray(parsed?.[key]))) return parsed
    }
  } catch (error) {
    console.warn('No se pudo cargar el estado guardado', error)
  }
  return starterData
}

export function useAppState() {
  const [view, setView] = useState('dashboard')
  const [records, setRecords] = useState(loadStoredState)
  const [search, setSearch] = useState('')
  const [ventureFilter, setVentureFilter] = useState('')
  const [modal, setModal] = useState(null)
  const [activeItem, setActiveItem] = useState(null)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
    } catch (error) {
      console.warn('No se pudo guardar el estado', error)
    }
  }, [records])

  const ventures = useMemo(() => records.ventures, [records.ventures])
  const materials = useMemo(() => records.materials, [records.materials])
  const fixedCosts = useMemo(() => records.fixedCosts, [records.fixedCosts])
  const products = useMemo(() => records.products, [records.products])
  const sales = useMemo(() => records.sales, [records.sales])
  const purchases = useMemo(() => records.purchases, [records.purchases])

  const filteredVentures = useMemo(() => {
    const query = normalize(search)
    return ventures.filter((venture) => normalize(`${venture.name} ${venture.description}`).includes(query))
  }, [ventures, search])

  const filteredMaterials = useMemo(() => {
    const query = normalize(search)
    return materials.filter((material) => normalize(`${material.name} ${material.unit}`).includes(query))
  }, [materials, search])

  const purchaseTotals = useMemo(() => {
    const map = {}
    purchases.forEach((purchase) => {
      const entry = map[purchase.materialId] || { quantity: 0, cost: 0 }
      entry.quantity += Number(purchase.quantity || 0)
      entry.cost += Number(purchase.cost || 0)
      map[purchase.materialId] = entry
    })
    return map
  }, [purchases])

  const salesConsumption = useMemo(() => {
    const map = {}
    sales.forEach((sale) => {
      Object.entries(sale.selectedProducts || {}).forEach(([productId, item]) => {
        const product = products.find((candidate) => candidate.id === productId)
        if (!product) return
        const saleQuantity = Number(item?.quantity || 1)
        ;(product.materials || []).forEach((materialRef) => {
          const entry = map[materialRef.materialId] || 0
          map[materialRef.materialId] = entry + saleQuantity * Number(materialRef.quantity || 1)
        })
      })
    })
    return map
  }, [sales, products])

  const materialsWithStock = useMemo(() => (
    materials.map((material) => {
      const totals = purchaseTotals[material.id] || { quantity: 0, cost: 0 }
      const consumed = salesConsumption[material.id] || 0
      return {
        ...material,
        stock: totals.quantity - consumed,
        avgCost: totals.quantity > 0 ? totals.cost / totals.quantity : material.cost,
      }
    })
  ), [materials, purchaseTotals, salesConsumption])

  const filteredMaterialsWithStock = useMemo(() => {
    const query = normalize(search)
    return materialsWithStock.filter((material) => (
      (!ventureFilter || material.ventureId === ventureFilter) &&
      normalize(`${material.name} ${material.unit}`).includes(query)
    ))
  }, [materialsWithStock, search, ventureFilter])

  const filteredPurchases = useMemo(() => {
    if (!ventureFilter) return purchases
    return purchases.filter((purchase) => {
      const material = materials.find((item) => item.id === purchase.materialId)
      return material?.ventureId === ventureFilter
    })
  }, [purchases, materials, ventureFilter])

  const filteredProducts = useMemo(() => {
    const query = normalize(search)
    return products.filter((product) => (
      (!ventureFilter || product.ventureId === ventureFilter) &&
      normalize(`${product.name} ${product.description}`).includes(query)
    ))
  }, [products, ventureFilter, search])

  const filteredSales = useMemo(() => {
    if (!ventureFilter) return sales
    return sales.filter((sale) => sale.ventureId === ventureFilter)
  }, [sales, ventureFilter])

  const filteredFixedCosts = useMemo(() => {
    if (!ventureFilter) return fixedCosts
    return fixedCosts.filter((item) => item.ventureId === ventureFilter)
  }, [fixedCosts, ventureFilter])

  const financeStats = useMemo(() => {
    const filteredSales = ventureFilter ? sales.filter((sale) => sale.ventureId === ventureFilter) : sales
    return {
      revenue: filteredSales.reduce((sum, item) => sum + Number(item.amount || 0), 0),
      costs: filteredFixedCosts.reduce((sum, item) => sum + Number(item.cost || 0), 0),
      sales: filteredSales.length,
    }
  }, [sales, ventureFilter, filteredFixedCosts])

  const stats = useMemo(() => {
    const revenue = sales.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    return {
      ventures: ventures.length,
      materials: materials.length,
      products: products.length,
      sales: sales.length,
      revenue,
      costs: fixedCosts.reduce((sum, item) => sum + Number(item.cost || 0), 0),
    }
  }, [ventures.length, materials.length, products.length, sales, fixedCosts])

  const openModal = (type, item = null) => {
    setModal(type)
    setActiveItem(item)
    setDraft(item?.name || '')
  }

  const closeModal = () => {
    setModal(null)
    setActiveItem(null)
    setDraft('')
  }

  const saveVenture = (name, description) => {
    const normalizedName = name.trim()
    if (!normalizedName) return

    const normalizedDescription = description.trim() || 'Nuevo emprendimiento'

    if (activeItem) {
      setRecords((current) => ({
        ...current,
        ventures: current.ventures.map((venture) => venture.id === activeItem.id ? { ...venture, name: normalizedName, description: normalizedDescription } : venture),
      }))
    } else {
      const newVenture = {
        id: createId('venture'),
        name: normalizedName,
        description: normalizedDescription,
        products: 0,
      }

      setRecords((current) => ({ ...current, ventures: [...current.ventures, newVenture] }))
    }

    closeModal()
  }

  const addMaterial = (name, ventureId) => {
    const normalizedName = name.trim()
    if (!normalizedName || !ventureId) return

    const newMaterial = {
      id: createId('material'),
      name: normalizedName,
      unit: 'ud',
      cost: 10,
      ventureId,
    }

    setRecords((current) => ({ ...current, materials: [...current.materials, newMaterial] }))
    closeModal()
  }

  const createProduct = ({ ventureId, name, description, cost, materials }) => {
    const normalizedName = name.trim()
    if (!normalizedName || !ventureId) return

    const newProduct = {
      id: createId('product'),
      ventureId,
      name: normalizedName,
      description: description.trim() || 'Producto nuevo',
      cost: Number(cost || 0),
      materials: materials || [],
      fixedCostIds: [],
    }

    setRecords((current) => ({ ...current, products: [...current.products, newProduct] }))
  }

  const updateProduct = (productId, { name, description, cost, ventureId, materials }) => {
    const normalizedName = name.trim()
    if (!normalizedName) return

    setRecords((current) => ({
      ...current,
      products: current.products.map((product) => product.id === productId ? { ...product, name: normalizedName, description: description.trim() || 'Producto nuevo', cost: Number(cost || 0), ventureId: ventureId || product.ventureId, materials: materials || product.materials } : product),
    }))
  }

  const addSale = (saleData = {}) => {
    const ventureId = saleData.ventureId
    if (!ventureId) return

    const totalUnits = Object.values(saleData.selectedProducts || {}).reduce((sum, item) => sum + Number(item.quantity || 1), 0)

    const newSale = {
      id: createId('sale'),
      ventureId,
      date: saleData.date || new Date().toISOString().slice(0, 10),
      units: totalUnits || 1,
      amount: Number(saleData.amount || 0),
      phone: saleData.phone || '',
      location: saleData.location || '',
      selectedProducts: saleData.selectedProducts || {},
      margin: saleData.margin || '',
    }

    setRecords((current) => ({ ...current, sales: [...current.sales, newSale] }))
    closeModal()
  }

  const updateSale = (saleId, saleData = {}) => {
    if (!saleId) return

    const totalUnits = Object.values(saleData.selectedProducts || {}).reduce((sum, item) => sum + Number(item.quantity || 1), 0)

    setRecords((current) => ({
      ...current,
      sales: current.sales.map((sale) => sale.id === saleId ? {
        ...sale,
        ventureId: saleData.ventureId || sale.ventureId,
        date: saleData.date || sale.date,
        units: totalUnits || sale.units,
        amount: Number(saleData.amount || 0),
        phone: saleData.phone || sale.phone || '',
        location: saleData.location || sale.location || '',
        selectedProducts: saleData.selectedProducts || sale.selectedProducts || {},
        margin: saleData.margin || sale.margin || '',
      } : sale),
    }))
    closeModal()
  }

  const removeSale = (saleId) => {
    setRecords((current) => ({ ...current, sales: current.sales.filter((sale) => sale.id !== saleId) }))
  }

  const addPurchase = ({ materialId, date, quantity, cost } = {}) => {
    if (!materialId) return

    const newPurchase = {
      id: createId('purchase'),
      materialId,
      date: date || new Date().toISOString().slice(0, 10),
      quantity: Math.max(Number(quantity) || 0, 0),
      cost: Math.max(Number(cost) || 0, 0),
    }

    setRecords((current) => ({ ...current, purchases: [...current.purchases, newPurchase] }))
    closeModal()
  }

  const removePurchase = (purchaseId) => {
    setRecords((current) => ({ ...current, purchases: current.purchases.filter((purchase) => purchase.id !== purchaseId) }))
  }

  const removeVenture = (ventureId) => {
    setRecords((current) => ({
      ...current,
      ventures: current.ventures.filter((venture) => venture.id !== ventureId),
      products: current.products.filter((product) => product.ventureId !== ventureId),
      sales: current.sales.filter((sale) => sale.ventureId !== ventureId),
    }))
  }

  const removeMaterial = (materialId) => {
    setRecords((current) => ({
      ...current,
      materials: current.materials.filter((material) => material.id !== materialId),
      products: current.products.map((product) => ({
        ...product,
        materials: (product.materials || []).filter((item) => item.materialId !== materialId),
      })),
    }))
  }

  const removeProduct = (productId) => {
    setRecords((current) => ({ ...current, products: current.products.filter((product) => product.id !== productId) }))
  }

  return {
    view,
    setView,
    records,
    setRecords,
    search,
    setSearch,
    ventureFilter,
    setVentureFilter,
    modal,
    openModal,
    closeModal,
    draft,
    setDraft,
    activeItem,
    ventures,
    materials,
    fixedCosts,
    products,
    sales,
    purchases,
    filteredVentures,
    filteredMaterials,
    materialsWithStock,
    filteredMaterialsWithStock,
    filteredPurchases,
    filteredProducts,
    filteredSales,
    filteredFixedCosts,
    financeStats,
    stats,
    saveVenture,
    addMaterial,
    createProduct,
    updateProduct,
    addSale,
    updateSale,
    removeSale,
    addPurchase,
    removePurchase,
    removeVenture,
    removeMaterial,
    removeProduct,
  }
}
