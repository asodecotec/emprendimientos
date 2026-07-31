import { useMemo, useState } from 'react'
import { createId, normalize, starterData } from '../models/appModel'

export function useAppState() {
  const [view, setView] = useState('dashboard')
  const [records, setRecords] = useState(starterData)
  const [search, setSearch] = useState('')

  const ventures = useMemo(() => records.ventures, [records.ventures])
  const materials = useMemo(() => records.materials, [records.materials])
  const fixedCosts = useMemo(() => records.fixedCosts, [records.fixedCosts])
  const products = useMemo(() => records.products, [records.products])
  const sales = useMemo(() => records.sales, [records.sales])

  const filteredVentures = useMemo(() => {
    const query = normalize(search)
    return ventures.filter((venture) => normalize(`${venture.name} ${venture.description}`).includes(query))
  }, [ventures, search])

  const filteredMaterials = useMemo(() => {
    const query = normalize(search)
    return materials.filter((material) => normalize(`${material.name} ${material.unit}`).includes(query))
  }, [materials, search])

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

  const createVenture = ({ name, description }) => {
    const normalizedName = String(name || '').trim()
    if (!normalizedName) return

    const newVenture = {
      id: createId('venture'),
      name: normalizedName,
      description: String(description || '').trim() || 'Nuevo emprendimiento',
      products: 0,
    }

    setRecords((current) => ({ ...current, ventures: [...current.ventures, newVenture] }))
  }

  const updateVenture = (ventureId, { name, description }) => {
    const normalizedName = String(name || '').trim()
    if (!normalizedName || !ventureId) return

    setRecords((current) => ({
      ...current,
      ventures: current.ventures.map((venture) => venture.id === ventureId ? { ...venture, name: normalizedName, description: String(description || '').trim() || 'Nuevo emprendimiento' } : venture),
    }))
  }

  const createMaterial = ({ name, unit = 'ud', cost = 10, stock = 0 }) => {
    const normalizedName = String(name || '').trim()
    if (!normalizedName) return

    const newMaterial = {
      id: createId('material'),
      name: normalizedName,
      unit,
      cost: Number(cost || 0),
      stock: Number(stock || 0),
    }

    setRecords((current) => ({ ...current, materials: [...current.materials, newMaterial] }))
  }

  const updateMaterial = (materialId, { name, unit = 'ud', cost = 10, stock = 0 }) => {
    const normalizedName = String(name || '').trim()
    if (!normalizedName || !materialId) return

    setRecords((current) => ({
      ...current,
      materials: current.materials.map((material) => material.id === materialId ? { ...material, name: normalizedName, unit, cost: Number(cost || 0), stock: Number(stock || 0) } : material),
    }))
  }

  const createProduct = ({ ventureId, name, description, cost, materials = [] }) => {
    const normalizedName = String(name || '').trim()
    if (!normalizedName || !ventureId) return

    const newProduct = {
      id: createId('product'),
      ventureId,
      name: normalizedName,
      description: String(description || '').trim() || 'Producto nuevo',
      cost: Number(cost || 0),
      materials: (materials || []).filter((item) => item?.materialId && Number(item.quantity || 0) > 0),
      materialIds: [],
      fixedCostIds: [],
    }

    setRecords((current) => ({ ...current, products: [...current.products, newProduct] }))
  }

  const updateProduct = (productId, { name, description, cost, materials = [] }) => {
    const normalizedName = String(name || '').trim()
    if (!normalizedName) return

    setRecords((current) => ({
      ...current,
      products: current.products.map((product) => product.id === productId ? {
        ...product,
        name: normalizedName,
        description: String(description || '').trim() || 'Producto nuevo',
        cost: Number(cost || 0),
        materials: (materials || []).filter((item) => item?.materialId && Number(item.quantity || 0) > 0),
      } : product),
    }))
  }

  const createSale = (saleData = {}) => {
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
    setRecords((current) => ({ ...current, materials: current.materials.filter((material) => material.id !== materialId) }))
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
    ventures,
    materials,
    fixedCosts,
    products,
    sales,
    filteredVentures,
    filteredMaterials,
    stats,
    createVenture,
    updateVenture,
    createMaterial,
    updateMaterial,
    createProduct,
    updateProduct,
    createSale,
    removeVenture,
    removeMaterial,
    removeProduct,
  }
}
