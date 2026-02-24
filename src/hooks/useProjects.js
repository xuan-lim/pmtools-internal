import { useState, useEffect, useCallback } from 'react'
import initialProjects from '../data/projects.json'
import initialSettings from '../data/settings.json'

const STORAGE_KEY = 'pmtools_projects'
const SETTINGS_KEY = 'pmtools_settings'

/**
 * Central data hook. Loads from localStorage (edits) with JSON as fallback.
 * Provides CRUD operations and export.
 */
export function useProjects() {
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : initialProjects
    } catch {
      return initialProjects
    }
  })

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY)
      return saved ? JSON.parse(saved) : initialSettings
    } catch {
      return initialSettings
    }
  })

  // Persist on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  }, [projects])

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  // ── Project operations ─────────────────────────────────────────

  const updateProject = useCallback((projectId, updates) => {
    setProjects(prev =>
      prev.map(p => p.id === projectId ? { ...p, ...updates } : p)
    )
  }, [])

  const addProject = useCallback((project) => {
    setProjects(prev => [...prev, project])
  }, [])

  const deleteProject = useCallback((projectId) => {
    setProjects(prev => prev.filter(p => p.id !== projectId))
  }, [])

  // ── Task operations ────────────────────────────────────────────

  const updateTask = useCallback((projectId, taskId, updates) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p
        return {
          ...p,
          tasks: p.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
        }
      })
    )
  }, [])

  const addTask = useCallback((projectId, task) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p
        return { ...p, tasks: [...p.tasks, task] }
      })
    )
  }, [])

  const deleteTask = useCallback((projectId, taskId) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p
        return { ...p, tasks: p.tasks.filter(t => t.id !== taskId) }
      })
    )
  }, [])

  // ── Export ─────────────────────────────────────────────────────

  /**
   * Export the current projects state as a downloadable JSON file.
   * User commits this back to the repo as src/data/projects.json.
   */
  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(projects, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'projects.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [projects])

  /**
   * Export a single project's tasks as CSV.
   */
  const exportProjectCSV = useCallback((projectId) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return

    const headers = ['#', '里程碑', 'Owner', '狀態', '預計開始', '預計交付', '預計結束', '實際開始', '實際交付', '實際結束', '交付準時度', '工時優化度', '備注']
    const rows = project.tasks.map(t => [
      t.seq, t.name, t.owner, t.status,
      t.forecast_start, t.forecast_deliver, t.forecast_end,
      t.actual_start, t.actual_deliver, t.actual_end,
      '', '', t.memo
    ])

    const csv = [headers, ...rows].map(r => r.map(c => `"${c ?? ''}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.id}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [projects])

  /**
   * Reset to the original JSON (clears all localStorage edits).
   */
  const resetToDefault = useCallback(() => {
    if (window.confirm('確定要還原為預設資料？所有編輯將遺失。')) {
      localStorage.removeItem(STORAGE_KEY)
      setProjects(initialProjects)
    }
  }, [])

  return {
    projects,
    settings,
    setSettings,
    updateProject,
    addProject,
    deleteProject,
    updateTask,
    addTask,
    deleteTask,
    exportJSON,
    exportProjectCSV,
    resetToDefault,
  }
}
