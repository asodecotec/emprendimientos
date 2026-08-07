import { useState } from 'react'
import { MetricCard } from '../components/MetricCard'
import { formatMoney } from '../models/appModel'

const SEGMENTS = [
  { key: 'netProfit', label: 'Ganancia neta', color: 'bg-emerald-500' },
  { key: 'employeePay', label: 'Empleados', color: 'bg-blue-400' },
  { key: 'fixedCosts', label: 'Costos fijos', color: 'bg-orange-400' },
  { key: 'costOfSale', label: 'Costo de venta', color: 'bg-amber-400' },
]

export function DashboardView({ stats, ventureBreakdown }) {
  const [focusedId, setFocusedId] = useState(null)

  const focused = focusedId ? ventureBreakdown.find((v) => v.id === focusedId) : null
  const scaleRevenue = focused ? focused.revenue : Math.max(...ventureBreakdown.map((v) => v.revenue), 1)

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
          <p className='mb-6 text-sm text-slate-500'>Desglose de costos y ganancia neta. Haz clic en una barra para enfocarla.</p>

          <div className='flex gap-3 mb-4'>
            {SEGMENTS.map(({ key, label, color }) => (
              <div key={key} className='flex items-center gap-1.5'>
                <span className={`inline-block h-3 w-3 rounded ${color}`} />
                <span className='text-xs text-slate-600'>{label}</span>
              </div>
            ))}
          </div>

          <div className='space-y-4'>
            {ventureBreakdown.map((venture) => {
              const segments = SEGMENTS.map(({ key, label, color }) => ({
                key,
                label,
                color,
                value: venture[key],
              }))
              const total = segments.reduce((sum, s) => sum + s.value, 0)
              const barPct = scaleRevenue > 0 ? (venture.revenue / scaleRevenue) * 100 : 0
              const isFocused = focusedId === venture.id
              return (
                <div
                  key={venture.id}
                  className={`cursor-pointer rounded-lg transition-all ${isFocused ? 'ring-2 ring-[#082d72] ring-offset-2' : 'hover:bg-slate-50'}`}
                  onClick={() => setFocusedId(isFocused ? null : venture.id)}
                >
                  <div className='flex items-baseline justify-between mb-1 px-2'>
                    <span className='text-sm font-semibold text-slate-700 truncate' title={venture.name}>{venture.name}</span>
                    <span className='text-xs font-semibold text-slate-500 whitespace-nowrap ml-2'>{formatMoney(venture.revenue)}</span>
                  </div>
                  <div className='h-8 flex'>
                    {total > 0 ? (
                      <div className='h-full flex transition-[width] duration-200' style={{ width: `${barPct}%` }}>
                        {segments.map(({ key, label, color, value }) => (
                          <div
                            key={key}
                            className={`h-full ${color} first:rounded-l last:rounded-r transition-[flex-grow] duration-200`}
                            style={{ flexGrow: value }}
                            title={`${label}: ${formatMoney(value)}`}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className='h-full transition-[width] duration-200' style={{ width: `${barPct}%` }} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </section>
  )
}
