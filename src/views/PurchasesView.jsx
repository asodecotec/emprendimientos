import { EmptyState } from '../components/EmptyState'
import { formatMoney } from '../models/appModel'

export function PurchasesView({ purchases, filteredPurchases, materials, ventures, ventureFilter, recent, search, onSearch, onVentureFilter, onOpenModal, onDelete, canEdit }) {
  const splitIndex = filteredPurchases.findIndex((purchase) => !recent[purchase.id])
  const recentItems = splitIndex === -1 ? filteredPurchases : filteredPurchases.slice(0, splitIndex)
  const dateItems = splitIndex === -1 ? [] : filteredPurchases.slice(splitIndex)

  return (
    <section className='space-y-6'>
      <header className='flex flex-col justify-between gap-4 sm:flex-row sm:items-end'>
        <div>
          <p className='mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1769aa]'>Compras</p>
          <h1 className='text-3xl font-semibold text-[#082d72]'>Registra tus compras</h1>
          <p className='mt-2 text-sm text-slate-600'>Cada compra suma stock al material correspondiente del inventario.</p>
          {!canEdit ? <p className='mt-2 text-sm font-semibold text-blue-700'>Modo invitado: solo lectura</p> : null}
        </div>
        {canEdit ? (
          <button type='button' onClick={() => onOpenModal()} className='rounded-full bg-[#168467] px-4 py-2 text-sm font-semibold text-white'>+ Nueva compra</button>
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
        <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder='Buscar compra' className='w-full max-w-md rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
      </div>

      <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
        {filteredPurchases.length ? (
          <div className='space-y-3'>
            {recentItems.map((purchase) => {
              const material = materials.find((item) => item.id === purchase.materialId)
              const venture = ventures.find((item) => item.id === material?.ventureId)
              return (
                <div key={purchase.id} className='flex flex-col justify-between gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center'>
                  <div>
                    <h2 className='font-semibold text-slate-900'>{material?.name || 'Material'}</h2>
                    <p className='mt-1 text-sm text-slate-500'>Fecha {purchase.date} · {purchase.quantity} {material?.unit || 'ud'}</p>
                    <p className='mt-1 text-sm font-semibold text-[#1769aa]'>{venture?.name || 'Sin emprendimiento'}</p>
                  </div>
                  <div className='flex items-center gap-3'>
                    <p className='text-lg font-semibold text-[#168467]'>{formatMoney(purchase.cost)}</p>
                    {canEdit ? (
                      <button type='button' onClick={() => onDelete('purchase', purchase)} className='rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-red-700'>Eliminar</button>
                    ) : null}
                  </div>
                </div>
              )
            })}
            {recentItems.length > 0 && dateItems.length > 0 ? <hr className='border-slate-200' /> : null}
            {dateItems.map((purchase) => {
              const material = materials.find((item) => item.id === purchase.materialId)
              const venture = ventures.find((item) => item.id === material?.ventureId)
              return (
                <div key={purchase.id} className='flex flex-col justify-between gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center'>
                  <div>
                    <h2 className='font-semibold text-slate-900'>{material?.name || 'Material'}</h2>
                    <p className='mt-1 text-sm text-slate-500'>Fecha {purchase.date} · {purchase.quantity} {material?.unit || 'ud'}</p>
                    <p className='mt-1 text-sm font-semibold text-[#1769aa]'>{venture?.name || 'Sin emprendimiento'}</p>
                  </div>
                  <div className='flex items-center gap-3'>
                    <p className='text-lg font-semibold text-[#168467]'>{formatMoney(purchase.cost)}</p>
                    {canEdit ? (
                      <button type='button' onClick={() => onDelete('purchase', purchase)} className='rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-red-700'>Eliminar</button>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        ) : <EmptyState title='Sin compras' description={purchases.length && ventureFilter ? 'No hay compras para este emprendimiento.' : 'Registra la primera compra para sumar stock al inventario.'} />}
      </div>
    </section>
  )
}
