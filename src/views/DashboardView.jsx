import { MetricCard } from '../components/MetricCard'
import { formatMoney } from '../models/appModel'

export function DashboardView({ stats }) {
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
    </section>
  )
}
