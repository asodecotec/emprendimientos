import { EmptyState } from '../components/EmptyState'
import { formatMoney } from '../models/appModel'

export function InventoryView({ materials, filteredMaterials, search, onSearch, ventures, ventureFilter, onVentureFilter, onOpenModal, onDelete }) {
  return (
    <section className='space-y-6'>
      <header className='flex flex-col justify-between gap-4 sm:flex-row sm:items-end'>
        <div>
          <p className='mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1769aa]'>Inventario</p>
          <h1 className='text-3xl font-semibold text-[#082d72]'>Controla tus materiales</h1>
          <p className='mt-2 text-sm text-slate-600'>Registra insumos, costos y stock para cada producto.</p>
        </div>
        <button type='button' onClick={() => onOpenModal('material')} className='rounded-full bg-[#168467] px-4 py-2 text-sm font-semibold text-white'>+ Nuevo material</button>
      </header>

      <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
        <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder='Buscar material' className='w-full max-w-md rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
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
      </div>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {filteredMaterials.map((material) => {
          const venture = ventures.find((item) => item.id === material.ventureId)
          return (
            <article key={material.id} className='rounded-3xl border border-slate-200 bg-white p-5 shadow-sm'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <h2 className='text-lg font-semibold text-slate-900'>{material.name}</h2>
                  <p className='mt-1 text-sm text-slate-500'>Unidad: {material.unit || 'ud'}</p>
                  <p className='mt-1 text-sm font-semibold text-[#1769aa]'>{venture?.name || 'Sin emprendimiento'}</p>
                </div>
                <div className='flex gap-2'>
                  <button type='button' onClick={() => onOpenModal('material', material)} className='rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700'>Editar</button>
                  <button type='button' onClick={() => onDelete('material', material)} className='rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-red-700'>Eliminar</button>
                </div>
              </div>
              <div className='mt-4 grid gap-3 sm:grid-cols-2'>
                <div className='rounded-2xl bg-slate-50 p-4'>
                  <p className='text-sm text-slate-500'>Costo promedio</p>
                  <p className='mt-1 text-xl font-semibold text-slate-900'>{formatMoney(material.avgCost)}</p>
                </div>
                <div className='rounded-2xl bg-slate-50 p-4'>
                  <p className='text-sm text-slate-500'>Stock</p>
                  <p className='mt-1 text-xl font-semibold text-slate-900'>{material.stock}</p>
                  <p className='text-xs text-slate-400'>Compras menos lo usado en ventas</p>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {filteredMaterials.length === 0 ? (
        <EmptyState title='Sin materiales' description={materials.length ? 'No hay materiales que coincidan con la búsqueda o el emprendimiento seleccionado.' : 'Agrega tus primeros insumos para comenzar a calcular costos.'} />
      ) : null}
    </section>
  )
}
