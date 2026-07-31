import { useMemo, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { useAppState } from './hooks/useAppState'
import { DashboardView } from './views/DashboardView'
import { VenturesView } from './views/VenturesView'
import { InventoryView } from './views/InventoryView'
import { FinanceView } from './views/FinanceView'
import { SalesView } from './views/SalesView'
import { Modal } from './components/Modal'
import { formatMoney } from './models/appModel'

function App() {
  const {
    view,
    setView,
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
  } = useAppState()

  const [ventureForm, setVentureForm] = useState({ name: '', description: '' })

  const handleOpenVentureModal = (venture = null) => {
    openModal('venture', venture)
    setVentureForm({ name: venture?.name || '', description: venture?.description || '' })
  }

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
    selectedProducts: {},
  })

  const currentView = useMemo(() => {
    if (view === 'ventures') return <VenturesView ventures={ventures} products={products} filteredVentures={filteredVentures} search={search} onSearch={setSearch} onOpenModal={handleOpenVentureModal} onDelete={(type, item) => { if (type === 'venture') removeVenture(item.id); if (type === 'material') removeMaterial(item.id); if (type === 'product') removeProduct(item.id) }} onSaveProduct={(productData, productId) => { if (productId) updateProduct(productId, productData); else createProduct(productData) }} />
    if (view === 'inventory') return <InventoryView materials={materials} filteredMaterials={filteredMaterials} search={search} onSearch={setSearch} onOpenModal={(type, item) => { if (type === 'material') { openModal(type, item); setDraft(item?.name || '') } }} onDelete={(type, item) => { if (type === 'material') removeMaterial(item.id) }} />
    if (view === 'finance') return <FinanceView fixedCosts={fixedCosts} stats={stats} />
    if (view === 'sales') return <SalesView sales={sales} ventures={ventures} products={products} onOpenModal={openModal} />
    return <DashboardView stats={stats} onNavigate={setView} />
  }, [createProduct, filteredMaterials, filteredVentures, fixedCosts, materials, openModal, products, removeMaterial, removeProduct, removeVenture, sales, search, setSearch, setView, stats, updateProduct, ventures, view])

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
        <Modal title='Agregar material' description='Registra un material para tu inventario' onClose={closeModal}>
          <div className='space-y-4'>
            <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder='Nombre del material' className='w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
            <div className='flex justify-end gap-3'>
              <button type='button' onClick={closeModal} className='rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700'>Cancelar</button>
              <button type='button' onClick={() => addMaterial(draft)} className='rounded-full bg-[#168467] px-4 py-2 text-sm font-semibold text-white'>Guardar</button>
            </div>
          </div>
        </Modal>
      )
    }

    if (modal === 'sale') {
      const selectedSaleVentureId = saleForm.ventureId || ventures[0]?.id || ''
      const availableProducts = products.filter((product) => product.ventureId === selectedSaleVentureId)
      const totalCost = availableProducts.reduce((sum, product) => {
        const selectedProduct = saleForm.selectedProducts[product.id] || {}
        const quantity = Number(selectedProduct.quantity || 1)
        return sum + Number(product.cost || 0) * quantity
      }, 0)
      const priceValue = Number(saleForm.price || 0)
      const computedMargin = totalCost > 0 && priceValue > 0 ? ((priceValue - totalCost) / totalCost) * 100 : 0
      const displayedMargin = saleForm.margin === '' ? computedMargin : Number(saleForm.margin || 0)

      return (
        <Modal title='Registrar venta' description='Selecciona productos, variantes y cantidades.' onClose={closeModal}>
          <form
            className='space-y-5'
            onSubmit={(event) => {
              event.preventDefault()
              if (selectedSaleVentureId) {
                addSale({
                  ventureId: selectedSaleVentureId,
                  date: saleForm.date,
                  amount: Number(saleForm.price || 0),
                  phone: saleForm.phone,
                  location: saleForm.location,
                  selectedProducts: saleForm.selectedProducts,
                  margin: saleForm.margin,
                })
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
                onChange={(event) => setSaleForm((current) => ({ ...current, ventureId: event.target.value, selectedProducts: {} }))}
                className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72]'
                required
              >
                <option value=''>Selecciona un emprendimiento</option>
                {ventures.map((venture) => (
                  <option key={venture.id} value={venture.id}>{venture.name}</option>
                ))}
              </select>
            </label>

            <section className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
              <h3 className='text-lg font-semibold text-[#082d72]'>Productos vendidos</h3>
              <p className='mt-1 text-sm text-slate-500'>Marca productos, selecciona su variante e indica la cantidad.</p>
              {availableProducts.length ? (
                <div className='mt-4 space-y-3'>
                  {availableProducts.map((product) => {
                    const selectedProduct = saleForm.selectedProducts[product.id] || {}

                    return (
                      <div key={product.id} className='rounded-2xl border border-slate-200 bg-slate-50 p-3'>
                        <div className='flex items-center justify-between gap-3'>
                          <div>
                            <p className='font-semibold text-slate-800'>{product.name}</p>
                            <p className='text-sm text-slate-500'>{product.description || 'Producto disponible'}</p>
                          </div>
                          <span className='rounded-full bg-[#082d72]/10 px-3 py-1 text-xs font-semibold text-[#082d72]'>Disponible</span>
                        </div>
                        <div className='mt-3 grid gap-3 sm:grid-cols-2'>
                          <label className='block'>
                            <span className='mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>Variante</span>
                            <select
                              value={selectedProduct.variant || ''}
                              onChange={(event) => setSaleForm((current) => ({
                                ...current,
                                selectedProducts: {
                                  ...current.selectedProducts,
                                  [product.id]: { ...current.selectedProducts[product.id], variant: event.target.value },
                                },
                              }))}
                              className='w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#082d72]'
                            >
                              <option value=''>Selecciona variante</option>
                              <option value='Unidad'>Unidad</option>
                              <option value='Por mayor'>Por mayor</option>
                              <option value='Personalizada'>Personalizada</option>
                            </select>
                          </label>
                          <label className='block'>
                            <span className='mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>Cantidad</span>
                            <input
                              type='number'
                              min='1'
                              value={selectedProduct.quantity || 1}
                              onChange={(event) => setSaleForm((current) => ({
                                ...current,
                                selectedProducts: {
                                  ...current.selectedProducts,
                                  [product.id]: { ...current.selectedProducts[product.id], quantity: Number(event.target.value) || 1 },
                                },
                              }))}
                              className='w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#082d72]'
                            />
                          </label>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className='mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500'>
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
        <Sidebar currentView={view} onNavigate={setView} />

        <main className='flex-1 p-4 sm:p-6 lg:p-8'>
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
