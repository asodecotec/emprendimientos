import { NAV_ITEMS } from '../models/appModel'

export function Sidebar({ currentView, onNavigate }) {
  return (
    <aside className='hidden w-72 shrink-0 bg-[#082d72] p-6 text-white lg:flex lg:flex-col'>
      <div className='mb-8'>
        <p className='text-2xl font-semibold tracking-wide'>Asodeco</p>
        <p className='mt-2 text-sm text-blue-100'>Gestión de emprendimientos</p>
      </div>

      <nav className='space-y-2'>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            type='button'
            onClick={() => onNavigate(item.key)}
            className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${currentView === item.key ? 'bg-white/15 text-white' : 'text-blue-100 hover:bg-white/10'}`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className='mt-auto rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-blue-100'>
        <p className='font-semibold text-white'>Herramienta operativa</p>
        <p className='mt-2 leading-relaxed'>Administra inventario, costos y ventas desde un tablero central.</p>
      </div>
    </aside>
  )
}
