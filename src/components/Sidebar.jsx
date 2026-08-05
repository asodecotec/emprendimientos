import { NAV_ITEMS } from '../models/appModel'

export function Sidebar({ currentView, onNavigate, open, onClose }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />
      <aside className={`fixed top-0 left-0 z-50 flex h-screen w-72 shrink-0 flex-col bg-[#082d72] p-6 text-white transition-transform duration-200 lg:sticky lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className='mb-8 flex items-start justify-between gap-4'>
          <div>
            <p className='text-2xl font-semibold tracking-wide'>ASODECO</p>
            <p className='mt-2 text-sm text-blue-100'>Gestión de emprendimientos</p>
          </div>
          <button type='button' onClick={onClose} aria-label='Cerrar menú' className='rounded-lg p-1 text-blue-100 hover:bg-white/10 lg:hidden'>
            <svg className='h-6 w-6' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <line x1='18' y1='6' x2='6' y2='18' />
              <line x1='6' y1='6' x2='18' y2='18' />
            </svg>
          </button>
        </div>

        <nav className='space-y-2'>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type='button'
              onClick={() => {
                onNavigate(item.key)
                onClose()
              }}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${currentView === item.key ? 'bg-white/15 text-white' : 'text-blue-100 hover:bg-white/10'}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
    </>
  )
}
