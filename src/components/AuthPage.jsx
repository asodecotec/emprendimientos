export function AuthPage({ isGuest, authError, loadingAuth, onGoogleSignIn, onContinueAsGuest }) {
  return (
    <div className='min-h-screen bg-[#f6f3eb] px-4 py-12 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-3xl space-y-8 rounded-[32px] border border-slate-200 bg-white/95 p-8 shadow-lg'>
        <div className='mx-auto max-w-xl space-y-3 text-center'>
          <h1 className='text-3xl font-semibold text-[#082d72]'>Bienvenido a Asodeco</h1>
          <p className='text-sm text-slate-500'>Accede con tu cuenta de Google o entra como invitado para solo ver la información.</p>
        </div>

        <div className='space-y-4'>
          <div className='rounded-3xl bg-slate-50 p-4 text-sm text-slate-600'>
            <p className='font-semibold text-slate-900'>Acceso</p>
            <p className='mt-2'>Usa tu cuenta de Google para acceder rápido y empezar a gestionar tus emprendimientos.</p>
          </div>

          {authError ? <p className='rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700'>{authError}</p> : null}
          {isGuest ? <p className='rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700'>Estás en modo invitado con permisos solo de lectura.</p> : null}

          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <button
              type='button'
              onClick={onGoogleSignIn}
              disabled={loadingAuth}
              className='rounded-full bg-[#082d72] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#061f53] disabled:cursor-not-allowed disabled:opacity-60'
            >
              {loadingAuth ? 'Procesando...' : 'Ingresar con Google'}
            </button>
          </div>
        </div>

        <div className='rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600'>
          <p className='font-semibold text-slate-900'>¿No quieres registrarte?</p>
          <p className='mt-2'>Puedes continuar como invitado con acceso de solo lectura.</p>
          <button type='button' onClick={onContinueAsGuest} className='mt-3 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700'>Continuar como invitado</button>
        </div>
      </div>
    </div>
  )
}
