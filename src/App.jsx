import { useCallback, useMemo, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { useAppState } from './hooks/useAppState'
import { MATERIAL_UNITS, convertQuantity } from './models/appModel'
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
  } = useAppState()

  const [ventureForm, setVentureForm] = useState({ name: '', description: '' })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleOpenVentureModal = useCallback((venture = null) => {
    openModal('venture', venture)
    setVentureForm({ name: venture?.name || '', description: venture?.description || '' })
  }, [openModal])

  const handleCloseVentureModal = () => {
    closeModal()
    setVentureForm({ name: '', description: '' })
  }

  const handleSaveVenture = () => {
    saveVenture(ventureForm.name, ventureForm.description)
    handleCloseVentureModal()
  }

  const [saleForm, setSaleForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    phone: '',
    location: '',
    ventureId: '',
    price: '',
    margin: '',
    soldProducts: [{ productId: '', quantity: 1 }],
  })


  const [purchaseForm, setPurchaseForm] = useState({
    materialId: '',
    ventureId: '',
    date: new Date().toISOString().slice(0, 10),
    quantity: 1,
    cost: '',
  })

  const [materialForm, setMaterialForm] = useState({ name: '', ventureId: '', unit: 'kg', stock: '', unitPrice: '' })

  const handleMaterialUnitChange = useCallback((nextUnit) => {
    setMaterialForm((current) => {
      const parsedStock = Number(current.stock || 0)
      const convertedStock = Number.isFinite(parsedStock) ? convertQuantity(parsedStock, current.unit, nextUnit) : 0
      return {
        ...current,
        unit: nextUnit,
        stock: Number.isFinite(convertedStock) ? String(convertedStock) : current.stock,
      }
    })
  }, [])

  const handleOpenMaterialModal = useCallback((material = null) => {
    openModal('material', material)
    setMaterialForm({
      name: material?.name || '',
      ventureId: material?.ventureId || ventureFilter || ventures[0]?.id || '',
      unit: material?.unit || 'kg',
      stock: material?.stock != null ? String(material.stock) : '',
      unitPrice: material?.unitPrice != null ? String(material.unitPrice) : material?.cost != null ? String(material.cost) : '',
    })
  }, [openModal, ventureFilter, ventures])

  const handleOpenPurchaseModal = useCallback(() => {
    const ventureMaterials = ventureFilter ? materials.filter((material) => material.ventureId === ventureFilter) : materials
    setPurchaseForm({
      materialId: ventureMaterials[0]?.id || '',
      ventureId: ventureFilter || '',
      date: new Date().toISOString().slice(0, 10),
      quantity: 1,
      cost: '',
    })
    openModal('purchase')
  }, [materials, ventureFilter, openModal])


  const handleOpenSaleModal = useCallback((sale = null) => {
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
      margin: sale?.margin || '',
      soldProducts: prefilledSoldProducts.length ? prefilledSoldProducts : [{ productId: '', quantity: 1 }],
    })
  }, [openModal, ventureFilter])


  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    cost: '',
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
      cost: product?.cost != null ? String(product.cost) : '',
      ventureId: product?.ventureId || ventureFilter || ventures[0]?.id || '',
      materials: product?.materials?.length ? product.materials.map((item) => ({ materialId: item.materialId, quantity: String(item.quantity) })) : [{ materialId: '', quantity: 1 }],
    })
  }, [openModal, ventureFilter, ventures])

  const handleSaveMaterial = () => {
    const name = materialForm.name.trim()
    const ventureId = materialForm.ventureId
    const unit = materialForm.unit || 'ud'
    const stock = Math.max(Number(materialForm.stock || 0), 0)
    const unitPrice = Math.max(Number(materialForm.unitPrice || 0), 0)

    if (!name || !ventureId) return

    const payload = {
      name,
      ventureId,
      unit,
      stock,
      unitPrice,
      cost: unitPrice,
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
      cost: Number(productForm.cost || 0),
      materials: productForm.materials
        .filter((row) => row.materialId)
        .map((row) => ({ materialId: row.materialId, quantity: Math.max(Number(row.quantity) || 1, 1) })),
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
    if (view === 'ventures') return <VenturesView ventures={ventures} products={products} filteredVentures={filteredVentures} search={search} onSearch={setSearch} onOpenModal={(type, item) => { if (type === 'venture') handleOpenVentureModal(item) }} onNavigateToSection={handleNavigateToVentureSection} onDelete={(type, item) => { if (type === 'venture') removeVenture(item.id) }} />
    if (view === 'products') return <ProductsView products={products} filteredProducts={filteredProducts} search={search} onSearch={setSearch} materials={materials} ventures={ventures} ventureFilter={ventureFilter} onVentureFilter={setVentureFilter} onOpenModal={(type, item) => { if (type === 'product') handleOpenProductModal(item) }} onDelete={(type, item) => { if (type === 'product') removeProduct(item.id) }} />
    if (view === 'inventory') return <InventoryView materials={materialsWithStock} filteredMaterials={filteredMaterialsWithStock} search={search} onSearch={setSearch} ventures={ventures} ventureFilter={ventureFilter} onVentureFilter={setVentureFilter} onOpenModal={(type, item) => { if (type === 'material') handleOpenMaterialModal(item) }} onDelete={(type, item) => { if (type === 'material') removeMaterial(item.id) }} />
    if (view === 'purchases') return <PurchasesView purchases={purchases} filteredPurchases={filteredPurchases} materials={materials} ventures={ventures} ventureFilter={ventureFilter} onVentureFilter={setVentureFilter} onOpenModal={handleOpenPurchaseModal} onDelete={(type, item) => { if (type === 'purchase') removePurchase(item.id) }} />
    if (view === 'finance') return <FinanceView fixedCosts={filteredFixedCosts} stats={financeStats} ventures={ventures} ventureFilter={ventureFilter} onVentureFilter={setVentureFilter} />
    if (view === 'sales') return <SalesView sales={filteredSales} ventures={ventures} products={products} ventureFilter={ventureFilter} onVentureFilter={setVentureFilter} onOpenModal={(type, item) => { if (type === 'sale') handleOpenSaleModal(item) }} onDelete={(type, item) => { if (type === 'sale') removeSale(item.id) }} />
    return <DashboardView stats={stats} onNavigate={setView} />
  }, [financeStats, filteredFixedCosts, filteredMaterialsWithStock, filteredProducts, filteredPurchases, filteredSales, filteredVentures, handleNavigateToVentureSection, handleOpenMaterialModal, handleOpenProductModal, handleOpenPurchaseModal, handleOpenSaleModal, handleOpenVentureModal, materials, materialsWithStock, products, purchases, removeMaterial, removeProduct, removePurchase, removeSale, removeVenture, search, setSearch, setView, setVentureFilter, stats, ventures, ventureFilter, view])

  const renderModalContent = () => {
    if (!modal) return null

    if (modal === 'venture') {
      return (
        <Modal title={activeItem ? 'Editar emprendimiento' : 'Agregar emprendimiento'} description='Gestiona la información de la línea de negocio' onClose={handleCloseVentureModal}>
          <div className='space-y-4'>
            <input value={ventureForm.name} onChange={(event) => setVentureForm((current) => ({ ...current, name: event.target.value }))} placeholder='Nombre del emprendimiento' className='w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
            <textarea value={ventureForm.description} onChange={(event) => setVentureForm((current) => ({ ...current, description: event.target.value }))} placeholder='Descripción del emprendimiento' rows='3' className='w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
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
            <div className='grid gap-4 sm:grid-cols-2'>
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
              <label className='block'>
                <span className='mb-2 block text-sm font-semibold text-slate-700'>Cantidad actual</span>
                <input type='number' min='0' step='0.01' value={materialForm.stock} onChange={(event) => setMaterialForm((current) => ({ ...current, stock: event.target.value }))} placeholder='0' className='w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
              </label>
            </div>
            <label className='block'>
              <span className='mb-2 block text-sm font-semibold text-slate-700'>Precio por cantidad</span>
              <input type='number' min='0' step='0.01' value={materialForm.unitPrice} onChange={(event) => setMaterialForm((current) => ({ ...current, unitPrice: event.target.value }))} placeholder='0' className='w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
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
              <span className='mb-2 block text-sm font-semibold text-slate-700'>Costo del producto ($)</span>
              <input type='number' min='0' step='0.01' value={productForm.cost} onChange={(event) => setProductForm((current) => ({ ...current, cost: event.target.value }))} className='w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
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
                {productForm.materials.map((row, index) => (
                  <div key={index} className='grid grid-cols-[1fr_96px_auto] gap-2'>
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
                    <input
                      type='number'
                      min='1'
                      step='1'
                      value={row.quantity}
                      onChange={(event) => updateProductMaterial(index, 'quantity', event.target.value)}
                      placeholder='Cant.'
                      className='w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#082d72]'
                    />
                    <button
                      type='button'
                      onClick={() => removeProductMaterial(index)}
                      className='rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-red-700'
                    >
                      ✕
                    </button>
                  </div>
                ))}
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
                <input
                  type='number'
                  min='1'
                  step='1'
                  value={purchaseForm.quantity}
                  onChange={(event) => setPurchaseForm((current) => ({ ...current, quantity: event.target.value }))}
                  className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72]'
                  required
                />
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
        return sum + Number(product?.cost || 0) * Math.max(Number(row.quantity) || 1, 1)
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
                  phone: saleForm.phone,
                  location: saleForm.location,
                  selectedProducts: soldProductsMap,
                  margin: saleForm.margin,
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
              <div className='mt-4 grid gap-4 sm:grid-cols-3'>
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

    return null
  }

  return (
    <div className='min-h-screen bg-[#f6f3eb] text-slate-800'>
      <div className='flex min-h-screen flex-col lg:flex-row'>
        <Sidebar currentView={view} onNavigate={setView} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className='flex-1 p-4 sm:p-6 lg:p-8'>
          <div className='mb-4 flex items-center justify-between lg:hidden'>
            <p className='text-xl font-semibold text-[#082d72]'>Asodeco</p>
            <button type='button' onClick={() => setSidebarOpen(true)} aria-label='Abrir menú' className='rounded-full bg-[#082d72] p-2 text-white'>
              <svg className='h-6 w-6' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round'>
                <line x1='4' y1='6' x2='20' y2='6' />
                <line x1='4' y1='12' x2='20' y2='12' />
                <line x1='4' y1='18' x2='20' y2='18' />
              </svg>
            </button>
          </div>
          <header className='mb-6 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm'>
            <p className='text-xs uppercase tracking-[0.3em] text-slate-500'>Panel operativo</p>
            <h1 className='mt-2 text-2xl font-semibold text-slate-900'>Asodeco</h1>
            <p className='mt-2 text-sm text-slate-600'>Versión modular y organizada para gestión de emprendimientos.</p>
          </header>

          {currentView}
        </main>
      </div>

      {renderModalContent()}
    </div>
  )
}

export default App
