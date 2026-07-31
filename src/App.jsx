import { useMemo } from 'react'
import { Sidebar } from './components/Sidebar'
import { useAppState } from './hooks/useAppState'
import { DashboardView } from './views/DashboardView'
import { VenturesView } from './views/VenturesView'
import { InventoryView } from './views/InventoryView'
import { FinanceView } from './views/FinanceView'
import { SalesView } from './views/SalesView'

function App() {
  const {
    view,
    setView,
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
  } = useAppState()

  const currentView = useMemo(() => {
    if (view === 'ventures') {
      return (
        <VenturesView
          ventures={ventures}
          products={products}
          materials={materials}
          filteredVentures={filteredVentures}
          search={search}
          onSearch={setSearch}
          onCreateVenture={createVenture}
          onUpdateVenture={updateVenture}
          onDeleteVenture={removeVenture}
          onCreateProduct={createProduct}
          onUpdateProduct={updateProduct}
          onDeleteProduct={removeProduct}
        />
      )
    }

    if (view === 'inventory') {
      return (
        <InventoryView
          materials={materials}
          filteredMaterials={filteredMaterials}
          search={search}
          onSearch={setSearch}
          onCreateMaterial={createMaterial}
          onUpdateMaterial={updateMaterial}
          onDeleteMaterial={removeMaterial}
        />
      )
    }

    if (view === 'finance') return <FinanceView fixedCosts={fixedCosts} stats={stats} />
    if (view === 'sales') return <SalesView sales={sales} ventures={ventures} products={products} onCreateSale={createSale} />

    return <DashboardView stats={stats} onNavigate={setView} />
  }, [createMaterial, createProduct, createSale, createVenture, filteredMaterials, filteredVentures, fixedCosts, materials, products, removeMaterial, removeProduct, removeVenture, sales, search, setSearch, setView, stats, updateMaterial, updateProduct, updateVenture, ventures, view])

  return (
    <div className='min-h-screen bg-[#f6f3eb] text-slate-800'>
      <div className='flex min-h-screen flex-col lg:flex-row'>
        <Sidebar currentView={view} onNavigate={setView} />

        <main className='flex-1 p-4 sm:p-6 lg:p-8'>
          {currentView}
        </main>
      </div>
    </div>
  )
}

export default App
