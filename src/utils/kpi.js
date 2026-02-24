/**
 * Core utility functions for date comparison and KPI calculation.
 * These replace the nested Excel IF formulas.
 */

/**
 * Parse a date string (yyyy-mm-dd) into a Date object, or return null.
 */
export function parseDate(str) {
  if (!str) return null
  const d = new Date(str)
  return isNaN(d.getTime()) ? null : d
}

/**
 * Format a Date object to yyyy-mm-dd string.
 */
export function formatDate(date) {
  if (!date) return ''
  return date.toISOString().split('T')[0]
}

/**
 * Return today as a Date (time zeroed).
 */
export function today() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Delivery timeliness (交付準時度)
 * Uses CR deliver if available, otherwise forecast deliver.
 * Returns: 'early' | 'on_time' | 'late' | null
 */
export function calcDeliveryTimeliness(task) {
  const actual = parseDate(task.actual_deliver)
  if (!actual) return null

  const baseline = parseDate(task.cr_deliver) || parseDate(task.forecast_deliver)
  if (!baseline) return null

  const diff = actual - baseline
  if (diff < 0) return 'early'
  if (diff === 0) return 'on_time'
  return 'late'
}

/**
 * Effort efficiency (工時優化度)
 * Returns: 'shortened' | 'normal' | 'extended' | null
 */
export function calcEffortEfficiency(task) {
  const actualStart = parseDate(task.actual_start)
  const actualEnd   = parseDate(task.actual_end)
  if (!actualStart || !actualEnd) return null

  const baseStart = parseDate(task.cr_start)   || parseDate(task.forecast_start)
  const baseEnd   = parseDate(task.cr_end)     || parseDate(task.forecast_end)
  if (!baseStart || !baseEnd) return null

  const actualDuration   = actualEnd   - actualStart
  const forecastDuration = baseEnd     - baseStart
  const diff = actualDuration - forecastDuration

  if (diff < 0) return 'shortened'
  if (diff === 0) return 'normal'
  return 'extended'
}

/**
 * Alert type for a task.
 * Returns: 'overdue' | 'due_soon' | 'not_started' | 'cr_active' | null
 */
export function getTaskAlert(task, alertDays = 7) {
  const now = today()
  const deliverDate = parseDate(task.cr_deliver) || parseDate(task.forecast_deliver)
  const startDate   = parseDate(task.cr_start)   || parseDate(task.forecast_start)

  if (task.status === 'done' || task.status === 'cancelled') return null

  // CR active
  if (task.cr_deliver || task.cr_start) return 'cr_active'

  // Overdue: deliver date passed, no actual delivery
  if (deliverDate && !task.actual_deliver) {
    if (now > deliverDate) return 'overdue'
  }

  // Due soon
  if (deliverDate && !task.actual_deliver) {
    const msUntil = deliverDate - now
    const daysUntil = msUntil / (1000 * 60 * 60 * 24)
    if (daysUntil >= 0 && daysUntil <= alertDays) return 'due_soon'
  }

  // Not started: start date passed, no actual start
  if (startDate && !task.actual_start && now > startDate) return 'not_started'

  return null
}

/**
 * Compute overall project health: 'green' | 'yellow' | 'red'
 */
export function getProjectHealth(project, alertDays = 7) {
  const alerts = project.tasks.map(t => getTaskAlert(t, alertDays))
  if (alerts.includes('overdue')) return 'red'
  if (alerts.includes('due_soon') || alerts.includes('not_started')) return 'yellow'
  return 'green'
}

/**
 * Count completed tasks in a project.
 */
export function getProjectProgress(project) {
  const total = project.tasks.length
  const done  = project.tasks.filter(t => t.status === 'done').length
  return { total, done, pct: total === 0 ? 0 : Math.round((done / total) * 100) }
}

/**
 * Get the next upcoming deadline for a project.
 */
export function getNextDeadline(project) {
  const now = today()
  const upcoming = project.tasks
    .filter(t => t.status !== 'done' && t.status !== 'cancelled')
    .map(t => parseDate(t.cr_deliver) || parseDate(t.forecast_deliver))
    .filter(d => d && d >= now)
    .sort((a, b) => a - b)
  return upcoming[0] || null
}

/**
 * Days between two dates (positive = future).
 */
export function daysBetween(a, b) {
  if (!a || !b) return null
  return Math.round((b - a) / (1000 * 60 * 60 * 24))
}

export const TIMELINESS_LABEL = {
  early:   '提前交付',
  on_time: '準時交付',
  late:    '延遲交付',
}

export const EFFICIENCY_LABEL = {
  shortened: '縮短工時',
  normal:    '正常作業',
  extended:  '延遲工時',
}

export const ALERT_LABEL = {
  overdue:     '已逾期',
  due_soon:    '即將到期',
  not_started: '未開始',
  cr_active:   'CR 進行中',
}

export const CATEGORY_COLOR = {
  report:       'bg-blue-100 text-blue-800',
  verification: 'bg-purple-100 text-purple-800',
  assessment:   'bg-amber-100 text-amber-800',
  award:        'bg-pink-100 text-pink-800',
}

export const STATUS_COLOR = {
  not_started: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  done:        'bg-green-100 text-green-700',
  blocked:     'bg-red-100 text-red-700',
  cancelled:   'bg-gray-100 text-gray-400',
}
