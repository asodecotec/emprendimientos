import { useMemo, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { Modal } from '../components/Modal'
import { formatMoney } from '../models/appModel'

export function VenturesView({ ventures, products, filteredVentures, search, onSearch, onOpenModal, onDelete, onNavigateToSection, onAddFixedCost, onEditFixedCost, onDeleteFixedCost, canEdit }) {
  const [pendingDelete, setPendingDelete] = useState(null)

  const ventureProductCounts = useMemo(() => {
    const map = {}
    for (const product of products) {
      map[product.ventureId] = (map[product.ventureId] || 0) + 1
    }
    return map
  }, [products])

  const openDeleteConfirm = (venture) => {
    setPendingDelete(venture)
  }

  const closeDeleteConfirm = () => {
    setPendingDelete(null)
  }

  const confirmDelete = () => {
    if (!pendingDelete) return

    onDelete('venture', pendingDelete)
    closeDeleteConfirm()
  }

  return (
    <section className='space-y-6'>
      <header className='flex flex-col justify-between gap-4 sm:flex-row sm:items-end'>
        <div>
          <p className='mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1769aa]'>Emprendimientos</p>
          <h1 className='text-3xl font-semibold text-[#082d72]'>Gestiona tus líneas de negocio</h1>
          <p className='mt-2 text-sm text-slate-600'>Organiza cada emprendimiento y accede rápido a sus secciones.</p>
          {!canEdit ? <p className='mt-2 text-sm font-semibold text-blue-700'>Modo invitado: solo lectura</p> : null}
        </div>
        {canEdit ? (
          <button type='button' onClick={() => onOpenModal('venture')} className='rounded-full bg-[#082d72] px-4 py-2 text-sm font-semibold text-white'>+ Nuevo emprendimiento</button>
        ) : null}
      </header>

      <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder='Buscar emprendimiento' className='w-full max-w-md rounded-2xl border border-slate-300 px-4 py-3 outline-none' />

      <div className='space-y-4'>
        {filteredVentures.map((venture) => {
          const ventureProductCount = ventureProductCounts[venture.id] || 0
          return (
            <article key={venture.id} className='rounded-3xl border border-slate-200 bg-white p-5 shadow-sm'>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                <div>
                  <h2 className='text-lg font-semibold text-slate-900'>{venture.name}</h2>
                  <p className='mt-1 text-sm text-slate-500'>{venture.description}</p>
                  <p className='mt-3 text-sm font-semibold text-[#1769aa]'>{ventureProductCount} producto(s)</p>
                  {(() => {
                    const timeline = venture.employeeTimeline || []
                    if (!timeline.length) return null
                    const sorted = [...timeline].sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''))
                    const current = sorted[0]
                    return (
                      <div className='mt-1 space-y-1'>
                        {current.employeeCount > 0 || current.profitShare > 0 ? (
                          <p className='text-sm text-slate-500'>
                            {current.employeeCount > 0 ? `${current.employeeCount} empleado(s)` : ''}
                            {current.employeeCount > 0 && current.profitShare > 0 ? ' · ' : ''}
                            {current.profitShare > 0 ? `Compensación de ${current.profitShare}% ` : ''}
                          </p>
                        ) : null}
                        {sorted.length > 1 ? (
                          <p className='text-xs text-slate-400'>{sorted.length} cambio(s) en el tiempo</p>
                        ) : null}
                      </div>
                    )
                  })()}
                </div>
                <div className='flex flex-wrap gap-2'>
                  {canEdit ? (
                    <>
                      <button type='button' onClick={() => onOpenModal('venture', venture)} className='rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700'>Editar</button>
                      <button type='button' onClick={() => openDeleteConfirm(venture)} className='rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-red-700'>Eliminar</button>
                    </>
                  ) : null}
                </div>
              </div>
              <div className='mt-4 border-t border-slate-100 pt-4'>
                <div className='mb-2 flex items-center justify-between'>
                  <p className='text-xs font-semibold uppercase tracking-[0.2em] text-slate-400'>Costos fijos</p>
                  {canEdit ? (
                    <button type='button' onClick={() => onAddFixedCost(venture)} className='rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50'>+ Agregar</button>
                  ) : null}
                </div>
                {venture.fixedCosts?.length ? (
                  <ul className='space-y-2'>
                    {venture.fixedCosts.map((item) => (
                      <li key={item.id} className='flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-2.5'>
                        <div>
                          <p className='text-sm font-semibold text-slate-900'>{item.name}</p>
                          <p className='text-sm font-semibold text-[#168467]'>{formatMoney(item.cost)}</p>
                        </div>
                        <div className='flex shrink-0 gap-2'>
                          {canEdit ? (
                            <>
                              <button type='button' onClick={() => onEditFixedCost(venture, item)} className='rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100'>Editar</button>
                              <button type='button' onClick={() => onDeleteFixedCost(venture, item)} className='rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50'>Eliminar</button>
                            </>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='text-sm text-slate-400'>Sin costos fijos registrados.</p>
                )}
              </div>
              <div className='mt-4 border-t border-slate-100 pt-4'>
                <p className='mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400'>Secciones</p>
                <div className='flex flex-wrap gap-2'>
                  {[
                    { key: 'products', label: 'Productos' },
                    { key: 'inventory', label: 'Inventario' },
                    { key: 'purchases', label: 'Compras' },
                    { key: 'sales', label: 'Ventas' },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type='button'
                      onClick={() => onNavigateToSection(venture.id, key)}
                      className='group inline-flex items-center gap-1.5 rounded-full border border-[#082d72]/20 bg-[#082d72]/5 px-4 py-2 text-sm font-semibold text-[#082d72] hover:bg-[#082d72]/10'
                    >
                      {label}
                      <span className='transition-transform group-hover:translate-x-0.5'>→</span>
                    </button>
                  ))}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {filteredVentures.length === 0 && !ventures.length ? (
        <EmptyState title='Sin emprendimientos' description='Agrega el primero para comenzar a estructurar tu operación.' />
      ) : null}

      {pendingDelete ? (
        <Modal title='Confirmar eliminación' description='¿Deseas eliminar este emprendimiento y todo su contenido?' onClose={closeDeleteConfirm}>
          <div className='space-y-4'>
            <p className='text-sm text-slate-600'>Esta acción no se puede deshacer.</p>
            <div className='flex justify-end gap-3'>
              <button type='button' onClick={closeDeleteConfirm} className='rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700'>Cancelar</button>
              <button type='button' onClick={confirmDelete} className='rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white'>Eliminar</button>
            </div>
          </div>
        </Modal>
      ) : null}
    </section>
  )
}
