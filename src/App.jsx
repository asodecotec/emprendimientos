import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { useAppState } from './hooks/useAppState'
import { DashboardView } from './views/DashboardView'
import { VenturesView } from './views/VenturesView'
import { InventoryView } from './views/InventoryView'
import { FinanceView } from './views/FinanceView'
import { SalesView } from './views/SalesView'

function AppShell() {
  const { records, setRecords } = useAppState()

  return (
    <div className='min-h-screen bg-[#f6f3eb] text-slate-800'>
      <div className='flex min-h-screen flex-col lg:flex-row'>
        <Sidebar />

        <main className='flex-1 p-4 sm:p-6 lg:p-8'>
          <Routes>
            <Route path='/' element={<Navigate to='/dashboard' replace />} />
            <Route path='/dashboard' element={<DashboardView records={records} />} />
            <Route path='/ventures' element={<VenturesView records={records} onRecordsChange={setRecords} />} />
            <Route path='/inventory' element={<InventoryView records={records} onRecordsChange={setRecords} />} />
            <Route path='/finance' element={<FinanceView records={records} />} />
            <Route path='/sales' element={<SalesView records={records} onRecordsChange={setRecords} />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App
