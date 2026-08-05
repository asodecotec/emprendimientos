import { useCallback, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, googleProvider } from '../../firebase'

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

  const signIn = useCallback(async (email, password) => {
    setAuthError(null)
    try {
      return await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      handleError(error)
      throw error
    }
  }, [])

  const register = useCallback(async (email, password) => {
    setAuthError(null)
    try {
      return await createUserWithEmailAndPassword(auth, email, password)
    } catch (error) {
      handleError(error)
      throw error
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null)
    try {
      return await signInWithPopup(auth, googleProvider)
    } catch (error) {
      handleError(error)
      throw error
    }
  }, [])

  const resetPassword = useCallback(async (email) => {
    setAuthError(null)
    try {
      return await sendPasswordResetEmail(auth, email)
    } catch (error) {
      handleError(error)
      throw error
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
    signIn,
    register,
    signInWithGoogle,
    resetPassword,
    logout,
    continueAsGuest,
  }
}
