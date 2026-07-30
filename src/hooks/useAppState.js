import { useMemo, useState } from 'react'
import { createId, formatMoney, normalize, starterData } from '../models/appModel'

export function useAppState() {
  const [view, setView] = useState('dashboard')
  const [records, setRecords] = useState(starterData)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [draft, setDraft] = useState('')
  const [activeItem, setActiveItem] = useState(null)

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

  const addVenture = () => {
    if (!draft.trim()) return

    const newVenture = {
      id: createId('venture'),
      name: draft.trim(),
      description: 'Nuevo emprendimiento',
      products: 0,
    }

    setRecords((current) => ({ ...current, ventures: [...current.ventures, newVenture] }))
    closeModal()
  }

  const addMaterial = () => {
    if (!draft.trim()) return

    const newMaterial = {
      id: createId('material'),
      name: draft.trim(),
      unit: 'ud',
      cost: 10,
      stock: 0,
    }

    setRecords((current) => ({ ...current, materials: [...current.materials, newMaterial] }))
    closeModal()
  }

  const addProduct = (ventureId) => {
    if (!draft.trim()) return

    const newProduct = {
      id: createId('product'),
      ventureId,
      name: draft.trim(),
      description: 'Producto nuevo',
      cost: 20,
      materialIds: [],
      fixedCostIds: [],
    }

    setRecords((current) => ({ ...current, products: [...current.products, newProduct] }))
    closeModal()
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

  return {
    view,
    setView,
    records,
    setRecords,
    search,
    setSearch,
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
    filteredVentures,
    filteredMaterials,
    stats,
    addVenture,
    addMaterial,
    addProduct,
    addSale,
    removeVenture,
    removeMaterial,
  }
}
