import { useMemo } from 'react'
import { getTaskAlert } from '../utils/kpi'

/**
 * Returns a flat list of all at-risk tasks across all projects,
 * sorted by severity (overdue first) then by date.
 */
export function useAlerts(projects, alertDays = 7) {
  return useMemo(() => {
    const alerts = []

    projects.forEach(project => {
      project.tasks.forEach(task => {
        const alertType = getTaskAlert(task, alertDays)
        if (alertType) {
          alerts.push({
            projectId:   project.id,
            projectName: project.name,
            task,
            alertType,
          })
        }
      })
    })

    const order = { overdue: 0, due_soon: 1, not_started: 2, cr_active: 3 }
    return alerts.sort((a, b) => (order[a.alertType] ?? 9) - (order[b.alertType] ?? 9))
  }, [projects, alertDays])
}
