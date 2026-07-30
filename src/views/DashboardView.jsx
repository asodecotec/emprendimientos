import { MetricCard } from '../components/MetricCard'
import { EmptyState } from '../components/EmptyState'
import { formatMoney } from '../models/appModel'

export function DashboardView({ stats, onNavigate }) {
  return (
    <section className='space-y-6'>
      <header>
        <p className='mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1769aa]'>Resumen ejecutivo</p>
        <h1 className='text-3xl font-semibold text-[#082d72]'>Panel de control de Asodeco</h1>
        <p className='mt-2 text-sm text-slate-600'>Monitorea emprendimientos, inventario, costos y ventas desde una vista organizada.</p>
      </header>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <MetricCard title='Emprendimientos' value={stats.ventures} />
        <MetricCard title='Materiales' value={stats.materials} />
        <MetricCard title='Productos' value={stats.products} />
        <MetricCard title='Ingresos' value={formatMoney(stats.revenue)} accent='text-[#168467]' />
      </div>

      <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
        <h2 className='text-lg font-semibold text-slate-900'>Tu operación lista para crecer</h2>
        <p className='mt-2 text-sm text-slate-600'>Crea emprendimientos, define material y costos fijos, y mantén el control de tus ventas desde un mismo lugar.</p>
        <button type='button' onClick={() => onNavigate('ventures')} className='mt-5 rounded-full bg-[#082d72] px-4 py-2 text-sm font-semibold text-white'>Ver emprendimientos</button>
      </div>

      <EmptyState title='Vista central' description='Los módulos se separaron para que cada parte del negocio sea más fácil de mantener y ampliar.' />
    </section>
  )
}
