import { EmptyState } from '../components/EmptyState'
import { formatMoney } from '../models/appModel'

export function InventoryView({ materials, filteredMaterials, search, onSearch, onOpenModal, onDelete }) {
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

      <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder='Buscar material' className='w-full max-w-md rounded-2xl border border-slate-300 px-4 py-3 outline-none' />

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {filteredMaterials.map((material) => (
          <article key={material.id} className='rounded-3xl border border-slate-200 bg-white p-5 shadow-sm'>
            <div className='flex items-start justify-between gap-3'>
              <div>
                <h2 className='text-lg font-semibold text-slate-900'>{material.name}</h2>
                <p className='mt-1 text-sm text-slate-500'>Unidad: {material.unit}</p>
              </div>
              <div className='flex gap-2'>
                <button type='button' onClick={() => onOpenModal('material', material)} className='rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700'>Editar</button>
                <button type='button' onClick={() => onDelete('material', material)} className='rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-red-700'>Eliminar</button>
              </div>
            </div>
            <div className='mt-4 grid gap-3 sm:grid-cols-2'>
              <div className='rounded-2xl bg-slate-50 p-4'>
                <p className='text-sm text-slate-500'>Costo</p>
                <p className='mt-1 text-xl font-semibold text-slate-900'>{formatMoney(material.cost)}</p>
              </div>
              <div className='rounded-2xl bg-slate-50 p-4'>
                <p className='text-sm text-slate-500'>Stock</p>
                <p className='mt-1 text-xl font-semibold text-slate-900'>{material.stock}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredMaterials.length === 0 && !materials.length ? (
        <EmptyState title='Sin materiales' description='Agrega tus primeros insumos para comenzar a calcular costos.' />
      ) : null}
    </section>
  )
}
