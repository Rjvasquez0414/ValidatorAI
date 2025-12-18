import { useState, useEffect, useCallback } from 'react'
import { projectService } from '../services/projectService'
import { analyzeProject } from '../services/geminiService'
import type { Project, NewProjectData, ProjectStatus, MetricData } from '../types'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar proyectos
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await projectService.getProjects()
      setProjects(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error loading projects'
      setError(message)
      console.error('Error fetching projects:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar al iniciar
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // Crear proyecto
  const addProject = useCallback(async (projectData: NewProjectData, userId: string) => {
    try {
      const newProject = await projectService.createProject(projectData, userId)
      setProjects(prev => [newProject, ...prev])
      return newProject
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creating project'
      setError(message)
      throw err
    }
  }, [])

  // Actualizar estado
  const updateStatus = useCallback(async (projectId: string, status: ProjectStatus) => {
    try {
      await projectService.updateProjectStatus(projectId, status)
      setProjects(prev => prev.map(p =>
        p.id === projectId ? { ...p, status } : p
      ))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating status'
      setError(message)
      throw err
    }
  }, [])

  // Agregar metrica
  const addMetric = useCallback(async (projectId: string, metric: MetricData) => {
    try {
      await projectService.addMetric(projectId, metric)
      setProjects(prev => prev.map(p =>
        p.id === projectId
          ? { ...p, metrics: [...p.metrics, metric].sort((a, b) => a.month.localeCompare(b.month)) }
          : p
      ))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error adding metric'
      setError(message)
      throw err
    }
  }, [])

  // Analizar con IA y guardar
  const analyzeAndSave = useCallback(async (project: Project) => {
    try {
      const analysis = await analyzeProject(project)
      await projectService.saveAnalysis(project.id, analysis)
      setProjects(prev => prev.map(p =>
        p.id === project.id ? { ...p, lastAnalysis: analysis } : p
      ))
      return analysis
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error analyzing project'
      setError(message)
      throw err
    }
  }, [])

  // Eliminar proyecto
  const deleteProject = useCallback(async (projectId: string) => {
    try {
      await projectService.deleteProject(projectId)
      setProjects(prev => prev.filter(p => p.id !== projectId))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error deleting project'
      setError(message)
      throw err
    }
  }, [])

  // Obtener proyecto por ID
  const getProjectById = useCallback((projectId: string) => {
    return projects.find(p => p.id === projectId) || null
  }, [projects])

  return {
    projects,
    loading,
    error,
    addProject,
    updateStatus,
    addMetric,
    analyzeAndSave,
    deleteProject,
    getProjectById,
    refresh: fetchProjects
  }
}
