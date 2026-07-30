import { EmptyState } from '../components/EmptyState'
import { formatMoney } from '../models/appModel'

export function VenturesView({ ventures, products, filteredVentures, search, onSearch, onOpenModal, onDelete, onAddProduct }) {
  return (
    <section className='space-y-6'>
      <header className='flex flex-col justify-between gap-4 sm:flex-row sm:items-end'>
        <div>
          <p className='mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1769aa]'>Emprendimientos</p>
          <h1 className='text-3xl font-semibold text-[#082d72]'>Gestiona tus líneas de negocio</h1>
          <p className='mt-2 text-sm text-slate-600'>Organiza cada emprendimiento y sus productos con una sola vista.</p>
        </div>
        <button type='button' onClick={() => onOpenModal('venture')} className='rounded-full bg-[#082d72] px-4 py-2 text-sm font-semibold text-white'>+ Nuevo emprendimiento</button>
      </header>

      <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder='Buscar emprendimiento' className='w-full max-w-md rounded-2xl border border-slate-300 px-4 py-3 outline-none' />

      <div className='space-y-4'>
        {filteredVentures.map((venture) => {
          const ventureProducts = products.filter((product) => product.ventureId === venture.id)
          return (
            <article key={venture.id} className='rounded-3xl border border-slate-200 bg-white p-5 shadow-sm'>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                <div>
                  <h2 className='text-lg font-semibold text-slate-900'>{venture.name}</h2>
                  <p className='mt-1 text-sm text-slate-500'>{venture.description}</p>
                  <p className='mt-3 text-sm font-semibold text-[#1769aa]'>{ventureProducts.length} producto(s)</p>
                </div>
                <div className='flex flex-wrap gap-2'>
                  <button type='button' onClick={() => onAddProduct(venture.id)} className='rounded-full bg-[#168467] px-3 py-2 text-sm font-semibold text-white'>+ Producto</button>
                  <button type='button' onClick={() => onOpenModal('venture', venture)} className='rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700'>Editar</button>
                  <button type='button' onClick={() => onDelete('venture', venture)} className='rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-red-700'>Eliminar</button>
                </div>
              </div>
              <div className='mt-4 grid gap-3 md:grid-cols-2'>
                {ventureProducts.length ? ventureProducts.map((product) => (
                  <div key={product.id} className='rounded-2xl bg-slate-50 p-4'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold text-slate-900'>{product.name}</h3>
                      <span className='text-sm font-semibold text-[#168467]'>{formatMoney(product.cost)}</span>
                    </div>
                    <p className='mt-1 text-sm text-slate-500'>{product.description}</p>
                  </div>
                )) : <EmptyState title='Sin productos' description='Añade el primer producto para empezar a organizar esta línea.' />}
              </div>
            </article>
          )
        })}
      </div>

      {filteredVentures.length === 0 && !ventures.length ? (
        <EmptyState title='Sin emprendimientos' description='Agrega el primero para comenzar a estructurar tu operación.' />
      ) : null}
    </section>
  )
}
