import { MetricCard } from '../components/MetricCard'
import { formatMoney } from '../models/appModel'

const SEGMENTS = [
  { key: 'costOfSale', label: 'Costo de venta', color: 'bg-amber-400' },
  { key: 'fixedCosts', label: 'Costos fijos', color: 'bg-orange-400' },
  { key: 'employeePay', label: 'Empleados', color: 'bg-blue-400' },
  { key: 'netProfit', label: 'Ganancia neta', color: 'bg-emerald-500' },
]

export function DashboardView({ stats, ventureBreakdown }) {
  return (
    <section className='space-y-6'>
      <header>
        <p className='mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1769aa]'>Resumen ejecutivo</p>
        <h1 className='text-3xl font-semibold text-[#082d72]'>Panel de control de ASODECO</h1>
        <p className='mt-2 text-sm text-slate-600'>Monitorea emprendimientos, inventario, costos y ventas desde una vista organizada.</p>
      </header>

      <div className='flex flex-wrap gap-4'>
        <MetricCard title='Emprendimientos' value={stats.ventures} />
        <MetricCard title='Materiales' value={stats.materials} />
        <MetricCard title='Productos' value={stats.products} />
        <MetricCard title='Ingresos' value={formatMoney(stats.revenue)} accent='text-[#168467]' />
        <MetricCard title='Envíos' value={formatMoney(stats.shippingCosts)} accent='text-[#082d72]' />
      </div>

      {ventureBreakdown.length > 0 ? (
        <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
          <h2 className='mb-2 text-lg font-semibold text-slate-900'>Ingresos por emprendimiento</h2>
          <p className='mb-6 text-sm text-slate-500'>Desglose de costos y ganancia neta.</p>

          <div className='flex gap-3 mb-4'>
            {SEGMENTS.map(({ key, label, color }) => (
              <div key={key} className='flex items-center gap-1.5'>
                <span className={`inline-block h-3 w-3 rounded ${color}`} />
                <span className='text-xs text-slate-600'>{label}</span>
              </div>
            ))}
          </div>

          <div className='flex items-stretch gap-4 h-[330px]'>
            {(() => {
              const maxRevenue = Math.max(...ventureBreakdown.map((v) => v.revenue), 1)
              return ventureBreakdown.map((venture) => {
                const segments = SEGMENTS.map(({ key, label, color }) => ({
                  key,
                  label,
                  color,
                  value: venture[key],
                }))
                const total = segments.reduce((sum, s) => sum + s.value, 0)
                const barPct = Math.max((venture.revenue / maxRevenue) * 100, total > 0 ? 5 : 0)
                return (
                  <div key={venture.id} className='flex flex-1 flex-col items-center justify-end gap-1 h-full'>
                    <span className='text-xs font-semibold text-slate-700 whitespace-nowrap'>{formatMoney(venture.revenue)}</span>
                    {total > 0 ? (
                      <div className='w-full flex flex-col justify-end' style={{ height: `${barPct}%` }}>
                        {segments.map(({ key, label, color, value }) => (
                          <div
                            key={key}
                            className={`w-full min-h-px ${color} first:rounded-t last:rounded-b`}
                            style={{ flexGrow: value }}
                            title={`${label}: ${formatMoney(value)}`}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className='w-full' style={{ height: `${barPct}%` }} />
                    )}
                    <span className='mt-1 text-xs text-slate-500 text-center leading-tight'>{venture.name}</span>
                  </div>
                )
              })
            })()}
          </div>
        </div>
      ) : null}
    </section>
  )
}
