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
import { createId, normalize, getProductCost, calculateFixedCostTotal, getActiveEmployeeEntry, FIXED_COST_FREQUENCIES } from '../models/appModel'

const COLLECTIONS = ['ventures', 'materials', 'purchases', 'products', 'sales']

const sortByRecent = (list, recent) =>
  [...list].sort((a, b) => (recent[b.id] || 0) - (recent[a.id] || 0))

const sortByRecentAndDate = (list, recent) =>
  [...list].sort((a, b) => {
    const recentDiff = (recent[b.id] || 0) - (recent[a.id] || 0)
    if (recentDiff !== 0) return recentDiff
    return (b.date || '').localeCompare(a.date || '')
  })

export function useAppState() {
  const [view, setView] = useState('dashboard')
  const [ventures, setVentures] = useState([])
  const [materials, setMaterials] = useState([])
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [purchases, setPurchases] = useState([])
  const [search, setSearch] = useState('')
  const [ventureFilter, setVentureFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [modal, setModal] = useState(null)
  const [activeItem, setActiveItem] = useState(null)
  const [draft, setDraft] = useState('')
  const [recent, setRecent] = useState({})

  const markRecent = (id) => setRecent((current) => ({ ...current, [id]: Date.now() }))

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

  const saveVenture = async (name, description, employeeTimeline) => {
    const normalizedName = name.trim()
    if (!normalizedName) return

    const normalizedDescription = description.trim() || 'Nuevo emprendimiento'
    const normalizedTimeline = (employeeTimeline || []).map((entry) => ({
      startDate: entry.startDate || new Date().toISOString().slice(0, 10),
      employeeCount: Math.max(Number(entry.employeeCount || 0), 0),
      profitShare: Math.max(Math.min(Number(entry.profitShare || 0), 100), 0),
    }))

    try {
      if (activeItem) {
        await updateCollectionDoc('ventures', activeItem.id, {
          name: normalizedName,
          description: normalizedDescription,
          employeeTimeline: normalizedTimeline,
        })
      } else {
        const newVenture = {
          name: normalizedName,
          description: normalizedDescription,
          employeeTimeline: normalizedTimeline,
        }
        const newVentureId = createId('venture')
        await createCollectionDoc('ventures', newVentureId, newVenture)
        markRecent(newVentureId)
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

    const newMaterial = {
      name: normalizedName,
      unit: materialData.unit ?? '',
      ventureId,
    }

    try {
      const newMaterialId = createId('material')
      await createCollectionDoc('materials', newMaterialId, newMaterial)
      markRecent(newMaterialId)
    } catch (error) {
      console.error('Error agregando material:', error)
    } finally {
      closeModal()
    }
  }

  const updateMaterial = async (materialId, materialData = {}) => {
    const normalizedName = String(materialData.name || '').trim()
    if (!normalizedName) return

    const updates = {
      name: normalizedName,
      unit: materialData.unit ?? '',
      ventureId: materialData.ventureId || null,
    }
    
    try {
      await updateCollectionDoc('materials', materialId, updates)
    } catch (error) {
      console.error('Error actualizando material:', error)
    } finally {
      closeModal()
    }
  }

  const createProduct = async ({ ventureId, name, description, materials }) => {
    const normalizedName = name.trim()
    if (!normalizedName || !ventureId) return

    const newProduct = {
      ventureId,
      name: normalizedName,
      description: description.trim() || 'Producto nuevo',
      materials: materials || {},
    }

    try {
      const newProductId = createId('product')
      await createCollectionDoc('products', newProductId, newProduct)
      markRecent(newProductId)
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
      shippingCost: Number(saleData.shippingCost || 0),
      phone: saleData.phone || '',
      location: saleData.location || '',
      selectedProducts: saleData.selectedProducts || {},
      margin: saleData.margin || '',
      paid: Boolean(saleData.paid),
    }

    try {
      const newSaleId = createId('sale')
      await createCollectionDoc('sales', newSaleId, newSale)
      markRecent(newSaleId)
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
        units: totalUnits || null,
        amount: Number(saleData.amount || 0),
        shippingCost: Number(saleData.shippingCost || 0),
        phone: saleData.phone || '',
        location: saleData.location || '',
        selectedProducts: saleData.selectedProducts || {},
        margin: saleData.margin || '',
        paid: Boolean(saleData.paid),
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
      const newPurchaseId = createId('purchase')
      await createCollectionDoc('purchases', newPurchaseId, newPurchase)
      markRecent(newPurchaseId)
    } catch (error) {
      console.error('Error agregando compra:', error)
    } finally {
      closeModal()
    }
  }

  const removePurchase = async (purchaseId) => {
    try {
      await deleteCollectionDoc('purchases', purchaseId)
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
          const updatedMaterials = { ...(product.materials || {}) }
          if (!(materialId in updatedMaterials)) return Promise.resolve()
          delete updatedMaterials[materialId]
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

  const addFixedCost = async ({ ventureId, name, cost, startDate, frequency } = {}) => {
    const normalizedName = String(name || '').trim()
    const normalizedCost = Math.max(Number(cost || 0), 0)
    if (!normalizedName || !ventureId) return

    const venture = ventures.find((item) => item.id === ventureId)
    if (!venture) return

    const newFixedCost = {
      id: createId('fixed'),
      name: normalizedName,
      cost: normalizedCost,
      startDate: startDate || new Date().toISOString().slice(0, 10),
      frequency: frequency || 'monthly',
    }

    try {
      await updateCollectionDoc('ventures', ventureId, {
        fixedCosts: [...(venture.fixedCosts || []), newFixedCost],
      })
      markRecent(newFixedCost.id)
    } catch (error) {
      console.error('Error agregando costo fijo:', error)
    } finally {
      closeModal()
    }
  }

  const updateFixedCost = async ({ ventureId, fixedCostId, name, cost, startDate, frequency, endDate } = {}) => {
    const normalizedName = String(name || '').trim()
    const normalizedCost = Math.max(Number(cost || 0), 0)
    if (!normalizedName || !ventureId || !fixedCostId) return

    const venture = ventures.find((item) => item.id === ventureId)
    if (!venture) return

    const updatedFixedCosts = (venture.fixedCosts || []).map((item) =>
      item.id === fixedCostId
        ? {
            ...item,
            name: normalizedName,
            cost: normalizedCost,
            startDate: startDate ?? item.startDate,
            frequency: frequency ?? item.frequency,
            endDate: endDate !== undefined ? endDate : item.endDate,
          }
        : item,
    )

    try {
      await updateCollectionDoc('ventures', ventureId, { fixedCosts: updatedFixedCosts })
    } catch (error) {
      console.error('Error actualizando costo fijo:', error)
    } finally {
      closeModal()
    }
  }

  const removeFixedCost = async ({ ventureId, fixedCostId } = {}) => {
    if (!ventureId || !fixedCostId) return

    const venture = ventures.find((item) => item.id === ventureId)
    if (!venture) return

    const updatedFixedCosts = (venture.fixedCosts || []).filter((item) => item.id !== fixedCostId)

    try {
      await updateCollectionDoc('ventures', ventureId, { fixedCosts: updatedFixedCosts })
    } catch (error) {
      console.error('Error eliminando costo fijo:', error)
    }
  }

  const filteredVentures = useMemo(() => {
    const queryText = normalize(search)
    return sortByRecent(
      ventures.filter((venture) => normalize(`${venture.name} ${venture.description}`).includes(queryText)),
      recent,
    )
  }, [ventures, search, recent])

  const filteredMaterials = useMemo(() => {
    const queryText = normalize(search)
    return sortByRecent(
      materials.filter((material) => normalize(`${material.name} ${material.unit}`).includes(queryText)),
      recent,
    )
  }, [materials, search, recent])

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
        Object.entries(product.materials || {}).forEach(([materialId, materialRef]) => {
          const entry = map[materialId] || 0
          map[materialId] = entry + saleQuantity * Number(materialRef.quantity || 1)
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
        return {
          ...material,
          stock: totals.quantity - consumed,
          avgCost: totals.quantity > 0 ? totals.cost / totals.quantity : 0,
        }
      }),
    [materials, purchaseTotals, salesConsumption],
  )

  const filteredMaterialsWithStock = useMemo(() => {
    const queryText = normalize(search)
    return sortByRecent(
      materialsWithStock.filter((material) =>
          (!ventureFilter || material.ventureId === ventureFilter) &&
          normalize(`${material.name} ${material.unit}`).includes(queryText),
      ),
      recent,
    )
  }, [materialsWithStock, search, ventureFilter, recent])

  const filteredPurchases = useMemo(() => {
    const queryText = normalize(search)
    const base = ventureFilter
      ? purchases.filter((purchase) => {
          const material = materials.find((item) => item.id === purchase.materialId)
          return material?.ventureId === ventureFilter
        })
      : purchases
    if (!queryText) return sortByRecentAndDate(base, recent)
    return sortByRecentAndDate(
      base.filter((purchase) => {
        const material = materials.find((item) => item.id === purchase.materialId)
        return normalize(`${material?.name || ''} ${purchase.date || ''}`).includes(queryText)
      }),
      recent,
    )
  }, [purchases, materials, search, ventureFilter, recent])

  const filteredProducts = useMemo(() => {
    const queryText = normalize(search)
    return sortByRecent(
      products.filter(
        (product) =>
          (!ventureFilter || product.ventureId === ventureFilter) &&
          normalize(`${product.name} ${product.description}`).includes(queryText),
      ),
      recent,
    )
  }, [products, ventureFilter, search, recent])

  const filteredSales = useMemo(() => {
    const queryText = normalize(search)
    const base = ventureFilter ? sales.filter((sale) => sale.ventureId === ventureFilter) : sales
    if (!queryText) return sortByRecentAndDate(base, recent)
    return sortByRecentAndDate(
      base.filter((sale) => {
        const productNames = Object.keys(sale.selectedProducts || {})
          .map((productId) => {
            const product = products.find((p) => p.id === productId)
            return product?.name || ''
          })
          .join(' ')
        return normalize(`${productNames} ${sale.phone || ''} ${sale.date || ''} ${sale.location || ''}`).includes(queryText)
      }),
      recent,
    )
  }, [sales, products, search, ventureFilter, recent])

  const fixedCosts = useMemo(
    () =>
      ventures.flatMap((venture) =>
        (venture.fixedCosts || []).map((item) => ({ ...item, ventureId: venture.id, ventureName: venture.name })),
      ),
    [ventures],
  )

  const filteredFixedCosts = useMemo(() => {
    const isActiveInRange = (item) => {
      if (!dateFilter) return true
      const start = item.startDate ? new Date(item.startDate) : null
      const end = item.endDate ? new Date(item.endDate) : null
      const now = new Date()
      if (!start) return false
      if (dateFilter === 'month') {
        const monthAgo = new Date(now)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return start <= now && (!end || end >= monthAgo)
      }
      if (dateFilter === 'year') {
        const yearAgo = new Date(now)
        yearAgo.setFullYear(yearAgo.getFullYear() - 1)
        return start <= now && (!end || end >= yearAgo)
      }
      return true
    }
    const filtered = fixedCosts.filter((item) => {
      if (ventureFilter && item.ventureId !== ventureFilter) return false
      if (!isActiveInRange(item)) return false
      return true
    }).map((item) => {
      if (dateFilter !== 'month') return item
      const freq = FIXED_COST_FREQUENCIES.find((f) => f.value === item.frequency)
      const intervalDays = freq?.days || 30
      const monthsPerInterval = intervalDays / 30
      return { ...item, cost: Number(item.cost || 0) / monthsPerInterval }
    })
    return sortByRecent(filtered, recent)
  }, [fixedCosts, ventureFilter, dateFilter, recent])

  const financeStats = useMemo(() => {
    const isDateInRange = (dateStr) => {
      if (!dateFilter) return true
      if (!dateStr) return false
      const date = new Date(dateStr)
      const now = new Date()
      if (dateFilter === 'month') {
        const monthAgo = new Date(now)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return date >= monthAgo
      }
      if (dateFilter === 'year') {
        const yearAgo = new Date(now)
        yearAgo.setFullYear(yearAgo.getFullYear() - 1)
        return date >= yearAgo
      }
      return true
    }

    const filtered = sales.filter((sale) => {
      if (ventureFilter && sale.ventureId !== ventureFilter) return false
      if (!isDateInRange(sale.date)) return false
      return true
    })

    const saleCosts = filtered.reduce((sum, sale) => {
      const productsInSale = Object.entries(sale.selectedProducts || {})
      return sum + productsInSale.reduce((productSum, [productId, item]) => {
        const product = products.find((p) => p.id === productId)
        if (!product) return productSum
        const cost = getProductCost(product, materialsWithStock)
        return productSum + cost * Number(item.quantity || 1)
      }, 0)
    }, 0)

    const revenue = filtered.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    const shippingCosts = filtered.reduce((sum, item) => sum + Number(item.shippingCost || 0), 0)
    const fixedCostsTotal = filteredFixedCosts.reduce((sum, item) => sum + calculateFixedCostTotal(item), 0)
    const totalCosts = saleCosts + shippingCosts + fixedCostsTotal
    const profit = revenue - totalCosts
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0

    const venturesToProcess = ventureFilter ? ventures.filter((v) => v.id === ventureFilter) : ventures
    let totalEmployeePay = 0
    let totalEmployees = 0

    venturesToProcess.forEach((venture) => {
      const timeline = venture.employeeTimeline || []
      const latestEntry = [...timeline].sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''))[0]
      totalEmployees += Number(latestEntry?.employeeCount || 0)

      const ventureSales = sales.filter((sale) => sale.ventureId === venture.id)
      ventureSales.forEach((sale) => {
        const entry = getActiveEmployeeEntry(timeline, sale.date)
        if (entry.profitShare <= 0) return

        const saleRevenue = Number(sale.amount || 0)
        const saleShipping = Number(sale.shippingCost || 0)
        const saleProductCosts = Object.entries(sale.selectedProducts || {}).reduce((sum, [productId, item]) => {
          const product = products.find((p) => p.id === productId)
          if (!product) return sum
          const cost = getProductCost(product, materialsWithStock)
          return sum + cost * Number(item.quantity || 1)
        }, 0)
        const saleFixedCosts = fixedCosts
          .filter((fc) => fc.ventureId === venture.id)
          .reduce((sum, item) => sum + calculateFixedCostTotal(item) / Math.max(ventureSales.length, 1), 0)
        const saleProfit = saleRevenue - saleProductCosts - saleShipping - saleFixedCosts
        if (saleProfit > 0) {
          totalEmployeePay += saleProfit * (entry.profitShare / 100)
        }
      })
    })

    const payPerEmployee = totalEmployees > 0 ? totalEmployeePay / totalEmployees : 0

    return {
      revenue,
      saleCosts,
      shippingCosts,
      costs: fixedCostsTotal,
      totalCosts,
      profit,
      margin,
      sales: filtered.length,
      totalEmployeePay,
      totalEmployees,
      payPerEmployee,
    }
  }, [sales, products, materialsWithStock, fixedCosts, ventures, ventureFilter, dateFilter, filteredFixedCosts])

  const ventureBreakdown = useMemo(() => {
    const isDateInRange = (dateStr) => {
      if (!dateFilter) return true
      if (!dateStr) return false
      const date = new Date(dateStr)
      const now = new Date()
      if (dateFilter === 'month') {
        const monthAgo = new Date(now)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return date >= monthAgo
      }
      if (dateFilter === 'year') {
        const yearAgo = new Date(now)
        yearAgo.setFullYear(yearAgo.getFullYear() - 1)
        return date >= yearAgo
      }
      return true
    }

    return ventures.map((venture) => {
      const ventureSales = sales.filter((sale) => {
        if (sale.ventureId !== venture.id) return false
        if (!isDateInRange(sale.date)) return false
        return true
      })
      const revenue = ventureSales.reduce((sum, sale) => sum + Number(sale.amount || 0), 0)
      const shippingCosts = ventureSales.reduce((sum, sale) => sum + Number(sale.shippingCost || 0), 0)

      const costOfSale = ventureSales.reduce((sum, sale) => {
        return sum + Object.entries(sale.selectedProducts || {}).reduce((productSum, [productId, item]) => {
          const product = products.find((p) => p.id === productId)
          if (!product) return productSum
          return productSum + getProductCost(product, materialsWithStock) * Number(item.quantity || 1)
        }, 0)
      }, 0)

      const ventureFixedCosts = filteredFixedCosts
        .filter((fc) => fc.ventureId === venture.id)
        .reduce((sum, item) => sum + calculateFixedCostTotal(item), 0)

      const timeline = venture.employeeTimeline || []
      let employeePay = 0
      ventureSales.forEach((sale) => {
        const entry = getActiveEmployeeEntry(timeline, sale.date)
        if (entry.profitShare <= 0) return
        const saleRevenue = Number(sale.amount || 0)
        const saleProductCosts = Object.entries(sale.selectedProducts || {}).reduce((sum, [productId, item]) => {
          const product = products.find((p) => p.id === productId)
          if (!product) return sum
          return sum + getProductCost(product, materialsWithStock) * Number(item.quantity || 1)
        }, 0)
        const saleShipping = Number(sale.shippingCost || 0)
        const saleFixedCosts = ventureSales.length > 0 ? ventureFixedCosts / ventureSales.length : 0
        const saleProfit = saleRevenue - saleProductCosts - saleShipping - saleFixedCosts
        if (saleProfit > 0) employeePay += saleProfit * (entry.profitShare / 100)
      })

      const netProfit = revenue - costOfSale - shippingCosts - ventureFixedCosts - employeePay

      return {
        id: venture.id,
        name: venture.name,
        revenue,
        costOfSale,
        shippingCosts,
        fixedCosts: ventureFixedCosts,
        employeePay,
        netProfit,
      }
    })
  }, [ventures, sales, products, materialsWithStock, filteredFixedCosts, dateFilter])

  const stats = useMemo(() => {
    const revenue = sales.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    const shippingCosts = sales.reduce((sum, item) => sum + Number(item.shippingCost || 0), 0)
    return {
      ventures: ventures.length,
      materials: materials.length,
      products: products.length,
      sales: sales.length,
      revenue,
      shippingCosts,
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
    dateFilter,
    setDateFilter,
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
    ventureBreakdown,
    stats,
    recent,
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
    addFixedCost,
    updateFixedCost,
    removeFixedCost,
  }
}
