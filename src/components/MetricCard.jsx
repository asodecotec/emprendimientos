export function MetricCard({ title, value, accent = 'text-slate-900' }) {
  return (
    <div className='rounded-3xl border border-slate-200 bg-white p-5 shadow-sm min-w-50'>
      <p className='text-sm font-medium text-slate-500'>{title}</p>
      <p className={`mt-4 text-3xl font-semibold ${accent}`}>{value}</p>
    </div>
  )
}
