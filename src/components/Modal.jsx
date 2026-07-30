export function Modal({ title, description, onClose, children }) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4'>
      <div className='w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl'>
        <div className='mb-6 flex items-start justify-between gap-4'>
          <div>
            <h2 className='text-xl font-semibold text-slate-900'>{title}</h2>
            {description ? <p className='mt-1 text-sm text-slate-500'>{description}</p> : null}
          </div>
          <button type='button' onClick={onClose} className='rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600'>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
