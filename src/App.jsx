import { useMemo } from 'react'
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
    records,
    search,
    setSearch,
    modal,
    openModal,
    closeModal,
    draft,
    setDraft,
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
  } = useAppState()

  const currentView = useMemo(() => {
    if (view === 'ventures') return <VenturesView ventures={ventures} products={products} filteredVentures={filteredVentures} search={search} onSearch={setSearch} onOpenModal={openModal} onDelete={(type, item) => { if (type === 'venture') removeVenture(item.id); if (type === 'material') removeMaterial(item.id) }} onAddProduct={(ventureId) => { setDraft(''); openModal('product'); addProduct(ventureId) }} />
    if (view === 'inventory') return <InventoryView materials={materials} filteredMaterials={filteredMaterials} search={search} onSearch={setSearch} onOpenModal={openModal} onDelete={(type, item) => { if (type === 'material') removeMaterial(item.id) }} />
    if (view === 'finance') return <FinanceView fixedCosts={fixedCosts} stats={stats} />
    if (view === 'sales') return <SalesView sales={sales} ventures={ventures} products={products} onOpenModal={openModal} />
    return <DashboardView stats={stats} onNavigate={setView} />
  }, [filteredMaterials, filteredVentures, fixedCosts, materials, openModal, products, removeMaterial, removeVenture, sales, search, setDraft, setSearch, setView, stats, ventures, view])

  const renderModalContent = () => {
    if (!modal) return null

    if (modal === 'venture') {
      return (
        <Modal title='Agregar emprendimiento' description='Crea una nueva línea de negocio' onClose={closeModal}>
          <div className='space-y-4'>
            <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder='Nombre del emprendimiento' className='w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
            <div className='flex justify-end gap-3'>
              <button type='button' onClick={closeModal} className='rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700'>Cancelar</button>
              <button type='button' onClick={addVenture} className='rounded-full bg-[#082d72] px-4 py-2 text-sm font-semibold text-white'>Guardar</button>
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
              <button type='button' onClick={addMaterial} className='rounded-full bg-[#168467] px-4 py-2 text-sm font-semibold text-white'>Guardar</button>
            </div>
          </div>
        </Modal>
      )
    }

    if (modal === 'product') {
      return (
        <Modal title='Agregar producto' description='Asocia el producto con un emprendimiento' onClose={closeModal}>
          <div className='space-y-4'>
            <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder='Nombre del producto' className='w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
            <div className='flex justify-end gap-3'>
              <button type='button' onClick={closeModal} className='rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700'>Cancelar</button>
              <button type='button' onClick={() => addProduct(ventures[0]?.id)} className='rounded-full bg-[#082d72] px-4 py-2 text-sm font-semibold text-white'>Guardar</button>
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
      <div className='mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row'>
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
