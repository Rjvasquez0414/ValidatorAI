import { useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'
import type { User } from '../types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar usuario al iniciar
  useEffect(() => {
    const initAuth = async () => {
      try {
        const profile = await authService.getCurrentUserProfile()
        setUser(profile)
      } catch (err) {
        console.error('Error initializing auth:', err)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Suscribirse a cambios de autenticacion
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const profile = await authService.getCurrentUserProfile()
        setUser(profile)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Login con email/password
  const signIn = useCallback(async (email: string, password: string) => {
    setError(null)
    setLoading(true)
    try {
      await authService.signInWithEmail(email, password)
      const profile = await authService.getCurrentUserProfile()
      setUser(profile)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error signing in'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Registro
  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    setError(null)
    setLoading(true)
    try {
      await authService.signUpWithEmail(email, password, name)
      const profile = await authService.getCurrentUserProfile()
      setUser(profile)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error signing up'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Login con Google
  const signInWithGoogle = useCallback(async () => {
    setError(null)
    try {
      await authService.signInWithGoogle()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error signing in with Google'
      setError(message)
      throw err
    }
  }, [])

  // Logout
  const signOut = useCallback(async () => {
    setError(null)
    try {
      await authService.signOut()
      setUser(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error signing out'
      setError(message)
      throw err
    }
  }, [])

  // Actualizar perfil
  const updateProfile = useCallback(async (updates: { name?: string; avatar_url?: string }) => {
    if (!user) return
    try {
      await authService.updateProfile(user.id, updates)
      const profile = await authService.getCurrentUserProfile()
      setUser(profile)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating profile'
      setError(message)
      throw err
    }
  }, [user])

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile
  }
}
