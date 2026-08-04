import { MetricCard } from '../components/MetricCard'
import { EmptyState } from '../components/EmptyState'
import { formatMoney } from '../models/appModel'

export function FinanceView({ fixedCosts, stats, ventures, ventureFilter, onVentureFilter }) {
  return (
    <section className='space-y-6'>
      <header>
        <p className='mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1769aa]'>Finanzas</p>
        <h1 className='text-3xl font-semibold text-[#082d72]'>Evalúa la rentabilidad</h1>
        <p className='mt-2 text-sm text-slate-600'>Compara ingresos, costos fijos y desempeño para tomar mejores decisiones.</p>
      </header>

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

      <div className='grid gap-4 md:grid-cols-3'>
        <MetricCard title='Ingresos' value={formatMoney(stats.revenue)} accent='text-[#168467]' />
        <MetricCard title='Costos fijos' value={formatMoney(stats.costs)} accent='text-[#082d72]' />
        <MetricCard title='Ventas' value={stats.sales} accent='text-[#1769aa]' />
      </div>

      <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
        <h2 className='text-lg font-semibold text-slate-900'>Costos fijos</h2>
        <div className='mt-4 grid gap-4 md:grid-cols-2'>
          {fixedCosts.map((item) => (
            <div key={item.id} className='rounded-2xl bg-slate-50 p-4'>
              <div className='flex items-center justify-between gap-3'>
                <div>
                  <h3 className='font-semibold text-slate-900'>{item.name}</h3>
                  <p className='text-xs text-slate-500'>{item.ventureName || 'Sin emprendimiento'}</p>
                </div>
                <span className='shrink-0 text-sm font-semibold text-[#168467]'>{formatMoney(item.cost)}</span>
              </div>
            </div>
          ))}
        </div>
        {fixedCosts.length === 0 ? <EmptyState title='Sin costos fijos' description='Agrega tus gastos recurrentes para incluirlos en la operación.' /> : null}
      </div>
    </section>
  )
}
