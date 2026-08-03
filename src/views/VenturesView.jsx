import { useMemo, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { Modal } from '../components/Modal'
import { createId, formatMoney, getProductCost, normalize } from '../models/appModel'

export function VenturesView({ records, onRecordsChange }) {
  const ventures = records?.ventures || []
  const products = records?.products || []
  const materials = records?.materials || []

  const [search, setSearch] = useState('')
  const [ventureForm, setVentureForm] = useState({ name: '', description: '' })
  const [editingVenture, setEditingVenture] = useState(null)
  const [isVentureModalOpen, setIsVentureModalOpen] = useState(false)
  const [productForm, setProductForm] = useState({ name: '', description: '', cost: '', ventureId: '', useMaterials: false, materials: [] })
  const [editingProduct, setEditingProduct] = useState(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const filteredVentures = useMemo(() => {
    const query = normalize(search)
    return ventures.filter((venture) => normalize(`${venture.name} ${venture.description}`).includes(query))
  }, [search, ventures])

  const updateRecords = (updater) => {
    onRecordsChange?.(updater)
  }

  const openVentureModal = (venture = null) => {
    setEditingVenture(venture)
    setVentureForm({ name: venture?.name || '', description: venture?.description || '' })
    setIsVentureModalOpen(true)
  }

  const closeVentureModal = () => {
    setEditingVenture(null)
    setVentureForm({ name: '', description: '' })
    setIsVentureModalOpen(false)
  }

  const handleSaveVenture = () => {
    const payload = { name: ventureForm.name, description: ventureForm.description }
    const normalizedName = String(payload.name || '').trim()
    if (!normalizedName) return

    if (editingVenture) {
      updateRecords((current) => ({
        ...current,
        ventures: (current.ventures || []).map((venture) => venture.id === editingVenture.id
          ? { ...venture, name: normalizedName, description: String(payload.description || '').trim() || 'Nuevo emprendimiento' }
          : venture),
      }))
    } else {
      const newVenture = {
        id: createId('venture'),
        name: normalizedName,
        description: String(payload.description || '').trim() || 'Nuevo emprendimiento',
        products: 0,
      }

      updateRecords((current) => ({
        ...current,
        ventures: [...(current.ventures || []), newVenture],
      }))
    }

    closeVentureModal()
  }

  const openProductModal = (ventureId, product = null) => {
    setEditingProduct(product)
    const storedMaterials = Array.isArray(product?.materials) && product.materials.length
      ? product.materials.map((entry) => ({ materialId: entry.materialId, quantity: String(entry.quantity ?? 1) }))
      : (Array.isArray(product?.materialIds) && product.materialIds.length ? product.materialIds.map((id) => ({ materialId: id, quantity: '1' })) : [])

    setProductForm({
      name: product?.name || '',
      description: product?.description || '',
      cost: product?.cost != null ? String(product.cost) : '',
      ventureId: product?.ventureId || ventureId,
      useMaterials: storedMaterials.length > 0,
      materials: storedMaterials,
    })
    setIsProductModalOpen(true)
  }

  const closeProductModal = () => {
    setEditingProduct(null)
    setProductForm({ name: '', description: '', cost: '', ventureId: '', useMaterials: false, materials: [] })
    setIsProductModalOpen(false)
  }

  const handleSaveProduct = () => {
    const name = productForm.name.trim()
    if (!name || !productForm.ventureId) return

    const normalizedMaterials = (productForm.useMaterials ? productForm.materials : []).filter((item) => item.materialId && Number(item.quantity || 0) > 0)
    const payload = {
      ventureId: productForm.ventureId,
      name,
      description: productForm.description.trim() || 'Producto nuevo',
      cost: Number(productForm.cost || 0),
      materials: normalizedMaterials.map((item) => ({ materialId: item.materialId, quantity: Number(item.quantity || 0) })),
    }

    if (editingProduct) {
      updateRecords((current) => ({
        ...current,
        products: (current.products || []).map((product) => product.id === editingProduct.id ? {
          ...product,
          ventureId: payload.ventureId,
          name: payload.name,
          description: payload.description,
          cost: payload.cost,
          materials: payload.materials,
        } : product),
      }))
    } else {
      const newProduct = {
        id: createId('product'),
        ventureId: payload.ventureId,
        name: payload.name,
        description: payload.description,
        cost: payload.cost,
        materials: payload.materials,
        materialIds: [],
        fixedCostIds: [],
      }

      updateRecords((current) => ({
        ...current,
        products: [...(current.products || []), newProduct],
      }))
    }

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

    if (pendingDelete.type === 'venture') {
      const ventureId = pendingDelete.item.id
      updateRecords((current) => ({
        ...current,
        ventures: (current.ventures || []).filter((venture) => venture.id !== ventureId),
        products: (current.products || []).filter((product) => product.ventureId !== ventureId),
        sales: (current.sales || []).filter((sale) => sale.ventureId !== ventureId),
      }))
    } else if (pendingDelete.type === 'product') {
      updateRecords((current) => ({
        ...current,
        products: (current.products || []).filter((product) => product.id !== pendingDelete.item.id),
      }))
    }

    closeDeleteConfirm()
  }

  const previewCost = getProductCost({
    cost: Number(productForm.cost || 0),
    materials: (productForm.useMaterials ? productForm.materials : []).filter((item) => item.materialId && Number(item.quantity || 0) > 0).map((item) => ({ materialId: item.materialId, quantity: Number(item.quantity || 0) })),
  }, materials, [])

  return (
    <section className='space-y-6'>
      <header className='flex flex-col justify-between gap-4 sm:flex-row sm:items-end'>
        <div>
          <p className='mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1769aa]'>Emprendimientos</p>
          <h1 className='text-3xl font-semibold text-[#082d72]'>Gestiona tus líneas de negocio</h1>
          <p className='mt-2 text-sm text-slate-600'>Organiza cada emprendimiento y sus productos con una sola vista.</p>
        </div>
        <button type='button' onClick={() => openVentureModal()} className='rounded-full bg-[#082d72] px-4 py-2 text-sm font-semibold text-white'>+ Nuevo emprendimiento</button>
      </header>

      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder='Buscar emprendimiento' className='w-full max-w-md rounded-2xl border border-slate-300 px-4 py-3 outline-none' />

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
                  <button type='button' onClick={() => openVentureModal(venture)} className='rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700'>Editar</button>
                  <button type='button' onClick={() => openDeleteConfirm('venture', venture)} className='rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-red-700'>Eliminar</button>
                </div>
              </div>
              <div className='mt-4 grid gap-3 md:grid-cols-2'>
                {ventureProducts.length ? ventureProducts.map((product) => (
                  <div key={product.id} className='rounded-2xl bg-slate-50 p-4'>
                    <div className='flex items-center justify-between'>
                      <h3 className='font-semibold text-slate-900'>{product.name}</h3>
                      <span className='text-sm font-semibold text-[#168467]'>{formatMoney(getProductCost(product, materials, []))}</span>
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

      {isVentureModalOpen ? (
        <Modal title={editingVenture ? 'Editar emprendimiento' : 'Agregar emprendimiento'} description='Gestiona la información de la línea de negocio' onClose={closeVentureModal}>
          <div className='space-y-4'>
            <input value={ventureForm.name} onChange={(event) => setVentureForm((current) => ({ ...current, name: event.target.value }))} placeholder='Nombre del emprendimiento' className='w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
            <textarea value={ventureForm.description} onChange={(event) => setVentureForm((current) => ({ ...current, description: event.target.value }))} placeholder='Descripción del emprendimiento' rows='3' className='w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
            <div className='flex justify-end gap-3'>
              <button type='button' onClick={closeVentureModal} className='rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700'>Cancelar</button>
              <button type='button' onClick={handleSaveVenture} className='rounded-full bg-[#082d72] px-4 py-2 text-sm font-semibold text-white'>Guardar</button>
            </div>
          </div>
        </Modal>
      ) : null}

      {isProductModalOpen ? (
        <Modal title={editingProduct ? 'Editar producto' : 'Agregar producto'} description='Registra los datos del producto para este emprendimiento' onClose={closeProductModal}>
          <div>
            <label className='block text-sm font-semibold text-slate-700' htmlFor='product-name'>Nombre del producto</label>
            <input id='product-name' value={productForm.name} onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))} className='w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
            <label className='block text-sm font-semibold text-slate-700 mt-5' htmlFor='product-description'>Descripción del producto</label>
            <textarea id='product-description' value={productForm.description} onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))} rows='3' className='w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
            <label className='flex items-center gap-2 text-sm font-semibold text-slate-700 mt-5'>
              <input type='checkbox' checked={productForm.useMaterials} onChange={(event) => setProductForm((current) => ({ ...current, useMaterials: event.target.checked, materials: event.target.checked ? current.materials : [] }))} />
              <span>Este producto usa materiales</span>
            </label>
            {productForm.useMaterials ? (
              <div className='mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4'>
                <div className='flex items-center justify-between'>
                  <p className='text-sm font-semibold text-slate-700'>Materiales del producto</p>
                  <button type='button' onClick={() => setProductForm((current) => ({ ...current, materials: [...current.materials, { materialId: '', quantity: '1' }] }))} className='rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700'>+ Agregar</button>
                </div>
                <div className='mt-3 space-y-3'>
                  {productForm.materials.map((entry, index) => (
                    <div key={`${entry.materialId || 'new'}-${index}`} className='grid gap-3 sm:grid-cols-[1.4fr_0.8fr_auto]'>
                      <select value={entry.materialId} onChange={(event) => setProductForm((current) => ({ ...current, materials: current.materials.map((item, itemIndex) => itemIndex === index ? { ...item, materialId: event.target.value } : item) }))} className='w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none'>
                        <option value=''>Selecciona un material</option>
                        {materials.map((material) => (
                          <option key={material.id} value={material.id}>{material.name} ({material.unit})</option>
                        ))}
                      </select>
                      <input type='number' min='0' step='0.01' value={entry.quantity} onChange={(event) => setProductForm((current) => ({ ...current, materials: current.materials.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: event.target.value } : item) }))} className='w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none' />
                      <button type='button' onClick={() => setProductForm((current) => ({ ...current, materials: current.materials.filter((_, itemIndex) => itemIndex !== index) }))} className='rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-red-700'>Eliminar</button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <label className='block text-sm font-semibold text-slate-700 mt-5' htmlFor='product-cost'>Costo del producto ($)</label>
            <input id='product-cost' type='number' min='0' step='0.01' value={productForm.cost} onChange={(event) => setProductForm((current) => ({ ...current, cost: event.target.value }))} className='w-full mb-2 rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
            {productForm.useMaterials ? <p className='mb-4 text-sm text-slate-500'>Costo estimado con materiales: {formatMoney(previewCost)}</p> : <p className='mb-4 text-sm text-slate-500'>Si no usas materiales, este costo se tomará como manual.</p>}
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
