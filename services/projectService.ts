import { supabase } from '../lib/supabase'
import type { Project, NewProjectData, ProjectStatus, MetricData, AIAnalysis } from '../types'

export const projectService = {
  // Obtener todos los proyectos con metricas y ultimo analisis
  async getProjects(): Promise<Project[]> {
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        metrics (*),
        ai_analyses (*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (projects || []).map(p => {
      // Ordenar metricas por mes
      const sortedMetrics = (p.metrics || [])
        .map((m: any) => ({
          month: m.month,
          revenue: Number(m.revenue),
          activeUsers: m.active_users,
          burnRate: Number(m.burn_rate),
          cac: Number(m.cac),
          churnRate: Number(m.churn_rate)
        }))
        .sort((a: MetricData, b: MetricData) => a.month.localeCompare(b.month))

      // Obtener el analisis mas reciente
      const sortedAnalyses = (p.ai_analyses || [])
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      const latestAnalysis = sortedAnalyses[0]

      return {
        id: p.id,
        name: p.name,
        description: p.description || '',
        category: p.category,
        startDate: p.start_date,
        status: p.status as ProjectStatus,
        metrics: sortedMetrics,
        lastAnalysis: latestAnalysis ? {
          recommendation: latestAnalysis.recommendation as AIAnalysis['recommendation'],
          score: latestAnalysis.score,
          reasoning: latestAnalysis.reasoning || '',
          keyStrength: latestAnalysis.key_strength || '',
          keyRisk: latestAnalysis.key_risk || '',
          strategic_actions: latestAnalysis.strategic_actions || []
        } : undefined
      }
    })
  },

  // Obtener un proyecto por ID
  async getProjectById(projectId: string): Promise<Project | null> {
    const { data: p, error } = await supabase
      .from('projects')
      .select(`
        *,
        metrics (*),
        ai_analyses (*)
      `)
      .eq('id', projectId)
      .single()

    if (error) {
      console.error('Error fetching project:', error)
      return null
    }

    const sortedMetrics = (p.metrics || [])
      .map((m: any) => ({
        month: m.month,
        revenue: Number(m.revenue),
        activeUsers: m.active_users,
        burnRate: Number(m.burn_rate),
        cac: Number(m.cac),
        churnRate: Number(m.churn_rate)
      }))
      .sort((a: MetricData, b: MetricData) => a.month.localeCompare(b.month))

    const sortedAnalyses = (p.ai_analyses || [])
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const latestAnalysis = sortedAnalyses[0]

    return {
      id: p.id,
      name: p.name,
      description: p.description || '',
      category: p.category,
      startDate: p.start_date,
      status: p.status as ProjectStatus,
      metrics: sortedMetrics,
      lastAnalysis: latestAnalysis ? {
        recommendation: latestAnalysis.recommendation as AIAnalysis['recommendation'],
        score: latestAnalysis.score,
        reasoning: latestAnalysis.reasoning || '',
        keyStrength: latestAnalysis.key_strength || '',
        keyRisk: latestAnalysis.key_risk || '',
        strategic_actions: latestAnalysis.strategic_actions || []
      } : undefined
    }
  },

  // Crear proyecto
  async createProject(project: NewProjectData, userId: string): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: project.name,
        description: project.description,
        category: project.category,
        created_by: userId
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      category: data.category,
      startDate: data.start_date,
      status: data.status as ProjectStatus,
      metrics: []
    }
  },

  // Actualizar estado de proyecto
  async updateProjectStatus(projectId: string, status: ProjectStatus): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', projectId)

    if (error) throw error
  },

  // Actualizar proyecto
  async updateProject(projectId: string, updates: Partial<NewProjectData>): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', projectId)

    if (error) throw error
  },

  // Agregar metrica
  async addMetric(projectId: string, metric: MetricData): Promise<void> {
    const { error } = await supabase
      .from('metrics')
      .insert({
        project_id: projectId,
        month: metric.month,
        revenue: metric.revenue,
        active_users: metric.activeUsers,
        burn_rate: metric.burnRate,
        cac: metric.cac,
        churn_rate: metric.churnRate
      })

    if (error) throw error
  },

  // Actualizar metrica
  async updateMetric(metricId: string, metric: Partial<MetricData>): Promise<void> {
    const updates: any = {}
    if (metric.revenue !== undefined) updates.revenue = metric.revenue
    if (metric.activeUsers !== undefined) updates.active_users = metric.activeUsers
    if (metric.burnRate !== undefined) updates.burn_rate = metric.burnRate
    if (metric.cac !== undefined) updates.cac = metric.cac
    if (metric.churnRate !== undefined) updates.churn_rate = metric.churnRate

    const { error } = await supabase
      .from('metrics')
      .update(updates)
      .eq('id', metricId)

    if (error) throw error
  },

  // Guardar analisis AI
  async saveAnalysis(projectId: string, analysis: AIAnalysis): Promise<void> {
    const { error } = await supabase
      .from('ai_analyses')
      .insert({
        project_id: projectId,
        recommendation: analysis.recommendation,
        score: analysis.score,
        reasoning: analysis.reasoning,
        key_strength: analysis.keyStrength,
        key_risk: analysis.keyRisk,
        strategic_actions: analysis.strategic_actions || []
      })

    if (error) throw error
  },

  // Eliminar proyecto
  async deleteProject(projectId: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (error) throw error
  }
}
