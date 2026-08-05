import { EmptyState } from '../components/EmptyState'
import { formatMoney } from '../models/appModel'

export function SalesView({ sales, ventures, products, ventureFilter, recent, search, onSearch, onVentureFilter, onOpenModal, onDelete, onTogglePaid, canEdit }) {
  const splitIndex = sales.findIndex((sale) => !recent[sale.id])
  const recentItems = splitIndex === -1 ? sales : sales.slice(0, splitIndex)
  const dateItems = splitIndex === -1 ? [] : sales.slice(splitIndex)

  return (
    <section className='space-y-6'>
      <header className='flex flex-col justify-between gap-4 sm:flex-row sm:items-end'>
        <div>
          <p className='mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1769aa]'>Ventas</p>
          <h1 className='text-3xl font-semibold text-[#082d72]'>Registra cada venta</h1>
          <p className='mt-2 text-sm text-slate-600'>Mantén un registro claro del movimiento comercial de cada emprendimiento.</p>
          {!canEdit ? <p className='mt-2 text-sm font-semibold text-blue-700'>Modo invitado: solo lectura</p> : null}
        </div>
        {canEdit ? (
          <button type='button' onClick={() => onOpenModal('sale')} className='rounded-full bg-[#082d72] px-4 py-2 text-sm font-semibold text-white'>+ Nueva venta</button>
        ) : null}
      </header>

      <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
        <select
          value={ventureFilter}
          onChange={(event) => onVentureFilter(event.target.value)}
          className='rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none sm:max-w-xs'
        >
          <option value=''>Todos los emprendimientos</option>
          {ventures.map((venture) => (
            <option key={venture.id} value={venture.id}>{venture.name}</option>
          ))}
        </select>
        <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder='Buscar venta' className='w-full max-w-md rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
      </div>

      <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
        {sales.length ? (
          <div className='space-y-3'>
            {recentItems.map((sale) => {
              const venture = ventures.find((item) => item.id === sale.ventureId)
              const productCount = products.filter((product) => product.ventureId === sale.ventureId).length
              return (
                <div key={sale.id} className='flex flex-col justify-between gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center'>
                  <div className='flex items-center gap-3'>
                    {canEdit ? (
                      <input
                        type='checkbox'
                        checked={sale.paid || false}
                        onChange={() => onTogglePaid(sale)}
                        className='h-4 w-4 shrink-0 rounded border-slate-300 text-[#168467] focus:ring-[#168467]'
                      />
                    ) : (
                      <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${sale.paid ? 'bg-green-500' : 'bg-amber-400'}`} />
                    )}
                    <div>
                      <h2 className='font-semibold text-slate-900'>{venture?.name || 'Emprendimiento'}</h2>
                      <p className='mt-1 text-sm text-slate-500'>Fecha {sale.date} · {sale.units} unidades · {productCount} productos</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='text-right'>
                      <p className='text-lg font-semibold text-[#168467]'>{formatMoney(sale.amount)}</p>
                      {Number(sale.shippingCost || 0) > 0 ? <p className='text-xs text-slate-500'>Envío {formatMoney(sale.shippingCost)}</p> : null}
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${sale.paid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {sale.paid ? 'Pagada' : 'Pendiente'}
                    </span>
                    {canEdit ? (
                      <>
                        <button type='button' onClick={() => onOpenModal('sale', sale)} className='rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100'>Editar</button>
                        <button type='button' onClick={() => onDelete('sale', sale)} className='rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50'>Eliminar</button>
                      </>
                    ) : null}
                  </div>
                </div>
              )
            })}
            {recentItems.length > 0 && dateItems.length > 0 ? <hr className='border-slate-200' /> : null}
            {dateItems.map((sale) => {
              const venture = ventures.find((item) => item.id === sale.ventureId)
              const productCount = products.filter((product) => product.ventureId === sale.ventureId).length
              return (
                <div key={sale.id} className='flex flex-col justify-between gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center'>
                  <div className='flex items-center gap-3'>
                    {canEdit ? (
                      <input
                        type='checkbox'
                        checked={sale.paid || false}
                        onChange={() => onTogglePaid(sale)}
                        className='h-4 w-4 shrink-0 rounded border-slate-300 text-[#168467] focus:ring-[#168467]'
                      />
                    ) : (
                      <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${sale.paid ? 'bg-green-500' : 'bg-amber-400'}`} />
                    )}
                    <div>
                      <h2 className='font-semibold text-slate-900'>{venture?.name || 'Emprendimiento'}</h2>
                      <p className='mt-1 text-sm text-slate-500'>Fecha {sale.date} · {sale.units} unidades · {productCount} productos</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='text-right'>
                      <p className='text-lg font-semibold text-[#168467]'>{formatMoney(sale.amount)}</p>
                      {Number(sale.shippingCost || 0) > 0 ? <p className='text-xs text-slate-500'>Envío {formatMoney(sale.shippingCost)}</p> : null}
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${sale.paid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {sale.paid ? 'Pagada' : 'Pendiente'}
                    </span>
                    {canEdit ? (
                      <>
                        <button type='button' onClick={() => onOpenModal('sale', sale)} className='rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100'>Editar</button>
                        <button type='button' onClick={() => onDelete('sale', sale)} className='rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50'>Eliminar</button>
                      </>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        ) : <EmptyState title='Sin ventas' description='Registra una venta para ver el estado de tu operación.' />}
      </div>
    </section>
  )
}
