import { useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { Modal } from '../components/Modal'
import { createId, formatMoney } from '../models/appModel'

export function SalesView({ records, onRecordsChange }) {
  const ventures = records?.ventures || []
  const products = records?.products || []
  const sales = records?.sales || []

  const [saleForm, setSaleForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    phone: '',
    location: '',
    ventureId: '',
    price: '',
    margin: '',
    selectedProducts: {},
  })
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false)

  const updateRecords = (updater) => {
    onRecordsChange?.(updater)
  }

  const openSaleModal = () => {
    setSaleForm({
      date: new Date().toISOString().slice(0, 10),
      phone: '',
      location: '',
      ventureId: '',
      price: '',
      margin: '',
      selectedProducts: {},
    })
    setIsSaleModalOpen(true)
  }

  const closeSaleModal = () => {
    setSaleForm({
      date: new Date().toISOString().slice(0, 10),
      phone: '',
      location: '',
      ventureId: '',
      price: '',
      margin: '',
      selectedProducts: {},
    })
    setIsSaleModalOpen(false)
  }

  const selectedSaleVentureId = saleForm.ventureId || ventures[0]?.id || ''
  const availableProducts = products.filter((product) => product.ventureId === selectedSaleVentureId)
  const totalCost = availableProducts.reduce((sum, product) => {
    const selectedProduct = saleForm.selectedProducts[product.id] || {}
    const quantity = Number(selectedProduct.quantity || 1)
    return sum + Number(product.cost || 0) * quantity
  }, 0)
  const priceValue = Number(saleForm.price || 0)
  const computedMargin = totalCost > 0 && priceValue > 0 ? ((priceValue - totalCost) / totalCost) * 100 : 0
  const displayedMargin = saleForm.margin === '' ? computedMargin : Number(saleForm.margin || 0)

  const handleSubmitSale = (event) => {
    event.preventDefault()
    if (!selectedSaleVentureId) return

    const totalUnits = Object.values(saleForm.selectedProducts || {}).reduce((sum, item) => sum + Number(item.quantity || 1), 0)
    const newSale = {
      id: createId('sale'),
      ventureId: selectedSaleVentureId,
      date: saleForm.date,
      units: totalUnits || 1,
      amount: Number(saleForm.price || 0),
      phone: saleForm.phone,
      location: saleForm.location,
      selectedProducts: saleForm.selectedProducts,
      margin: saleForm.margin,
    }

    updateRecords((current) => ({
      ...current,
      sales: [...(current.sales || []), newSale],
    }))

    closeSaleModal()
  }

  return (
    <section className='space-y-6'>
      <header className='flex flex-col justify-between gap-4 sm:flex-row sm:items-end'>
        <div>
          <p className='mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1769aa]'>Ventas</p>
          <h1 className='text-3xl font-semibold text-[#082d72]'>Registra cada venta</h1>
          <p className='mt-2 text-sm text-slate-600'>Mantén un registro claro del movimiento comercial de cada emprendimiento.</p>
        </div>
        <button type='button' onClick={openSaleModal} className='rounded-full bg-[#082d72] px-4 py-2 text-sm font-semibold text-white'>+ Nueva venta</button>
      </header>

      <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
        {sales.length ? (
          <div className='space-y-3'>
            {sales.map((sale) => {
              const venture = ventures.find((item) => item.id === sale.ventureId)
              const productCount = products.filter((product) => product.ventureId === sale.ventureId).length
              return (
                <div key={sale.id} className='flex flex-col justify-between gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center'>
                  <div>
                    <h2 className='font-semibold text-slate-900'>{venture?.name || 'Emprendimiento'}</h2>
                    <p className='mt-1 text-sm text-slate-500'>Fecha {sale.date} · {sale.units} unidades · {productCount} productos</p>
                  </div>
                  <p className='text-lg font-semibold text-[#168467]'>{formatMoney(sale.amount)}</p>
                </div>
              )
            })}
          </div>
        ) : <EmptyState title='Sin ventas' description='Registra una venta para ver el estado de tu operación.' />}
      </div>

      {isSaleModalOpen ? (
        <Modal title='Registrar venta' description='Selecciona productos, variantes y cantidades.' onClose={closeSaleModal}>
          <form className='space-y-5' onSubmit={handleSubmitSale}>
            <div className='grid gap-4 sm:grid-cols-2'>
              <label className='block'>
                <span className='mb-2 block text-sm font-semibold text-slate-700'>Fecha</span>
                <input
                  type='date'
                  value={saleForm.date}
                  onChange={(event) => setSaleForm((current) => ({ ...current, date: event.target.value }))}
                  className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72]'
                  required
                />
              </label>
              <label className='block'>
                <span className='mb-2 block text-sm font-semibold text-slate-700'>Teléfono de contacto (opcional)</span>
                <input
                  type='tel'
                  value={saleForm.phone}
                  onChange={(event) => setSaleForm((current) => ({ ...current, phone: event.target.value }))}
                  placeholder='Ej. 300 123 4567'
                  className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72]'
                />
              </label>
            </div>

            <label className='block'>
              <span className='mb-2 block text-sm font-semibold text-slate-700'>Lugar de venta (opcional)</span>
              <input
                type='text'
                value={saleForm.location}
                onChange={(event) => setSaleForm((current) => ({ ...current, location: event.target.value }))}
                placeholder='Ciudad, punto de venta o referencia'
                className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72]'
              />
            </label>

            <label className='block'>
              <span className='mb-2 block text-sm font-semibold text-slate-700'>Emprendimiento</span>
              <select
                value={selectedSaleVentureId}
                onChange={(event) => setSaleForm((current) => ({ ...current, ventureId: event.target.value, selectedProducts: {} }))}
                className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72]'
                required
              >
                <option value=''>Selecciona un emprendimiento</option>
                {ventures.map((venture) => (
                  <option key={venture.id} value={venture.id}>{venture.name}</option>
                ))}
              </select>
            </label>

            <section className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
              <h3 className='text-lg font-semibold text-[#082d72]'>Productos vendidos</h3>
              <p className='mt-1 text-sm text-slate-500'>Marca productos, selecciona su variante e indica la cantidad.</p>
              {availableProducts.length ? (
                <div className='mt-4 space-y-3'>
                  {availableProducts.map((product) => {
                    const selectedProduct = saleForm.selectedProducts[product.id] || {}

                    return (
                      <div key={product.id} className='rounded-2xl border border-slate-200 bg-slate-50 p-3'>
                        <div className='flex items-center justify-between gap-3'>
                          <div>
                            <p className='font-semibold text-slate-800'>{product.name}</p>
                            <p className='text-sm text-slate-500'>{product.description || 'Producto disponible'}</p>
                          </div>
                          <span className='rounded-full bg-[#082d72]/10 px-3 py-1 text-xs font-semibold text-[#082d72]'>Disponible</span>
                        </div>
                        <div className='mt-3 grid gap-3 sm:grid-cols-2'>
                          <label className='block'>
                            <span className='mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>Variante</span>
                            <select
                              value={selectedProduct.variant || ''}
                              onChange={(event) => setSaleForm((current) => ({
                                ...current,
                                selectedProducts: {
                                  ...current.selectedProducts,
                                  [product.id]: { ...current.selectedProducts[product.id], variant: event.target.value },
                                },
                              }))}
                              className='w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#082d72]'
                            >
                              <option value=''>Selecciona variante</option>
                              <option value='Unidad'>Unidad</option>
                              <option value='Por mayor'>Por mayor</option>
                              <option value='Personalizada'>Personalizada</option>
                            </select>
                          </label>
                          <label className='block'>
                            <span className='mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>Cantidad</span>
                            <input
                              type='number'
                              min='1'
                              value={selectedProduct.quantity || 1}
                              onChange={(event) => setSaleForm((current) => ({
                                ...current,
                                selectedProducts: {
                                  ...current.selectedProducts,
                                  [product.id]: { ...current.selectedProducts[product.id], quantity: Number(event.target.value) || 1 },
                                },
                              }))}
                              className='w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#082d72]'
                            />
                          </label>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className='mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500'>
                  Selecciona un emprendimiento con productos disponibles.
                </div>
              )}
            </section>

            <section className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
              <h3 className='text-lg font-semibold text-[#082d72]'>Importes de la venta</h3>
              <div className='mt-4 grid gap-4 sm:grid-cols-3'>
                <label className='block'>
                  <span className='mb-2 block text-sm font-semibold text-slate-700'>Costo total</span>
                  <input
                    type='number'
                    value={totalCost}
                    placeholder='0'
                    className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72]'
                    readOnly
                  />
                </label>
                <label className='block'>
                  <span className='mb-2 block text-sm font-semibold text-slate-700'>Precio total de venta</span>
                  <input
                    type='number'
                    value={saleForm.price}
                    min='0'
                    step='0.01'
                    onChange={(event) => {
                      const nextPrice = event.target.value
                      const nextMargin = totalCost > 0 && Number(nextPrice) > 0 ? ((Number(nextPrice) - totalCost) / totalCost) * 100 : 0
                      setSaleForm((current) => ({ ...current, price: nextPrice, margin: String(nextMargin) }))
                    }}
                    placeholder='0'
                    className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72]'
                    required
                  />
                </label>
                <label className='block'>
                  <span className='mb-2 block text-sm font-semibold text-slate-700'>Margen %</span>
                  <input
                    type='number'
                    value={displayedMargin}
                    step='0.01'
                    onChange={(event) => {
                      const nextMargin = event.target.value
                      const nextPrice = totalCost > 0 ? totalCost * (1 + Number(nextMargin || 0) / 100) : 0
                      setSaleForm((current) => ({ ...current, margin: nextMargin, price: String(nextPrice) }))
                    }}
                    placeholder='0'
                    className='w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#082d72]'
                  />
                </label>
              </div>
              <p className='mt-3 text-sm text-slate-500'>Puedes cambiar el precio para calcular el margen o cambiar el margen para calcular el precio.</p>
            </section>

            <div className='flex justify-end gap-3'>
              <button type='button' onClick={closeSaleModal} className='rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700'>Cancelar</button>
              <button type='submit' className='rounded-full bg-[#082d72] px-4 py-2 text-sm font-semibold text-white'>Guardar venta</button>
            </div>
          </form>
        </Modal>
      ) : null}
    </section>
  )
}
