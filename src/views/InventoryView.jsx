import { useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { Modal } from '../components/Modal'
import { convertUnitValue, formatMeasurement, formatMoney, normalizeUnit } from '../models/appModel'

const UNIT_OPTIONS = [
  { value: 'ud', label: 'Unidades' },
  { value: 'g', label: 'Gramos' },
  { value: 'kg', label: 'Kilogramos' },
  { value: 'mg', label: 'Miligramos' },
  { value: 'l', label: 'Litros' },
  { value: 'ml', label: 'Mililitros' },
  { value: 'cl', label: 'Centilitros' },
  { value: 'm', label: 'Metros' },
  { value: 'km', label: 'Kilómetros' },
  { value: 'cm', label: 'Centímetros' },
  { value: 'mm', label: 'Milímetros' },
  { value: 'paquete', label: 'Paquetes' },
  { value: 'caja', label: 'Cajas' },
  { value: 'botella', label: 'Botellas' },
]

export function InventoryView({ materials, filteredMaterials, search, onSearch, onCreateMaterial, onUpdateMaterial, onDeleteMaterial }) {
  const [materialForm, setMaterialForm] = useState({ name: '', unit: 'ud', cost: '', stock: '', pricePerUnit: '' })
  const [editingMaterial, setEditingMaterial] = useState(null)
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const openMaterialModal = (material = null) => {
    setEditingMaterial(material)
    setMaterialForm({
      name: material?.name || '',
      unit: material?.unit || 'ud',
      cost: material?.cost != null ? String(material.cost) : '',
      stock: material?.stock != null ? String(material.stock) : '',
      pricePerUnit: material?.pricePerUnit != null ? String(material.pricePerUnit) : '',
    })
    setIsMaterialModalOpen(true)
  }

  const closeMaterialModal = () => {
    setEditingMaterial(null)
    setMaterialForm({ name: '', unit: 'ud', cost: '', stock: '', pricePerUnit: '' })
    setIsMaterialModalOpen(false)
  }

  const handleSaveMaterial = () => {
    const normalizedUnit = normalizeUnit(materialForm.unit)
    const stockValue = Number(materialForm.stock || 0)
    const payload = {
      name: materialForm.name,
      unit: normalizedUnit,
      cost: Number(materialForm.cost || 0),
      stock: editingMaterial ? convertUnitValue(stockValue, editingMaterial.unit, normalizedUnit) : stockValue,
      pricePerUnit: Number(materialForm.pricePerUnit || materialForm.cost || 0),
    }

    if (!payload.name.trim()) return

    if (editingMaterial) {
      onUpdateMaterial(editingMaterial.id, payload)
    } else {
      onCreateMaterial(payload)
    }

    closeMaterialModal()
  }

  const openDeleteConfirm = (material) => {
    setPendingDelete(material)
  }

  const closeDeleteConfirm = () => {
    setPendingDelete(null)
  }

  const confirmDelete = () => {
    if (!pendingDelete) return

    onDeleteMaterial(pendingDelete.id)
    closeDeleteConfirm()
  }

  return (
    <section className='space-y-6'>
      <header className='flex flex-col justify-between gap-4 sm:flex-row sm:items-end'>
        <div>
          <p className='mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1769aa]'>Inventario</p>
          <h1 className='text-3xl font-semibold text-[#082d72]'>Controla tus materiales</h1>
          <p className='mt-2 text-sm text-slate-600'>Registra insumos, costos y stock para cada producto.</p>
        </div>
        <button type='button' onClick={() => openMaterialModal()} className='rounded-full bg-[#168467] px-4 py-2 text-sm font-semibold text-white'>+ Nuevo material</button>
      </header>

      <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder='Buscar material' className='w-full max-w-md rounded-2xl border border-slate-300 px-4 py-3 outline-none' />

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {filteredMaterials.map((material) => (
          <article key={material.id} className='rounded-3xl border border-slate-200 bg-white p-5 shadow-sm'>
            <div className='flex items-start justify-between gap-3'>
              <div>
                <h2 className='text-lg font-semibold text-slate-900'>{material.name}</h2>
                <p className='mt-1 text-sm text-slate-500'>Unidad: {normalizeUnit(material.unit)}</p>
              </div>
              <div className='flex gap-2'>
                <button type='button' onClick={() => openMaterialModal(material)} className='rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700'>Editar</button>
                <button type='button' onClick={() => openDeleteConfirm(material)} className='rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-red-700'>Eliminar</button>
              </div>
            </div>
            <div className='mt-4 grid gap-3 sm:grid-cols-2'>
              <div className='rounded-2xl bg-slate-50 p-4'>
                <p className='text-sm text-slate-500'>Costo</p>
                <p className='mt-1 text-xl font-semibold text-slate-900'>{formatMoney(material.cost)}</p>
              </div>
              <div className='rounded-2xl bg-slate-50 p-4'>
                <p className='text-sm text-slate-500'>Stock</p>
                <p className='mt-1 text-xl font-semibold text-slate-900'>{formatMeasurement(material.stock, material.unit)}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredMaterials.length === 0 && !materials.length ? (
        <EmptyState title='Sin materiales' description='Agrega tus primeros insumos para comenzar a calcular costos.' />
      ) : null}

      {isMaterialModalOpen ? (
        <Modal title={editingMaterial ? 'Editar material' : 'Agregar material'} description='Registra o ajusta un material para tu inventario' onClose={closeMaterialModal}>
          <div className='space-y-4'>
            <input value={materialForm.name} onChange={(event) => setMaterialForm((current) => ({ ...current, name: event.target.value }))} placeholder='Nombre del material' className='w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
            {editingMaterial ? <p className='text-sm text-slate-500'>Al cambiar la unidad, el stock se convertirá automáticamente.</p> : null}
            <div className='grid gap-4 sm:grid-cols-2'>
              <label className='block'>
                <span className='mb-2 block text-sm font-semibold text-slate-700'>Unidad</span>
                <select value={materialForm.unit} onChange={(event) => setMaterialForm((current) => ({ ...current, unit: event.target.value }))} className='w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none'>
                  {UNIT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className='block'>
                <span className='mb-2 block text-sm font-semibold text-slate-700'>Costo</span>
                <input type='number' min='0' step='0.01' value={materialForm.cost} onChange={(event) => setMaterialForm((current) => ({ ...current, cost: event.target.value }))} className='w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
              </label>
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <label className='block'>
                <span className='mb-2 block text-sm font-semibold text-slate-700'>Stock</span>
                <input type='number' min='0' value={materialForm.stock} onChange={(event) => setMaterialForm((current) => ({ ...current, stock: event.target.value }))} className='w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
              </label>
              <label className='block'>
                <span className='mb-2 block text-sm font-semibold text-slate-700'>Precio por {normalizeUnit(materialForm.unit)}</span>
                <input type='number' min='0' step='0.01' value={materialForm.pricePerUnit} onChange={(event) => setMaterialForm((current) => ({ ...current, pricePerUnit: event.target.value }))} className='w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none' />
              </label>
            </div>
            <div className='flex justify-end gap-3'>
              <button type='button' onClick={closeMaterialModal} className='rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700'>Cancelar</button>
              <button type='button' onClick={handleSaveMaterial} className='rounded-full bg-[#168467] px-4 py-2 text-sm font-semibold text-white'>Guardar</button>
            </div>
          </div>
        </Modal>
      ) : null}

      {pendingDelete ? (
        <Modal title='Confirmar eliminación' description='¿Deseas eliminar este material del inventario?' onClose={closeDeleteConfirm}>
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
