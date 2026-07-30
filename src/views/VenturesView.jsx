import { useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { Modal } from '../components/Modal'
import { formatMoney } from '../models/appModel'

export function VenturesView({ ventures, products, filteredVentures, search, onSearch, onOpenModal, onDelete, onSaveProduct }) {
  const [productForm, setProductForm] = useState({ name: '', description: '', cost: '', ventureId: '' })
  const [editingProduct, setEditingProduct] = useState(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const openProductModal = (ventureId, product = null) => {
    setEditingProduct(product)
    setProductForm({
      name: product?.name || '',
      description: product?.description || '',
      cost: product?.cost != null ? String(product.cost) : '',
      ventureId: product?.ventureId || ventureId,
    })
    setIsProductModalOpen(true)
  }

  const closeProductModal = () => {
    setEditingProduct(null)
    setProductForm({ name: '', description: '', cost: '', ventureId: '' })
    setIsProductModalOpen(false)
  }

  const handleSaveProduct = () => {
    const name = productForm.name.trim()
    if (!name || !productForm.ventureId) return

    const payload = {
      ventureId: productForm.ventureId,
      name,
      description: productForm.description.trim() || 'Producto nuevo',
      cost: Number(productForm.cost || 0),
    }

    onSaveProduct(payload, editingProduct?.id)
    closeProductModal()
  }

  const openDeleteConfirm = (type, item) => {
    setPendingDelete({ type, item })
  }

  const closeDeleteConfirm = () => {
    setPendingDelete(null)
  }

  const confirmDelete = () => {
    if (!pendingDelete) return

    onDelete(pendingDelete.type, pendingDelete.item)
    closeDeleteConfirm()
  }

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
                  <button type='button' onClick={() => openProductModal(venture.id)} className='rounded-full bg-[#168467] px-3 py-2 text-sm font-semibold text-white'>+ Producto</button>
                  <button type='button' onClick={() => onOpenModal('venture', venture)} className='rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700'>Editar</button>
                  <button type='button' onClick={() => openDeleteConfirm('venture', venture)} className='rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-red-700'>Eliminar</button>
                </div>
              </div>
              <div className='mt-4 grid gap-3 md:grid-cols-2'>
                {ventureProducts.length ? ventureProducts.map((product) => (
                  <div key={product.id} className='rounded-2xl bg-gray-200 p-4'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold text-slate-900'>{product.name}</h3>
                      <span className='text-sm font-semibold text-[#168467]'>{formatMoney(product.cost)}</span>
                    </div>
                    <p className='mt-1 text-sm text-slate-500'>{product.description}</p>
                    <div className='mt-3 flex flex-wrap gap-2'>
                      <button type='button' onClick={() => openProductModal(venture.id, product)} className='rounded-full bg-white border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700'>Editar</button>
                      <button type='button' onClick={() => openDeleteConfirm('product', product)} className='rounded-full bg-white border border-red-400 text-red-400 px-3 py-2 text-xs font-semibold'>Eliminar</button>
                    </div>
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

      {isProductModalOpen ? (
        <Modal title={editingProduct ? 'Editar producto' : 'Agregar producto'} description='Registra los datos del producto para este emprendimiento' onClose={closeProductModal}>
          <div>
            <label className='block text-sm font-semibold text-slate-700' htmlFor='product-name'>Nombre del producto</label>
            <input id='product-name' value={productForm.name} onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))} className='w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
            <label className='block text-sm font-semibold text-slate-700 mt-5' htmlFor='product-description'>Descripción del producto</label>
            <textarea id='product-description' value={productForm.description} onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))} rows='3' className='w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
            <label className='block text-sm font-semibold text-slate-700 mt-5' htmlFor='product-cost'>Costo del producto ($)</label>
            <input id='product-cost' type='number' min='0' step='0.01' value={productForm.cost} onChange={(event) => setProductForm((current) => ({ ...current, cost: event.target.value }))} className='w-full mb-4 rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
            <div className='flex justify-end gap-3'>
              <button type='button' onClick={closeProductModal} className='rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700'>Cancelar</button>
              <button type='button' onClick={handleSaveProduct} className='rounded-full bg-[#082d72] px-4 py-2 text-sm font-semibold text-white'>Guardar</button>
            </div>
          </div>
        </Modal>
      ) : null}

      {pendingDelete ? (
        <Modal title='Confirmar eliminación' description={pendingDelete.type === 'venture' ? '¿Deseas eliminar este emprendimiento y todo su contenido?' : '¿Deseas eliminar este producto?'} onClose={closeDeleteConfirm}>
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
