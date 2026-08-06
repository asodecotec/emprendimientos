import { useCallback, useMemo, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { AuthPage } from './components/AuthPage'
import { useAuth } from './hooks/useAuth'
import { useAppState } from './hooks/useAppState'
import { MATERIAL_UNITS, FIXED_COST_FREQUENCIES, getProductCost } from './models/appModel'
import { DashboardView } from './views/DashboardView'
import { VenturesView } from './views/VenturesView'
import { ProductsView } from './views/ProductsView'
import { InventoryView } from './views/InventoryView'
import { PurchasesView } from './views/PurchasesView'
import { FinanceView } from './views/FinanceView'
import { SalesView } from './views/SalesView'
import { Modal } from './components/Modal'

function App() {
  const {
    view,
    setView,
    search,
    setSearch,
    ventureFilter,
    setVentureFilter,
    modal,
    openModal,
    closeModal,
    activeItem,
    ventures,
    materials,
    products,
    purchases,
    filteredVentures,
    filteredPurchases,
    filteredProducts,
    filteredSales,
    filteredFixedCosts,
    financeStats,
    materialsWithStock,
    filteredMaterialsWithStock,
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
  } = useAppState()

  const {
    user,
    isGuest,
    loadingAuth,
    authError,
    whitelistPending,
    signInWithGoogle,
    logout,
    continueAsGuest,
  } = useAuth()

  const canEdit = Boolean(user) && !whitelistPending
  const canRead = (Boolean(user) && !whitelistPending) || isGuest
  const canOpenModal = canEdit
  const canDelete = canEdit
  const canCreate = canEdit

  const [ventureForm, setVentureForm] = useState({ name: '', description: '', employeeTimeline: [] })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleOpenVentureModal = useCallback((venture = null) => {
    if (!canOpenModal) return
    openModal('venture', venture)
    setVentureForm({
      name: venture?.name || '',
      description: venture?.description || '',
      employeeTimeline: venture?.employeeTimeline || [],
    })
  }, [openModal, canOpenModal])

  const handleCloseVentureModal = () => {
    closeModal()
    setVentureForm({ name: '', description: '', employeeTimeline: [] })
  }

  const handleSaveVenture = () => {
    saveVenture(ventureForm.name, ventureForm.description, ventureForm.employeeTimeline)
    handleCloseVentureModal()
  }

  const [saleForm, setSaleForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    phone: '',
    location: '',
    ventureId: '',
    price: '',
    shippingCost: '',
    margin: '',
    paid: false,
    soldProducts: [{ productId: '', quantity: 1 }],
  })


  const [purchaseForm, setPurchaseForm] = useState({
    materialId: '',
    ventureId: '',
    date: new Date().toISOString().slice(0, 10),
    quantity: 1,
    cost: '',
  })

  const [materialForm, setMaterialForm] = useState({ name: '', ventureId: '', unit: '' })

  const handleMaterialUnitChange = useCallback((nextUnit) => {
    setMaterialForm((current) => ({ ...current, unit: nextUnit }))
  }, [])

  const handleOpenMaterialModal = useCallback((material = null) => {
    if (!canOpenModal) return
    openModal('material', material)
    setMaterialForm({
      name: material?.name || '',
      ventureId: material?.ventureId || ventureFilter || ventures[0]?.id || '',
      unit: material?.unit || '',
    })
  }, [openModal, ventureFilter, ventures, canOpenModal])

  const [fixedCostForm, setFixedCostForm] = useState({ ventureId: '', name: '', cost: '', startDate: '', frequency: 'monthly', endDate: '' })

  const handleOpenFixedCostModal = useCallback((venture = null, fixedCost = null) => {
    if (!canOpenModal) return
    openModal('fixedCost', fixedCost)
    setFixedCostForm({
      ventureId: fixedCost?.ventureId || venture?.id || ventureFilter || ventures[0]?.id || '',
      name: fixedCost?.name || '',
      cost: fixedCost?.cost != null ? String(fixedCost.cost) : '',
      startDate: fixedCost?.startDate || new Date().toISOString().slice(0, 10),
      frequency: fixedCost?.frequency || 'monthly',
      endDate: fixedCost?.endDate || '',
    })
  }, [openModal, ventureFilter, ventures, canOpenModal])

  const handleSaveFixedCost = () => {
    const name = fixedCostForm.name.trim()
    const cost = Math.max(Number(fixedCostForm.cost || 0), 0)
    if (!name || !fixedCostForm.ventureId) return

    const payload = {
      ventureId: fixedCostForm.ventureId,
      name,
      cost,
      startDate: fixedCostForm.startDate,
      frequency: fixedCostForm.frequency,
    }

    if (activeItem?.id) {
      updateFixedCost({
        ...payload,
        fixedCostId: activeItem.id,
        endDate: fixedCostForm.endDate || null,
      })
    } else {
      addFixedCost(payload)
    }
  }

  const handleOpenPurchaseModal = useCallback(() => {
    if (!canOpenModal) return
    const ventureMaterials = ventureFilter ? materials.filter((material) => material.ventureId === ventureFilter) : materials
    setPurchaseForm({
      materialId: ventureMaterials[0]?.id || '',
      ventureId: ventureFilter || '',
      date: new Date().toISOString().slice(0, 10),
      quantity: 1,
      cost: '',
    })
    openModal('purchase')
  }, [materials, ventureFilter, openModal, canOpenModal])


  const handleOpenSaleModal = useCallback((sale = null) => {
    if (!canOpenModal) return
    const prefilledSoldProducts = Object.entries(sale?.selectedProducts || {}).map(([productId, item]) => ({
      productId,
      quantity: Number(item?.quantity || 1),
    }))
    openModal('sale', sale)
    setSaleForm({
      date: sale?.date || new Date().toISOString().slice(0, 10),
      phone: sale?.phone || '',
      location: sale?.location || '',
      ventureId: sale?.ventureId || ventureFilter || '',
      price: sale?.amount != null ? String(sale.amount) : '',
      shippingCost: sale?.shippingCost != null ? String(sale.shippingCost) : '',
      margin: sale?.margin || '',
      paid: sale?.paid || false,
      soldProducts: prefilledSoldProducts.length ? prefilledSoldProducts : [{ productId: '', quantity: 1 }],
    })
  }, [openModal, ventureFilter, canOpenModal])


  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    ventureId: '',
    materials: [],
  })
  const [productErrors, setProductErrors] = useState({ name: false, ventureId: false })

  const handleOpenProductModal = useCallback((product = null) => {
    openModal('product', product)
    setProductErrors({ name: false, ventureId: false })
    setProductForm({
      name: product?.name || '',
      description: product?.description || '',
      ventureId: product?.ventureId || ventureFilter || ventures[0]?.id || '',
      materials: Object.entries(product?.materials || {}).length ? Object.entries(product.materials).map(([materialId, item]) => ({ materialId, quantity: String(item?.quantity ?? 1) })) : [{ materialId: '', quantity: 1 }],
    })
  }, [openModal, ventureFilter, ventures])

  const handleSaveMaterial = () => {
    const name = materialForm.name.trim()
    const ventureId = materialForm.ventureId
    const unit = materialForm.unit ?? ''

    if (!name || !ventureId) return

    const payload = {
      name,
      ventureId,
      unit,
    }

    if (activeItem) updateMaterial(activeItem.id, payload)
    else addMaterial(payload)
  }

  const handleSaveProduct = () => {
    const name = productForm.name.trim()
    const errors = { name: !name, ventureId: !productForm.ventureId }
    setProductErrors(errors)
    if (errors.name || errors.ventureId) return

    const payload = {
      ventureId: productForm.ventureId,
      name,
      description: productForm.description.trim() || 'Producto nuevo',
      materials: productForm.materials
        .filter((row) => row.materialId)
        .reduce((acc, row) => ({ ...acc, [row.materialId]: { quantity: Math.max(Number(row.quantity) || 1, 1) } }), {}),
    }

    if (activeItem) updateProduct(activeItem.id, payload)
    else createProduct(payload)
    closeModal()
  }

  const updateProductMaterial = (index, field, value) => {
    setProductForm((current) => ({
      ...current,
      materials: current.materials.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    }))
  }

  const addProductMaterial = () => {
    setProductForm((current) => ({
      ...current,
      materials: [...current.materials, { materialId: '', quantity: 1 }],
    }))
  }

  const removeProductMaterial = (index) => {
    setProductForm((current) => ({
      ...current,
      materials: current.materials.filter((_, i) => i !== index),
    }))
  }

  const updateSoldProduct = (index, field, value) => {
    setSaleForm((current) => ({
      ...current,
      soldProducts: current.soldProducts.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    }))
  }

  const addSoldProduct = () => {
    setSaleForm((current) => ({
      ...current,
      soldProducts: [...current.soldProducts, { productId: '', quantity: 1 }],
    }))
  }

  const removeSoldProduct = (index) => {
    setSaleForm((current) => ({
      ...current,
      soldProducts: current.soldProducts.filter((_, i) => i !== index),
    }))
  }

  const handleNavigateToVentureSection = useCallback((ventureId, section) => {
    setVentureFilter(ventureId)
    setView(section)
  }, [setVentureFilter, setView])


  const currentView = useMemo(() => {
    if (view === 'ventures') return <VenturesView ventures={ventures} products={products} filteredVentures={filteredVentures} search={search} onSearch={setSearch} canEdit={canEdit} onOpenModal={(type, item) => { if (type === 'venture') handleOpenVentureModal(item) }} onNavigateToSection={handleNavigateToVentureSection} onDelete={(type, item) => { if (type === 'venture' && canDelete) removeVenture(item.id) }} onAddFixedCost={(venture) => handleOpenFixedCostModal(venture)} onEditFixedCost={(venture, item) => handleOpenFixedCostModal(venture, item)} onDeleteFixedCost={(venture, item) => { if (canDelete) removeFixedCost({ ventureId: venture.id, fixedCostId: item.id }) }} />
    if (view === 'products') return <ProductsView products={products} filteredProducts={filteredProducts} search={search} onSearch={setSearch} materials={materials} ventures={ventures} ventureFilter={ventureFilter} onVentureFilter={setVentureFilter} canEdit={canEdit} onOpenModal={(type, item) => { if (type === 'product') handleOpenProductModal(item) }} onDelete={(type, item) => { if (type === 'product' && canDelete) removeProduct(item.id) }} />
    if (view === 'inventory') return <InventoryView materials={materialsWithStock} filteredMaterials={filteredMaterialsWithStock} search={search} onSearch={setSearch} ventures={ventures} ventureFilter={ventureFilter} onVentureFilter={setVentureFilter} canEdit={canEdit} onOpenModal={(type, item) => { if (type === 'material') handleOpenMaterialModal(item) }} onDelete={(type, item) => { if (type === 'material' && canDelete) removeMaterial(item.id) }} />
    if (view === 'purchases') return <PurchasesView purchases={purchases} filteredPurchases={filteredPurchases} materials={materials} ventures={ventures} ventureFilter={ventureFilter} recent={recent} search={search} onSearch={setSearch} onVentureFilter={setVentureFilter} canEdit={canEdit} onOpenModal={handleOpenPurchaseModal} onDelete={(type, item) => { if (type === 'purchase' && canDelete) removePurchase(item.id) }} />
    if (view === 'finance') return <FinanceView fixedCosts={filteredFixedCosts} stats={financeStats} ventures={ventures} ventureFilter={ventureFilter} onVentureFilter={setVentureFilter} />
    if (view === 'sales') return <SalesView sales={filteredSales} ventures={ventures} products={products} ventureFilter={ventureFilter} recent={recent} search={search} onSearch={setSearch} onVentureFilter={setVentureFilter} canEdit={canEdit} onOpenModal={(type, item) => { if (type === 'sale') handleOpenSaleModal(item) }} onDelete={(type, item) => { if (type === 'sale' && canDelete) removeSale(item.id) }} onTogglePaid={(sale) => updateSale(sale.id, { ...sale, paid: !sale.paid })} />
    return <DashboardView stats={stats} onNavigate={setView} />
  }, [financeStats, filteredFixedCosts, filteredMaterialsWithStock, filteredProducts, filteredPurchases, filteredSales, filteredVentures, handleNavigateToVentureSection, handleOpenFixedCostModal, handleOpenMaterialModal, handleOpenProductModal, handleOpenPurchaseModal, handleOpenSaleModal, handleOpenVentureModal, materials, materialsWithStock, products, purchases, recent, removeFixedCost, removeMaterial, removeProduct, removePurchase, removeSale, removeVenture, search, setSearch, setView, setVentureFilter, stats, updateSale, ventures, ventureFilter, view, canEdit, canDelete])

  const renderModalContent = () => {
    if (!modal) return null

    if (modal === 'venture') {
      return (
        <Modal title={activeItem ? 'Editar emprendimiento' : 'Agregar emprendimiento'} description='Gestiona la información de la línea de negocio' onClose={handleCloseVentureModal}>
          <div className='space-y-4'>
            <input value={ventureForm.name} onChange={(event) => setVentureForm((current) => ({ ...current, name: event.target.value }))} placeholder='Nombre del emprendimiento' className='w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
            <textarea value={ventureForm.description} onChange={(event) => setVentureForm((current) => ({ ...current, description: event.target.value }))} placeholder='Descripción del emprendimiento' rows='3' className='w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
            <div>
              <div className='mb-2 flex items-center justify-between'>
                <div className='w-120'>
                  <span className='text-sm font-semibold text-slate-700'>Compensación de Empleados</span>
                  <p className='text-sm text-slate-400'>La compensación a empleados es mostrada como un registro de los cambios a la compensación y cantidad de empleados a lo largo del tiempo.</p>
                </div>
                <button
                  type='button'
                  onClick={() => setVentureForm((current) => ({
                    ...current,
                    employeeTimeline: [...current.employeeTimeline, { startDate: new Date().toISOString().slice(0, 10), employeeCount: '', profitShare: '' }],
                  }))}
                  className='rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50'
                >
                  + Registrar cambio
                </button>
              </div>
              {ventureForm.employeeTimeline.length === 0 ? (
                <p className='text-sm text-slate-400'>Sin entradas. Los empleados no tendrán ingresos.</p>
              ) : (
                <div className='space-y-3'>
                  {ventureForm.employeeTimeline.map((entry, index) => (
                    <div key={index} className='rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <span className='text-sm text-slate-400 mr-4'>Fecha de Cambio</span>
                          <input
                            type='date'
                            value={entry.startDate}
                            onChange={(event) => setVentureForm((current) => {
                              const updated = [...current.employeeTimeline]
                              updated[index] = { ...updated[index], startDate: event.target.value }
                              return { ...current, employeeTimeline: updated }
                            })}
                            className='rounded-xl border border-slate-300 px-3 py-1.5 text-sm outline-none'
                          />
                        </div>
                        <button
                          type='button'
                          onClick={() => setVentureForm((current) => ({
                            ...current,
                            employeeTimeline: current.employeeTimeline.filter((_, i) => i !== index),
                          }))}
                          className='rounded-full border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50'
                        >
                          Eliminar
                        </button>
                      </div>
                      <div className='grid grid-cols-2 gap-2'>
                        <label className='block'>
                          <span className='mb-1 block text-xs text-slate-500'>Empleados</span>
                          <input
                            type='number'
                            min='0'
                            step='1'
                            value={entry.employeeCount}
                            onChange={(event) => setVentureForm((current) => {
                              const updated = [...current.employeeTimeline]
                              updated[index] = { ...updated[index], employeeCount: event.target.value }
                              return { ...current, employeeTimeline: updated }
                            })}
                            placeholder='0'
                            className='w-full rounded-xl border border-slate-300 px-3 py-1.5 text-sm outline-none'
                          />
                        </label>
                        <label className='block'>
                          <span className='mb-1 block text-xs text-slate-500'>Compensación (% de Ganancias)</span>
                          <input
                            type='number'
                            min='0'
                            max='100'
                            step='0.1'
                            value={entry.profitShare}
                            onChange={(event) => setVentureForm((current) => {
                              const updated = [...current.employeeTimeline]
                              updated[index] = { ...updated[index], profitShare: event.target.value }
                              return { ...current, employeeTimeline: updated }
                            })}
                            placeholder='0'
                            className='w-full rounded-xl border border-slate-300 px-3 py-1.5 text-sm outline-none'
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className='flex justify-end gap-3'>
              <button type='button' onClick={handleCloseVentureModal} className='rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700'>Cancelar</button>
              <button type='button' onClick={handleSaveVenture} className='rounded-full bg-[#082d72] px-4 py-2 text-sm font-semibold text-white'>Guardar</button>
            </div>
          </div>
        </Modal>
      )
    }

    if (modal === 'material') {
      return (
        <Modal title={activeItem ? 'Editar material' : 'Agregar material'} description='Registra un material y asígnalo a un emprendimiento' onClose={closeModal}>
          <div className='space-y-4'>
            <label className='block'>
              <span className='mb-2 block text-sm font-semibold text-slate-700'>Nombre del material</span>
              <input value={materialForm.name} onChange={(event) => setMaterialForm((current) => ({ ...current, name: event.target.value }))} placeholder='Nombre del material' className='w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
            </label>
            <label className='block'>
              <span className='mb-2 block text-sm font-semibold text-slate-700'>Emprendimiento</span>
              <select
                value={materialForm.ventureId}
                onChange={(event) => setMaterialForm((current) => ({ ...current, ventureId: event.target.value }))}
                className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72]'
                required
              >
                <option value=''>Selecciona un emprendimiento</option>
                {ventures.map((venture) => (
                  <option key={venture.id} value={venture.id}>{venture.name}</option>
                ))}
              </select>
            </label>
            <label className='block'>
              <span className='mb-2 block text-sm font-semibold text-slate-700'>Unidad</span>
              <select
                value={materialForm.unit}
                onChange={(event) => handleMaterialUnitChange(event.target.value)}
                className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72]'
              >
                {MATERIAL_UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value}>{unit.label}</option>
                ))}
              </select>
            </label>
            <div className='flex justify-end gap-3'>
              <button type='button' onClick={closeModal} className='rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700'>Cancelar</button>
              <button type='button' onClick={handleSaveMaterial} className='rounded-full bg-[#168467] px-4 py-2 text-sm font-semibold text-white'>Guardar</button>
            </div>
          </div>
        </Modal>
      )
    }

    if (modal === 'product') {
      const productVentureMaterials = materials.filter((material) => material.ventureId === productForm.ventureId)
      return (
        <Modal title={activeItem ? 'Editar producto' : 'Agregar producto'} description='Registra los datos del producto para este emprendimiento' onClose={closeModal}>
          <div className='space-y-4'>
            <label className='block'>
              <span className='mb-2 block text-sm font-semibold text-slate-700'>Nombre del producto</span>
              <input
                value={productForm.name}
                onChange={(event) => {
                  setProductForm((current) => ({ ...current, name: event.target.value }))
                  setProductErrors((current) => ({ ...current, name: false }))
                }}
                className={`w-full rounded-2xl border px-4 py-3 outline-none ${productErrors.name ? 'border-red-400' : 'border-slate-300'}`}
              />
            </label>
            <label className='block'>
              <span className='mb-2 block text-sm font-semibold text-slate-700'>Descripción del producto</span>
              <textarea value={productForm.description} onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))} rows='3' className='w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
            </label>
            <label className='block'>
              <span className='mb-2 block text-sm font-semibold text-slate-700'>Emprendimiento</span>
              <select
                value={productForm.ventureId}
                onChange={(event) => {
                  setProductForm((current) => ({ ...current, ventureId: event.target.value }))
                  setProductErrors((current) => ({ ...current, ventureId: false }))
                }}
                className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72] ${productErrors.ventureId ? 'border-red-400' : 'border-slate-300'}`}
                required
              >
                <option value=''>Selecciona un emprendimiento</option>
                {ventures.map((venture) => (
                  <option key={venture.id} value={venture.id}>{venture.name}</option>
                ))}
              </select>
            </label>

            <section className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
              <h3 className='text-sm font-semibold text-slate-700'>Materiales del producto</h3>
              <p className='mt-1 text-sm text-slate-500'>Selecciona los insumos y la cantidad que requiere este producto.</p>
              <div className='mt-4 space-y-3'>
                {productForm.materials.map((row, index) => {
                  const selectedMaterial = productVentureMaterials.find((m) => m.id === row.materialId)
                  return (
                    <div key={index} className='grid grid-cols-[1fr_auto_auto] gap-2'>
                      <select
                        value={row.materialId}
                        onChange={(event) => updateProductMaterial(index, 'materialId', event.target.value)}
                        className='w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#082d72]'
                      >
                        <option value=''>Selecciona un material</option>
                        {productVentureMaterials.map((material) => (
                          <option key={material.id} value={material.id}>{material.name}</option>
                        ))}
                      </select>
                      <div className='flex items-center gap-1'>
                        <input
                          type='number'
                          min='1'
                          step='1'
                          value={row.quantity}
                          onChange={(event) => updateProductMaterial(index, 'quantity', event.target.value)}
                          placeholder='Cant.'
                          className='w-24 rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#082d72]'
                        />
                        {selectedMaterial?.unit ? <span className='shrink-0 text-xs font-semibold text-slate-500'>{selectedMaterial.unit}</span> : null}
                      </div>
                      <button
                        type='button'
                        onClick={() => removeProductMaterial(index)}
                        className='rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-red-700'
                      >
                        ✕
                      </button>
                    </div>
                  )
                })}
              </div>
              <button
                type='button'
                onClick={addProductMaterial}
                className='mt-4 rounded-full border border-dashed border-[#082d72]/40 px-4 py-2 text-sm font-semibold text-[#082d72]'
              >
                + Agregar material
              </button>
            </section>

            <div className='flex justify-end gap-3'>
              <button type='button' onClick={closeModal} className='rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700'>Cancelar</button>
              <button type='button' onClick={handleSaveProduct} className='rounded-full bg-[#168467] px-4 py-2 text-sm font-semibold text-white'>Guardar</button>
            </div>
          </div>
        </Modal>
      )
    }

    if (modal === 'purchase') {
      const purchaseMaterials = purchaseForm.ventureId ? materials.filter((material) => material.ventureId === purchaseForm.ventureId) : materials
      const selectedMaterialId = purchaseForm.materialId || purchaseMaterials[0]?.id || ''
      const selectedMaterial = purchaseMaterials.find((material) => material.id === selectedMaterialId)
      return (
        <Modal title='Registrar compra' description='Suma stock a un material del inventario.' onClose={closeModal}>
          <form
            className='space-y-5'
            onSubmit={(event) => {
              event.preventDefault()
              if (selectedMaterialId) {
                addPurchase({
                  materialId: selectedMaterialId,
                  date: purchaseForm.date,
                  quantity: purchaseForm.quantity,
                  cost: purchaseForm.cost,
                })
              }
            }}
          >
            <label className='block'>
              <span className='mb-2 block text-sm font-semibold text-slate-700'>Emprendimiento</span>
              <select
                value={purchaseForm.ventureId}
                onChange={(event) => {
                  const nextVentureId = event.target.value
                  const nextMaterials = nextVentureId ? materials.filter((material) => material.ventureId === nextVentureId) : materials
                  setPurchaseForm((current) => ({ ...current, ventureId: nextVentureId, materialId: nextMaterials[0]?.id || '' }))
                }}
                className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72]'
              >
                <option value=''>Todos los emprendimientos</option>
                {ventures.map((venture) => (
                  <option key={venture.id} value={venture.id}>{venture.name}</option>
                ))}
              </select>
            </label>

            <label className='block'>
              <span className='mb-2 block text-sm font-semibold text-slate-700'>Material</span>
              <select
                value={selectedMaterialId}
                onChange={(event) => setPurchaseForm((current) => ({ ...current, materialId: event.target.value }))}
                className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72]'
                required
              >
                <option value=''>Selecciona un material</option>
                {purchaseMaterials.map((material) => (
                  <option key={material.id} value={material.id}>{material.name}</option>
                ))}
              </select>
            </label>

            <div className='grid gap-4 sm:grid-cols-3'>
              <label className='block'>
                <span className='mb-2 block text-sm font-semibold text-slate-700'>Fecha</span>
                <input
                  type='date'
                  value={purchaseForm.date}
                  onChange={(event) => setPurchaseForm((current) => ({ ...current, date: event.target.value }))}
                  className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72]'
                  required
                />
              </label>
              <label className='block'>
                <span className='mb-2 block text-sm font-semibold text-slate-700'>Cantidad</span>
                <div className='flex items-center gap-2'>
                  <input
                    type='number'
                    min='1'
                    step='1'
                    value={purchaseForm.quantity}
                    onChange={(event) => setPurchaseForm((current) => ({ ...current, quantity: event.target.value }))}
                    className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72]'
                    required
                  />
                  {selectedMaterial?.unit ? <span className='shrink-0 text-sm font-semibold text-slate-500'>{selectedMaterial.unit}</span> : null}
                </div>
              </label>
              <label className='block'>
                <span className='mb-2 block text-sm font-semibold text-slate-700'>Precio pagado</span>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={purchaseForm.cost}
                  onChange={(event) => setPurchaseForm((current) => ({ ...current, cost: event.target.value }))}
                  placeholder='0'
                  className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72]'
                />
              </label>
            </div>

            <div className='flex justify-end gap-3'>
              <button type='button' onClick={closeModal} className='rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700'>Cancelar</button>
              <button type='submit' className='rounded-full bg-[#168467] px-4 py-2 text-sm font-semibold text-white'>Guardar compra</button>
            </div>
          </form>
        </Modal>
      )
    }

    if (modal === 'sale') {
      const selectedSaleVentureId = saleForm.ventureId || ventures[0]?.id || ''
      const availableProducts = products.filter((product) => product.ventureId === selectedSaleVentureId)
      const totalCost = saleForm.soldProducts.reduce((sum, row) => {
        if (!row.productId) return sum
        const product = products.find((item) => item.id === row.productId)
        if (!product) return sum
        return sum + getProductCost(product, materials) * Math.max(Number(row.quantity) || 1, 1)
      }, 0)
      const priceValue = Number(saleForm.price || 0)
      const computedMargin = totalCost > 0 && priceValue > 0 ? ((priceValue - totalCost) / totalCost) * 100 : 0
      const displayedMargin = saleForm.margin === '' ? computedMargin : Number(saleForm.margin || 0)

      return (
        <Modal title={activeItem ? 'Editar venta' : 'Registrar venta'} description='Selecciona productos, variantes y cantidades.' onClose={closeModal}>
          <form
            className='space-y-5'
            onSubmit={(event) => {
              event.preventDefault()
              if (selectedSaleVentureId) {
                const soldProductsMap = saleForm.soldProducts
                  .filter((row) => row.productId)
                  .reduce((acc, row) => ({
                    ...acc,
                    [row.productId]: { quantity: Math.max(Number(row.quantity) || 1, 1) },
                  }), {})
                const payload = {
                  ventureId: selectedSaleVentureId,
                  date: saleForm.date,
                  amount: Number(saleForm.price || 0),
                  shippingCost: Number(saleForm.shippingCost || 0),
                  phone: saleForm.phone,
                  location: saleForm.location,
                  selectedProducts: soldProductsMap,
                  margin: saleForm.margin,
                  paid: saleForm.paid,
                }
                if (activeItem) updateSale(activeItem.id, payload)
                else addSale(payload)
              }
            }}
          >
            <div className='grid gap-4 sm:grid-cols-2'>
              <label className='block'>
                <span className='mb-2 block text-sm font-semibold text-slate-700'>Fecha</span>
                <input
                  type='date'
                  value={saleForm.date}
                  onChange={(event) => setSaleForm((current) => ({ ...current, date: event.target.value }))}
                  className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72]'
                  required
                />
              </label>
              <label className='block'>
                <span className='mb-2 block text-sm font-semibold text-slate-700'>Teléfono de contacto (opcional)</span>
                <input
                  type='tel'
                  value={saleForm.phone}
                  onChange={(event) => setSaleForm((current) => ({ ...current, phone: event.target.value }))}
                  placeholder='Ej. 300 123 4567'
                  className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72]'
                />
              </label>
            </div>

            <label className='block'>
              <span className='mb-2 block text-sm font-semibold text-slate-700'>Lugar de venta (opcional)</span>
              <input
                type='text'
                value={saleForm.location}
                onChange={(event) => setSaleForm((current) => ({ ...current, location: event.target.value }))}
                placeholder='Ciudad, punto de venta o referencia'
                className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72]'
              />
            </label>

            <label className='flex items-center gap-3'>
              <input
                type='checkbox'
                checked={saleForm.paid}
                onChange={(event) => setSaleForm((current) => ({ ...current, paid: event.target.checked }))}
                className='h-4 w-4 rounded border-slate-300 text-[#082d72] focus:ring-[#082d72]'
              />
              <span className='text-sm font-semibold text-slate-700'>Pagada</span>
            </label>

            <label className='block'>
              <span className='mb-2 block text-sm font-semibold text-slate-700'>Emprendimiento</span>
              <select
                value={selectedSaleVentureId}
                onChange={(event) => setSaleForm((current) => ({ ...current, ventureId: event.target.value, soldProducts: [{ productId: '', quantity: 1 }] }))}
                className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72]'
                required
              >
                <option value=''>Selecciona un emprendimiento</option>
                {ventures.map((venture) => (
                  <option key={venture.id} value={venture.id}>{venture.name}</option>
                ))}
              </select>
            </label>

            <section className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
              <h3 className='text-sm font-semibold text-slate-700'>Productos vendidos</h3>
              <p className='mt-1 text-sm text-slate-500'>Selecciona los productos y la cantidad vendida.</p>
              {availableProducts.length ? (
                <>
                  <div className='mt-4 space-y-3'>
                    {saleForm.soldProducts.map((row, index) => (
                      <div key={index} className='grid grid-cols-[1fr_96px_auto] gap-2'>
                        <select
                          value={row.productId}
                          onChange={(event) => updateSoldProduct(index, 'productId', event.target.value)}
                          className='w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#082d72]'
                        >
                          <option value=''>Selecciona un producto</option>
                          {availableProducts.map((product) => (
                            <option key={product.id} value={product.id}>{product.name}</option>
                          ))}
                        </select>
                        <input
                          type='number'
                          min='1'
                          step='1'
                          value={row.quantity}
                          onChange={(event) => updateSoldProduct(index, 'quantity', event.target.value)}
                          placeholder='Cant.'
                          className='w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#082d72]'
                        />
                        <button
                          type='button'
                          onClick={() => removeSoldProduct(index)}
                          className='rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-red-700'
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type='button'
                    onClick={addSoldProduct}
                    className='mt-4 rounded-full border border-dashed border-[#082d72]/40 px-4 py-2 text-sm font-semibold text-[#082d72]'
                  >
                    + Agregar producto
                  </button>
                </>
              ) : (
                <div className='mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-center text-sm text-slate-500'>
                  Selecciona un emprendimiento con productos disponibles.
                </div>
              )}
            </section>

            <section className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
              <h3 className='text-lg font-semibold text-[#082d72]'>Importes de la venta</h3>
              <div className='mt-4 grid gap-4 sm:grid-cols-2'>
                <label className='block'>
                  <span className='mb-2 block text-sm font-semibold text-slate-700'>Costo total</span>
                  <input
                    type='number'
                    value={totalCost}
                    placeholder='0'
                    className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72]'
                    readOnly
                  />
                </label>
                <label className='block'>
                  <span className='mb-2 block text-sm font-semibold text-slate-700'>Costo de envío</span>
                  <input
                    type='number'
                    value={saleForm.shippingCost}
                    min='0'
                    step='0.01'
                    onChange={(event) => setSaleForm((current) => ({ ...current, shippingCost: event.target.value }))}
                    placeholder='0'
                    className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72]'
                  />
                </label>
                <label className='block'>
                  <span className='mb-2 block text-sm font-semibold text-slate-700'>Precio total de venta</span>
                  <input
                    type='number'
                    value={saleForm.price}
                    min='0'
                    step='0.01'
                    onChange={(event) => {
                      const nextPrice = event.target.value
                      const nextMargin = totalCost > 0 && Number(nextPrice) > 0 ? ((Number(nextPrice) - totalCost) / totalCost) * 100 : 0
                      setSaleForm((current) => ({ ...current, price: nextPrice, margin: String(nextMargin) }))
                    }}
                    placeholder='0'
                    className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72]'
                    required
                  />
                </label>
                <label className='block'>
                  <span className='mb-2 block text-sm font-semibold text-slate-700'>Margen %</span>
                  <input
                    type='number'
                    value={displayedMargin}
                    step='0.01'
                    onChange={(event) => {
                      const nextMargin = event.target.value
                      const nextPrice = totalCost > 0 ? totalCost * (1 + Number(nextMargin || 0) / 100) : 0
                      setSaleForm((current) => ({ ...current, margin: nextMargin, price: String(nextPrice) }))
                    }}
                    placeholder='0'
                    className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72]'
                  />
                </label>
              </div>
              <p className='mt-3 text-sm text-slate-500'>Puedes cambiar el precio para calcular el margen o cambiar el margen para calcular el precio.</p>
            </section>

            <div className='flex justify-end gap-3'>
              <button type='button' onClick={closeModal} className='rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700'>Cancelar</button>
              <button type='submit' className='rounded-full bg-[#082d72] px-4 py-2 text-sm font-semibold text-white'>Guardar venta</button>
            </div>
          </form>
        </Modal>
      )
    }

    if (modal === 'fixedCost') {
      return (
        <Modal title={activeItem?.id ? 'Editar costo fijo' : 'Agregar costo fijo'} description='Registra un gasto recurrente del emprendimiento' onClose={closeModal}>
          <div className='space-y-4'>
            <label className='block'>
              <span className='mb-2 block text-sm font-semibold text-slate-700'>Emprendimiento</span>
              <select
                value={fixedCostForm.ventureId}
                onChange={(event) => setFixedCostForm((current) => ({ ...current, ventureId: event.target.value }))}
                className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72]'
              >
                <option value=''>Selecciona un emprendimiento</option>
                {ventures.map((venture) => (
                  <option key={venture.id} value={venture.id}>{venture.name}</option>
                ))}
              </select>
            </label>
            <label className='block'>
              <span className='mb-2 block text-sm font-semibold text-slate-700'>Nombre del costo</span>
              <input value={fixedCostForm.name} onChange={(event) => setFixedCostForm((current) => ({ ...current, name: event.target.value }))} placeholder='Ej. Alquiler' className='w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
            </label>
            <div className='grid gap-4 sm:grid-cols-2'>
              <label className='block'>
                <span className='mb-2 block text-sm font-semibold text-slate-700'>Monto ($)</span>
                <input type='number' min='0' step='0.01' value={fixedCostForm.cost} onChange={(event) => setFixedCostForm((current) => ({ ...current, cost: event.target.value }))} placeholder='0' className='w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
              </label>
              <label className='block'>
                <span className='mb-2 block text-sm font-semibold text-slate-700'>Frecuencia</span>
                <select
                  value={fixedCostForm.frequency}
                  onChange={(event) => setFixedCostForm((current) => ({ ...current, frequency: event.target.value }))}
                  className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72]'
                >
                  {FIXED_COST_FREQUENCIES.map((freq) => (
                    <option key={freq.value} value={freq.value}>{freq.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className='block'>
              <span className='mb-2 block text-sm font-semibold text-slate-700'>Fecha de inicio</span>
              <input
                type='date'
                value={fixedCostForm.startDate}
                onChange={(event) => setFixedCostForm((current) => ({ ...current, startDate: event.target.value }))}
                className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72]'
                required
              />
            </label>
            {activeItem?.id ? (
              <label className='block'>
                <span className='mb-2 block text-sm font-semibold text-slate-700'>Fecha de fin (opcional)</span>
                <input
                  type='date'
                  value={fixedCostForm.endDate}
                  onChange={(event) => setFixedCostForm((current) => ({ ...current, endDate: event.target.value }))}
                  className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72]'
                />
                <p className='mt-1 text-xs text-slate-500'>Dejar vacío si el costo sigue activo.</p>
              </label>
            ) : null}
            <div className='flex justify-end gap-3'>
              <button type='button' onClick={closeModal} className='rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700'>Cancelar</button>
              <button type='button' onClick={handleSaveFixedCost} className='rounded-full bg-[#082d72] px-4 py-2 text-sm font-semibold text-white'>Guardar</button>
            </div>
          </div>
        </Modal>
      )
    }

    return null
  }

  if (loadingAuth) {
    return (
      <div className='min-h-screen bg-[#f6f3eb] text-slate-800'>
        <div className='flex min-h-screen items-center justify-center'>
          <div className='rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center'>
            <p className='text-lg font-semibold text-[#082d72]'>Cargando sesión...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!canRead) {
    return (
      <AuthPage
        isGuest={isGuest}
        authError={authError}
        loadingAuth={loadingAuth}
        onGoogleSignIn={signInWithGoogle}
        onContinueAsGuest={continueAsGuest}
      />
    )
  }

  return (
    <div className='min-h-screen bg-[#f6f3eb] text-slate-800'>
      <div className='flex min-h-screen flex-col lg:flex-row'>
        <Sidebar currentView={view} onNavigate={setView} open={sidebarOpen} onClose={() => setSidebarOpen(false)} userEmail={user?.email} onLogout={logout} />

        <main className='flex-1 p-4 sm:p-6 lg:p-8'>
          <div className='mb-4 flex items-center justify-between lg:hidden'>
            <p className='text-xl font-semibold text-[#082d72]'>ASODECO</p>
            <button type='button' onClick={() => setSidebarOpen(true)} aria-label='Abrir menú' className='rounded-full bg-[#082d72] p-2 text-white'>
              <svg className='h-6 w-6' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round'>
                <line x1='4' y1='6' x2='20' y2='6' />
                <line x1='4' y1='12' x2='20' y2='12' />
                <line x1='4' y1='18' x2='20' y2='18' />
              </svg>
            </button>
          </div>
          <header className='mb-6 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm'>
            <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
              <div>
                <p className='text-xs uppercase tracking-[0.3em] text-slate-500'>Panel operativo</p>
                <h1 className='mt-2 text-2xl font-semibold text-slate-900'>ASODECO</h1>
                <p className='mt-2 text-sm text-slate-600'>Versión modular y organizada para gestión de emprendimientos.</p>
              </div>
              <div className='flex flex-col items-end gap-2 sm:flex-row sm:items-center'>
                {user ? (
                  <div className='rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700'>
                    {user.email}
                  </div>
                ) : (
                  <div className='rounded-full border border-slate-200 bg-blue-50 px-4 py-2 text-sm text-blue-700'>
                    Invitado
                  </div>
                )}
                <button type='button' onClick={logout} className='rounded-full bg-[#082d72] px-4 py-2 text-sm font-semibold text-white hover:bg-[#061f53]'>Cerrar sesión</button>
              </div>
            </div>
          </header>

          {currentView}
        </main>
      </div>

      {renderModalContent()}
    </div>
  )
}

export default App