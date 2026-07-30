import { useMemo, useState } from 'react'
import { createId, normalize, starterData } from '../models/appModel'

export function useAppState() {
  const [view, setView] = useState('dashboard')
  const [records, setRecords] = useState(starterData)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [activeItem, setActiveItem] = useState(null)
  const [draft, setDraft] = useState('')

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

  const addMaterial = (name) => {
    const normalizedName = name.trim()
    if (!normalizedName) return

    const newMaterial = {
      id: createId('material'),
      name: normalizedName,
      unit: 'ud',
      cost: 10,
      stock: 0,
    }

    setRecords((current) => ({ ...current, materials: [...current.materials, newMaterial] }))
    closeModal()
  }

  const createProduct = ({ ventureId, name, description, cost }) => {
    const normalizedName = name.trim()
    if (!normalizedName || !ventureId) return

    const newProduct = {
      id: createId('product'),
      ventureId,
      name: normalizedName,
      description: description.trim() || 'Producto nuevo',
      cost: Number(cost || 0),
      materialIds: [],
      fixedCostIds: [],
    }

    setRecords((current) => ({ ...current, products: [...current.products, newProduct] }))
  }

  const updateProduct = (productId, { name, description, cost }) => {
    const normalizedName = name.trim()
    if (!normalizedName) return

    setRecords((current) => ({
      ...current,
      products: current.products.map((product) => product.id === productId ? { ...product, name: normalizedName, description: description.trim() || 'Producto nuevo', cost: Number(cost || 0) } : product),
    }))
  }

  const addSale = (ventureId) => {
    const newSale = {
      id: createId('sale'),
      ventureId,
      date: new Date().toISOString().slice(0, 10),
      units: 1,
      amount: 100,
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
    saveVenture,
    addMaterial,
    createProduct,
    updateProduct,
    addSale,
    removeVenture,
    removeMaterial,
    removeProduct,
  }
}
