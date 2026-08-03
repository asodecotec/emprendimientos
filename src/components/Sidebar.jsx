import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../models/appModel'

export function Sidebar() {
  return (
    <aside className='hidden w-72 shrink-0 bg-[#082d72] p-6 text-white lg:flex lg:flex-col lg:sticky lg:top-0 lg:h-screen'>
      <div className='mb-8'>
        <p className='text-2xl font-semibold tracking-wide'>Asodeco</p>
        <p className='mt-2 text-sm text-blue-100'>Gestión de emprendimientos</p>
      </div>

      <nav className='space-y-2'>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            className={({ isActive }) => `block rounded-xl px-4 py-3 text-left text-sm font-medium transition ${isActive ? 'bg-white/15 text-white' : 'text-blue-100 hover:bg-white/10'}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
