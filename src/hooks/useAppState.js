import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../../firebase'
import { createId, normalize } from '../models/appModel'

const COLLECTIONS = ['ventures', 'materials', 'purchases', 'fixedCosts', 'products', 'sales']

export function useAppState() {
  const [view, setView] = useState('dashboard')
  const [ventures, setVentures] = useState([])
  const [materials, setMaterials] = useState([])
  const [fixedCosts, setFixedCosts] = useState([])
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [purchases, setPurchases] = useState([])
  const [search, setSearch] = useState('')
  const [ventureFilter, setVentureFilter] = useState('')
  const [modal, setModal] = useState(null)
  const [activeItem, setActiveItem] = useState(null)
  const [draft, setDraft] = useState('')

  useEffect(() => {
    const unsubscribes = COLLECTIONS.map((collectionName) => {
      const collectionRef = collection(db, collectionName)
      return onSnapshot(collectionRef, (snapshot) => {
        const data = snapshot.docs.map((item) => ({ ...item.data(), id: item.id }))
        switch (collectionName) {
          case 'ventures':
            setVentures(data)
            break
          case 'materials':
            setMaterials(data)
            break
          case 'fixedCosts':
            setFixedCosts(data)
            break
          case 'products':
            setProducts(data)
            break
          case 'sales':
            setSales(data)
            break
          case 'purchases':
            setPurchases(data)
            break
          default:
            break
        }
      })
    })

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe())
  }, [])

  const createCollectionDoc = async (collectionName, id, data) => {
    await setDoc(doc(db, collectionName, id), { ...data, id })
  }

  const updateCollectionDoc = async (collectionName, id, data) => {
    await updateDoc(doc(db, collectionName, id), data)
  }

  const deleteCollectionDoc = async (collectionName, id) => {
    await deleteDoc(doc(db, collectionName, id))
  }

  const deleteDocumentsByQuery = async (collectionName, field, value) => {
    const snapshot = await getDocs(query(collection(db, collectionName), where(field, '==', value)))
    await Promise.all(snapshot.docs.map((item) => deleteDoc(item.ref)))
  }

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

  const saveVenture = async (name, description) => {
    const normalizedName = name.trim()
    if (!normalizedName) return

    const normalizedDescription = description.trim() || 'Nuevo emprendimiento'

    try {
      if (activeItem) {
        await updateCollectionDoc('ventures', activeItem.id, {
          name: normalizedName,
          description: normalizedDescription,
        })
      } else {
        const newVenture = {
          name: normalizedName,
          description: normalizedDescription,
          products: 0,
        }
        await createCollectionDoc('ventures', createId('venture'), newVenture)
      }
    } catch (error) {
      console.error('Error guardando emprendimiento:', error)
    } finally {
      closeModal()
    }
  }

  const addMaterial = async (materialData = {}) => {
    const normalizedName = String(materialData.name || '').trim()
    const ventureId = materialData.ventureId
    if (!normalizedName || !ventureId) return

    const unit = materialData.unit || 'ud'
    const stock = Math.max(Number(materialData.stock || 0), 0)
    const unitPrice = Math.max(Number(materialData.unitPrice ?? materialData.cost ?? 10), 0)

    const newMaterial = {
      name: normalizedName,
      unit,
      cost: unitPrice,
      unitPrice,
      stock,
      ventureId,
    }

    try {
      await createCollectionDoc('materials', createId('material'), newMaterial)
    } catch (error) {
      console.error('Error agregando material:', error)
    } finally {
      closeModal()
    }
  }

  const updateMaterial = async (materialId, materialData = {}) => {
    const normalizedName = String(materialData.name || '').trim()
    if (!normalizedName) return

    const unit = materialData.unit || 'ud'
    const stock = Math.max(Number(materialData.stock || 0), 0)
    const unitPrice = Math.max(Number(materialData.unitPrice ?? materialData.cost ?? 0), 0)

    try {
      await updateCollectionDoc('materials', materialId, {
        name: normalizedName,
        unit,
        cost: unitPrice,
        unitPrice,
        stock,
        ventureId: materialData.ventureId || undefined,
      })
    } catch (error) {
      console.error('Error actualizando material:', error)
    } finally {
      closeModal()
    }
  }

  const createProduct = async ({ ventureId, name, description, cost, materials }) => {
    const normalizedName = name.trim()
    if (!normalizedName || !ventureId) return

    const newProduct = {
      ventureId,
      name: normalizedName,
      description: description.trim() || 'Producto nuevo',
      cost: Number(cost || 0),
      materials: materials || [],
      fixedCostIds: [],
    }

    try {
      await createCollectionDoc('products', createId('product'), newProduct)
    } catch (error) {
      console.error('Error creando producto:', error)
    }
  }

  const updateProduct = async (productId, { name, description, cost, ventureId, materials }) => {
    const normalizedName = name.trim()
    if (!normalizedName) return

    try {
      await updateCollectionDoc('products', productId, {
        name: normalizedName,
        description: description.trim() || 'Producto nuevo',
        cost: Number(cost || 0),
        ventureId,
        materials,
      })
    } catch (error) {
      console.error('Error actualizando producto:', error)
    }
  }

  const addSale = async (saleData = {}) => {
    const ventureId = saleData.ventureId
    if (!ventureId) return

    const totalUnits = Object.values(saleData.selectedProducts || {}).reduce((sum, item) => sum + Number(item.quantity || 1), 0)

    const newSale = {
      ventureId,
      date: saleData.date || new Date().toISOString().slice(0, 10),
      units: totalUnits || 1,
      amount: Number(saleData.amount || 0),
      phone: saleData.phone || '',
      location: saleData.location || '',
      selectedProducts: saleData.selectedProducts || {},
      margin: saleData.margin || '',
    }

    try {
      await createCollectionDoc('sales', createId('sale'), newSale)
    } catch (error) {
      console.error('Error agregando venta:', error)
    } finally {
      closeModal()
    }
  }

  const updateSale = async (saleId, saleData = {}) => {
    if (!saleId) return

    const totalUnits = Object.values(saleData.selectedProducts || {}).reduce((sum, item) => sum + Number(item.quantity || 1), 0)

    try {
      await updateCollectionDoc('sales', saleId, {
        ventureId: saleData.ventureId,
        date: saleData.date,
        units: totalUnits || undefined,
        amount: Number(saleData.amount || 0),
        phone: saleData.phone || '',
        location: saleData.location || '',
        selectedProducts: saleData.selectedProducts || {},
        margin: saleData.margin || '',
      })
    } catch (error) {
      console.error('Error actualizando venta:', error)
    } finally {
      closeModal()
    }
  }

  const removeSale = async (saleId) => {
    try {
      await deleteCollectionDoc('sales', saleId)
    } catch (error) {
      console.error('Error eliminando venta:', error)
    }
  }

  const addPurchase = async ({ materialId, date, quantity, cost } = {}) => {
    if (!materialId) return

    const normalizedQuantity = Math.max(Number(quantity) || 0, 0)
    const normalizedCost = Math.max(Number(cost) || 0, 0)
    const newPurchase = {
      materialId,
      date: date || new Date().toISOString().slice(0, 10),
      quantity: normalizedQuantity,
      cost: normalizedCost,
    }

    try {
      await createCollectionDoc('purchases', createId('purchase'), newPurchase)
      const material = materials.find((item) => item.id === materialId)
      if (material) {
        const currentStock = Number(material.stock || 0)
        await updateCollectionDoc('materials', materialId, { stock: currentStock + normalizedQuantity })
      }
    } catch (error) {
      console.error('Error agregando compra:', error)
    } finally {
      closeModal()
    }
  }

  const removePurchase = async (purchaseId) => {
    try {
      const purchase = purchases.find((item) => item.id === purchaseId)
      await deleteCollectionDoc('purchases', purchaseId)
      if (purchase) {
        const material = materials.find((item) => item.id === purchase.materialId)
        if (material) {
          const currentStock = Number(material.stock || 0)
          await updateCollectionDoc('materials', material.id, {
            stock: Math.max(currentStock - Number(purchase.quantity || 0), 0),
          })
        }
      }
    } catch (error) {
      console.error('Error eliminando compra:', error)
    }
  }

  const removeVenture = async (ventureId) => {
    try {
      const materialSnapshot = await getDocs(query(collection(db, 'materials'), where('ventureId', '==', ventureId)))
      const materialIds = materialSnapshot.docs.map((item) => item.id)

      await Promise.all([
        deleteCollectionDoc('ventures', ventureId),
        deleteDocumentsByQuery('products', 'ventureId', ventureId),
        deleteDocumentsByQuery('sales', 'ventureId', ventureId),
        deleteDocumentsByQuery('fixedCosts', 'ventureId', ventureId),
        ...materialIds.map((materialId) => deleteDocumentsByQuery('purchases', 'materialId', materialId)),
      ])

      await Promise.all(materialIds.map((materialId) => deleteCollectionDoc('materials', materialId)))
    } catch (error) {
      console.error('Error eliminando emprendimiento:', error)
    }
  }

  const removeMaterial = async (materialId) => {
    try {
      await deleteDocumentsByQuery('purchases', 'materialId', materialId)

      const productsSnapshot = await getDocs(collection(db, 'products'))
      await Promise.all(
        productsSnapshot.docs.map((productDoc) => {
          const product = { ...productDoc.data(), id: productDoc.id }
          const updatedMaterials = (product.materials || []).filter((item) => item.materialId !== materialId)
          if (updatedMaterials.length === (product.materials || []).length) return Promise.resolve()
          return updateCollectionDoc('products', product.id, { materials: updatedMaterials })
        }),
      )

      await deleteCollectionDoc('materials', materialId)
    } catch (error) {
      console.error('Error eliminando material:', error)
    }
  }

  const removeProduct = async (productId) => {
    try {
      await deleteCollectionDoc('products', productId)
    } catch (error) {
      console.error('Error eliminando producto:', error)
    }
  }

  const filteredVentures = useMemo(() => {
    const queryText = normalize(search)
    return ventures.filter((venture) => normalize(`${venture.name} ${venture.description}`).includes(queryText))
  }, [ventures, search])

  const filteredMaterials = useMemo(() => {
    const queryText = normalize(search)
    return materials.filter((material) => normalize(`${material.name} ${material.unit}`).includes(queryText))
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

  const materialsWithStock = useMemo(
    () =>
      materials.map((material) => {
        const totals = purchaseTotals[material.id] || { quantity: 0, cost: 0 }
        const consumed = salesConsumption[material.id] || 0
        const derivedStock = totals.quantity - consumed
        const resolvedStock = material.stock != null ? Number(material.stock) : derivedStock
        return {
          ...material,
          stock: resolvedStock,
          avgCost: totals.quantity > 0 ? totals.cost / totals.quantity : material.cost,
          unitPrice: Number(material.unitPrice ?? material.cost ?? 0),
        }
      }),
    [materials, purchaseTotals, salesConsumption],
  )

  const filteredMaterialsWithStock = useMemo(() => {
    const queryText = normalize(search)
    return materialsWithStock.filter(
      (material) =>
        (!ventureFilter || material.ventureId === ventureFilter) &&
        normalize(`${material.name} ${material.unit}`).includes(queryText),
    )
  }, [materialsWithStock, search, ventureFilter])

  const filteredPurchases = useMemo(() => {
    if (!ventureFilter) return purchases
    return purchases.filter((purchase) => {
      const material = materials.find((item) => item.id === purchase.materialId)
      return material?.ventureId === ventureFilter
    })
  }, [purchases, materials, ventureFilter])

  const filteredProducts = useMemo(() => {
    const queryText = normalize(search)
    return products.filter(
      (product) =>
        (!ventureFilter || product.ventureId === ventureFilter) &&
        normalize(`${product.name} ${product.description}`).includes(queryText),
    )
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
    const filtered = ventureFilter ? sales.filter((sale) => sale.ventureId === ventureFilter) : sales
    return {
      revenue: filtered.reduce((sum, item) => sum + Number(item.amount || 0), 0),
      costs: filteredFixedCosts.reduce((sum, item) => sum + Number(item.cost || 0), 0),
      sales: filtered.length,
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

  return {
    view,
    setView,
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
    updateMaterial,
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
