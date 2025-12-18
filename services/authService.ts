import { supabase } from '../lib/supabase'
import type { User, UserRole } from '../types'

// Helper para extraer mensaje de error de Supabase
const getErrorMessage = (error: any): string => {
  if (error?.message) {
    // Traducir mensajes comunes de Supabase
    if (error.message.includes('Invalid login credentials')) {
      return 'Email o contraseña incorrectos'
    }
    if (error.message.includes('Email not confirmed')) {
      return 'Por favor confirma tu email antes de iniciar sesión'
    }
    if (error.message.includes('User already registered')) {
      return 'Este email ya está registrado'
    }
    return error.message
  }
  return 'Error de autenticación'
}

export const authService = {
  // Login con email/password
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) {
      console.error('Supabase auth error:', error)
      throw new Error(getErrorMessage(error))
    }
    return data
  },

  // Registro con email/password
  async signUpWithEmail(email: string, password: string, name?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: 'ADMIN' // Primer usuario es admin
        }
      }
    })
    if (error) {
      console.error('Supabase signup error:', error)
      throw new Error(getErrorMessage(error))
    }
    return data
  },

  // Login con Google OAuth
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`
      }
    })
    if (error) throw error
    return data
  },

  // Logout
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Obtener sesion actual
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  // Obtener usuario autenticado
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Obtener perfil del usuario actual
  async getCurrentUserProfile(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name || profile.email.split('@')[0],
      role: profile.role as UserRole,
      avatarUrl: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`,
      status: profile.status as 'Active' | 'Pending'
    }
  },

  // Actualizar perfil
  async updateProfile(userId: string, updates: { name?: string; avatar_url?: string }) {
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) throw error
  },

  // Suscribirse a cambios de autenticacion
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}
