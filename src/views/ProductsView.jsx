import { EmptyState } from '../components/EmptyState'
import { formatMoney } from '../models/appModel'

function getProductMaterialCost(product, materials) {
  return Object.entries(product.materials || {}).reduce((sum, [materialId, item]) => {
    const material = materials.find((m) => m.id === materialId)
    return sum + (material ? Number(material.cost || 0) * Number(item.quantity || 1) : 0)
  }, 0)
}

export function ProductsView({ products, filteredProducts, search, onSearch, materials, ventures, ventureFilter, onVentureFilter, onOpenModal, onDelete, canEdit }) {
  return (
    <section className='space-y-6'>
      <header className='flex flex-col justify-between gap-4 sm:flex-row sm:items-end'>
        <div>
          <p className='mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1769aa]'>Productos</p>
          <h1 className='text-3xl font-semibold text-[#082d72]'>Gestiona tus productos</h1>
          <p className='mt-2 text-sm text-slate-600'>Registra los productos de cada emprendimiento y su costo.</p>
          {!canEdit ? <p className='mt-2 text-sm font-semibold text-blue-700'>Modo invitado: solo lectura</p> : null}
        </div>
        {canEdit ? (
          <button type='button' onClick={() => onOpenModal('product')} className='rounded-full bg-[#168467] px-4 py-2 text-sm font-semibold text-white'>+ Nuevo producto</button>
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
        <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder='Buscar producto' className='w-full max-w-md rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
      </div>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {filteredProducts.map((product) => {
          const venture = ventures.find((item) => item.id === product.ventureId)
          const productMaterials = Object.entries(product.materials || {})
            .map(([materialId, item]) => {
              const material = materials.find((m) => m.id === materialId)
              return material ? `${material.name} ×${item.quantity}` : null
            })
            .filter(Boolean)
          return (
            <article key={product.id} className='rounded-3xl border border-slate-200 bg-white p-5 shadow-sm'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <h2 className='text-lg font-semibold text-slate-900'>{product.name}</h2>
                  <p className='mt-1 text-sm text-slate-500'>{product.description || 'Producto disponible'}</p>
                  <p className='mt-1 text-sm font-semibold text-[#1769aa]'>{venture?.name || 'Sin emprendimiento'}</p>
                </div>
                <div className='flex gap-2'>
                  {canEdit ? (
                    <>
                      <button type='button' onClick={() => onOpenModal('product', product)} className='rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700'>Editar</button>
                      <button type='button' onClick={() => onDelete('product', product)} className='rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-red-700'>Eliminar</button>
                    </>
                  ) : null}
                </div>
              </div>
              <div className='mt-4 grid gap-3 sm:grid-cols-2'>
                <div className='rounded-2xl bg-slate-50 p-4'>
                  <p className='text-sm text-slate-500'>Costo Estimado</p>
                  <p className='mt-1 text-xl font-semibold text-slate-900'>{formatMoney(getProductMaterialCost(product, materials))}</p>
                </div>
                <div className='rounded-2xl bg-slate-50 p-4'>
                  <p className='text-sm text-slate-500'>Materiales</p>
                  {productMaterials.length ? (
                    <ul className='mt-1 space-y-1 text-sm text-slate-700'>
                      {productMaterials.map((label, index) => (
                        <li key={index}>{label}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className='mt-1 text-sm text-slate-400'>Sin materiales</p>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {filteredProducts.length === 0 ? (
        <EmptyState title='Sin productos' description={products.length ? 'No hay productos que coincidan con la búsqueda o el emprendimiento seleccionado.' : 'Agrega tus primeros productos para empezar a organizar tu operación.'} />
      ) : null}
    </section>
  )
}
