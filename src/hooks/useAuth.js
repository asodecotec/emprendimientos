import { useCallback, useEffect, useState } from 'react'
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { collection, getCountFromServer } from 'firebase/firestore'
import { auth, googleProvider, db } from '../../firebase'

const GUEST_STORAGE_KEY = 'asodeco-invitado'

function safeLocalStorageGetItem(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeLocalStorageSetItem(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Ignore localStorage failures in restrictive environments
  }
}

function safeLocalStorageRemoveItem(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    // Ignore localStorage failures in restrictive environments
  }
}

export function useAuth() {
  const [user, setUser] = useState(null)
  const [isGuest, setIsGuest] = useState(() => safeLocalStorageGetItem(GUEST_STORAGE_KEY) === 'true')
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [authError, setAuthError] = useState(null)
  const [whitelistPending, setWhitelistPending] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      if (nextUser) {
        setIsGuest(false)
        safeLocalStorageRemoveItem(GUEST_STORAGE_KEY)
      } else {
        setIsGuest(safeLocalStorageGetItem(GUEST_STORAGE_KEY) === 'true')
      }
      setLoadingAuth(false)
    })

    return unsubscribe
  }, [])

  const handleError = (error) => {
    const message = error?.message || 'Ocurrió un error inesperado'
    setAuthError(message)
    return message
  }

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null)
    setWhitelistPending(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      try {
        await getCountFromServer(collection(db, 'account-whitelist'))
      } catch {
        await signOut(auth)
        setAuthError('Esta cuenta no tiene permiso para acceder al sistema')
        throw new Error('Not whitelisted')
      }
      return result
    } catch (error) {
      if (error?.message === 'Not whitelisted') throw error
      handleError(error)
      throw error
    } finally {
      setWhitelistPending(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setAuthError(null)
    try {
      await signOut(auth)
    } catch (error) {
      handleError(error)
      throw error
    } finally {
      safeLocalStorageRemoveItem(GUEST_STORAGE_KEY)
      setIsGuest(false)
    }
  }, [])

  const continueAsGuest = useCallback(() => {
    setAuthError(null)
    setIsGuest(true)
    safeLocalStorageSetItem(GUEST_STORAGE_KEY, 'true')
  }, [])

  return {
    user,
    isGuest,
    loadingAuth,
    authError,
    whitelistPending,
    signInWithGoogle,
    logout,
    continueAsGuest,
  }
}
