import { MetricCard } from '../components/MetricCard'
import { EmptyState } from '../components/EmptyState'
import { formatMoney, calculateFixedCostTotal, FIXED_COST_FREQUENCIES } from '../models/appModel'

export function FinanceView({ fixedCosts, stats, ventures, ventureFilter, onVentureFilter, dateFilter, onDateFilter, canEdit, onAddFixedCost, onEditFixedCost, onEditVenture }) {
  return (
    <section className='space-y-6'>
      <header>
        <p className='mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1769aa]'>Finanzas</p>
        <h1 className='text-3xl font-semibold text-[#082d72]'>Evalúa la rentabilidad</h1>
        <p className='mt-2 text-sm text-slate-600'>Compara ingresos, costos fijos y desempeño para tomar mejores decisiones.</p>
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
        <select
          value={dateFilter}
          onChange={(event) => onDateFilter(event.target.value)}
          className='rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none sm:max-w-xs'
        >
          <option value=''>Todo el tiempo</option>
          <option value='year'>Último año</option>
          <option value='month'>Último mes</option>
        </select>
      </div>

      <div className='flex flex-wrap gap-4'>
        <MetricCard title='Ingresos' value={formatMoney(stats.revenue)} accent='text-[#168467]' />
        <MetricCard title='Costo total' value={formatMoney(stats.totalCosts)} accent='text-[#082d72]' />
        <MetricCard title='Ganancia' value={formatMoney(stats.profit)} accent={stats.profit >= 0 ? 'text-[#168467]' : 'text-red-600'} />
        <MetricCard title='Margen' value={`${stats.margin.toFixed(1)}%`} accent={stats.margin >= 0 ? 'text-[#168467]' : 'text-red-600'} />
        <MetricCard title='Costo de ventas' value={formatMoney(stats.saleCosts)} accent='text-[#082d72]' />
        <MetricCard title='Costos fijos' value={formatMoney(stats.costs)} accent='text-[#082d72]' />
        <MetricCard title='Costos de envío' value={formatMoney(stats.shippingCosts)} accent='text-[#082d72]' />
        <MetricCard title='Ventas' value={stats.sales} accent='text-[#1769aa]' />
        <MetricCard title='Pago empleados' value={formatMoney(stats.totalEmployeePay)} accent='text-[#082d72]' />
        <MetricCard title='Ganancia neta' value={formatMoney(stats.profit - stats.totalEmployeePay)} accent={stats.profit - stats.totalEmployeePay >= 0 ? 'text-[#168467]' : 'text-red-600'} />
        <MetricCard title='Pago por empleado' value={formatMoney(stats.payPerEmployee)} accent='text-[#1769aa]' />
        <MetricCard title='Empleados' value={stats.totalEmployees} accent='text-[#1769aa]' />
      </div>

      <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-slate-900'>Costos fijos</h2>
          {canEdit ? (
            <button type='button' onClick={onAddFixedCost} className='rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50'>+ Agregar</button>
          ) : null}
        </div>
        <div className='mt-4 grid gap-4 md:grid-cols-2'>
          {fixedCosts.map((item) => {
            const freq = FIXED_COST_FREQUENCIES.find((f) => f.value === item.frequency)
            const total = calculateFixedCostTotal(item)
            return (
              <div key={item.id} className='rounded-2xl bg-slate-50 p-4'>
                <div className='flex items-center justify-between gap-3'>
                  <div>
                    <h3 className='font-semibold text-slate-900'>{item.name}</h3>
                    <p className='text-xs text-slate-500'>{item.ventureName || 'Sin emprendimiento'}</p>
                    <p className='mt-1 text-xs text-slate-500'>
                      {formatMoney(item.cost)} / {freq?.label || 'Mensual'}
                      {item.endDate ? ` · Hasta ${item.endDate}` : ''}
                    </p>
                  </div>
                  <div className='flex shrink-0 items-center gap-2'>
                    <span className='text-sm font-semibold text-[#168467]'>{formatMoney(total)}</span>
                    {canEdit ? (
                      <button type='button' onClick={() => onEditFixedCost(item)} className='rounded-full border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100'>Editar</button>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {fixedCosts.length === 0 ? <EmptyState title='Sin costos fijos' description='Agrega tus gastos recurrentes para incluirlos en la operación.' /> : null}
      </div>

      {ventureFilter ? (
        (() => {
          const venture = ventures.find((v) => v.id === ventureFilter)
          if (!venture) return null
          const timeline = venture.employeeTimeline || []
          const sorted = [...timeline].sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''))
          const current = sorted[0]
          return (
            <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
              <div className='flex items-center justify-between gap-3'>
                <div>
                  {current && (current.employeeCount > 0 || current.profitShare > 0) ? (
                    <p className='text-lg font-semibold text-slate-900'>
                      {current.employeeCount > 0 ? `${current.employeeCount} empleado(s)` : ''}
                      {current.employeeCount > 0 && current.profitShare > 0 ? ' · ' : ''}
                      {current.profitShare > 0 ? `${current.profitShare}% participación` : ''}
                    </p>
                  ) : (
                    <p className='text-lg text-slate-400'>Sin empleados registrados</p>
                  )}
                  {sorted.length > 1 ? (
                    <p className='mt-1 text-sm text-slate-500'>{sorted.length} cambio(s) en el tiempo</p>
                  ) : null}
                </div>
                {canEdit ? (
                  <button type='button' onClick={() => onEditVenture(venture)} className='rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100'>Editar</button>
                ) : null}
              </div>
            </div>
          )
        })()
      ) : null}
    </section>
  )
}
