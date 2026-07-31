export function Modal({ title, description, onClose, children }) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4'>
      <div className='flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-[#fdfcf8] shadow-2xl'>
        <div className='flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6'>
          <div>
            <h2 className='text-[1.25rem] font-semibold text-[#082d72] sm:text-[1.5rem]'>{title}</h2>
            {description ? <p className='mt-1 text-sm text-slate-500'>{description}</p> : null}
          </div>
          <button type='button' onClick={onClose} className='rounded-full border border-slate-200 bg-white p-2 text-slate-600'>✕</button>
        </div>
        <div className='flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5'>
          {children}
        </div>
      </div>
    </div>
  )
}
