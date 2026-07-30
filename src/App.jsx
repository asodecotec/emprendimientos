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
      return (
        <Modal title='Agregar venta' description='Registra una nueva venta' onClose={closeModal}>
          <div className='space-y-4'>
            <div className='rounded-2xl bg-slate-50 p-4'>
              <p className='text-sm font-semibold text-slate-700'>Ventas registradas: {sales.length}</p>
              <p className='mt-2 text-sm text-slate-500'>Monto total: {formatMoney(sales.reduce((sum, item) => sum + Number(item.amount || 0), 0))}</p>
            </div>
            <div className='flex justify-end gap-3'>
              <button type='button' onClick={closeModal} className='rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700'>Cancelar</button>
              <button type='button' onClick={() => addSale(ventures[0]?.id)} className='rounded-full bg-[#168467] px-4 py-2 text-sm font-semibold text-white'>Guardar</button>
            </div>
          </div>
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
