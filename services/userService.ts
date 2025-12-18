import { supabase } from '../lib/supabase'
import type { User, UserRole } from '../types'

export const userService = {
  // Obtener todos los usuarios
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map(p => ({
      id: p.id,
      email: p.email,
      name: p.name || p.email.split('@')[0],
      role: p.role as UserRole,
      avatarUrl: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.email}`,
      status: p.status as 'Active' | 'Pending'
    }))
  },

  // Obtener usuario por ID
  async getUserById(userId: string): Promise<User | null> {
    const { data: p, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user:', error)
      return null
    }

    return {
      id: p.id,
      email: p.email,
      name: p.name || p.email.split('@')[0],
      role: p.role as UserRole,
      avatarUrl: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.email}`,
      status: p.status as 'Active' | 'Pending'
    }
  },

  // Crear invitacion
  async inviteUser(email: string, role: UserRole, invitedBy: string): Promise<{ token: string }> {
    const { data, error } = await supabase
      .from('invitations')
      .insert({
        email,
        role,
        invited_by: invitedBy
      })
      .select('token')
      .single()

    if (error) throw error

    return { token: data.token }
  },

  // Obtener invitaciones pendientes
  async getPendingInvitations(): Promise<any[]> {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Verificar invitacion por token
  async verifyInvitation(token: string) {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error) throw error
    return data
  },

  // Aceptar invitacion
  async acceptInvitation(token: string, userId: string): Promise<void> {
    const invitation = await this.verifyInvitation(token)

    // Actualizar rol del usuario
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: invitation.role,
        status: 'Active',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (profileError) throw profileError

    // Marcar invitacion como aceptada
    const { error: inviteError } = await supabase
      .from('invitations')
      .update({ status: 'accepted' })
      .eq('token', token)

    if (inviteError) throw inviteError
  },

  // Actualizar rol de usuario
  async updateUserRole(userId: string, role: UserRole): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) throw error
  },

  // Eliminar invitacion
  async deleteInvitation(invitationId: string): Promise<void> {
    const { error } = await supabase
      .from('invitations')
      .delete()
      .eq('id', invitationId)

    if (error) throw error
  }
}
