import { useMemo, useState } from 'react'

export function AuthPage({ isGuest, authError, loadingAuth, onSignIn, onRegister, onGoogleSignIn, onResetPassword, onContinueAsGuest }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submitLabel = useMemo(() => {
    if (mode === 'signin') return 'Iniciar sesión'
    if (mode === 'register') return 'Registrarse'
    if (mode === 'reset') return 'Enviar enlace'
    return 'Enviar'
  }, [mode])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (mode === 'signin') {
      await onSignIn(email, password)
    } else if (mode === 'register') {
      await onRegister(email, password)
    } else if (mode === 'reset') {
      await onResetPassword(email)
    }
  }

  return (
    <div className='min-h-screen bg-[#f6f3eb] px-4 py-12 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-3xl space-y-8 rounded-[32px] border border-slate-200 bg-white/95 p-8 shadow-lg'>
        <div className='mx-auto max-w-xl space-y-3 text-center'>
          <h1 className='text-3xl font-semibold text-[#082d72]'>Bienvenido a Asodeco</h1>
          <p className='text-sm text-slate-500'>Accede con tu correo y contraseña o entra como invitado para solo ver la información.</p>
        </div>

        <div className='grid gap-4 md:grid-cols-[1fr_auto] md:items-center'>
          <div className='rounded-3xl bg-slate-50 p-4 text-sm text-slate-600'>
            <p className='font-semibold text-slate-900'>Acceso</p>
            <p className='mt-2'>
              {mode === 'signin' && 'Inicia sesión con tu cuenta existente, o usa Google para acceder rápido.'}
              {mode === 'register' && 'Crea una cuenta nueva para poder crear y editar registros.'}
              {mode === 'reset' && 'Te enviaremos un correo con un enlace para cambiar tu contraseña.'}
            </p>
          </div>
          <div className='flex flex-col gap-2'>
            <button
              type='button'
              onClick={() => setMode('signin')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === 'signin' ? 'bg-[#082d72] text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
            >
              Iniciar sesión
            </button>
            <button
              type='button'
              onClick={() => setMode('register')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === 'register' ? 'bg-[#168467] text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
            >
              Registrarse
            </button>
            <button
              type='button'
              onClick={() => setMode('reset')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === 'reset' ? 'bg-[#f59e0b] text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
            >
              Olvidé mi contraseña
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <label className='block text-sm font-semibold text-slate-700'>Correo electrónico</label>
            <input
              type='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder='correo@ejemplo.com'
              className='w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#082d72]'
              required
            />
          </div>

          {mode !== 'reset' ? (
            <div className='space-y-2'>
              <label className='block text-sm font-semibold text-slate-700'>Contraseña</label>
              <input
                type='password'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder='••••••••'
                className='w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-[#082d72]'
                required
              />
            </div>
          ) : null}

          {authError ? <p className='rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700'>{authError}</p> : null}
          {isGuest ? <p className='rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700'>Estás en modo invitado con permisos solo de lectura.</p> : null}

          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <button type='submit' disabled={loadingAuth} className='rounded-full bg-[#082d72] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#061f53] disabled:cursor-not-allowed disabled:opacity-60'>
              {loadingAuth ? 'Procesando...' : submitLabel}
            </button>
            <button type='button' onClick={onGoogleSignIn} className='rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'>
              Ingresar con Google
            </button>
          </div>
        </form>

        <div className='rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600'>
          <p className='font-semibold text-slate-900'>¿No quieres registrarte?</p>
          <p className='mt-2'>Puedes continuar como invitado con acceso de solo lectura.</p>
          <button type='button' onClick={onContinueAsGuest} className='mt-3 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700'>Continuar como invitado</button>
        </div>
      </div>
    </div>
  )
}
