import { useState, useMemo, useRef } from 'react'
import { parseDate, today, CATEGORY_COLOR } from '../../utils/kpi'
import { ChevronDown, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'

const ZOOM_LEVELS = ['month', 'quarter']
const MONTHS_TC = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']

const BAR_COLORS = {
  forecast: 'bg-blue-300',
  actual_done: 'bg-green-400',
  actual_progress: 'bg-orange-400',
  overdue: 'bg-red-400',
  cr: 'bg-indigo-300 opacity-70 border border-dashed border-indigo-400',
}

export default function GanttView({ store }) {
  const { projects, settings } = store
  const [zoom, setZoom] = useState('month')
  const [collapsed, setCollapsed] = useState({})
  const [ownerFilter, setOwnerFilter] = useState('all')
  const nowLine = today()

  // Determine date range: current year
  const year = new Date().getFullYear()
  const rangeStart = new Date(year, 0, 1)
  const rangeEnd   = new Date(year, 11, 31)
  const totalDays  = Math.round((rangeEnd - rangeStart) / 86400000) + 1

  // Collect all unique owners
  const owners = useMemo(() => {
    const set = new Set()
    projects.forEach(p => p.tasks.forEach(t => { if (t.owner) set.add(t.owner) }))
    return Array.from(set)
  }, [projects])

  // Build month columns
  const months = useMemo(() => {
    const cols = []
    for (let m = 0; m < 12; m++) {
      const start = new Date(year, m, 1)
      const end   = new Date(year, m + 1, 0)
      const days  = end.getDate()
      cols.push({ label: MONTHS_TC[m], start, days, pct: (days / totalDays) * 100 })
    }
    return cols
  }, [year, totalDays])

  function dayPct(date) {
    if (!date) return null
    const d = Math.round((date - rangeStart) / 86400000)
    return Math.max(0, Math.min(100, (d / totalDays) * 100))
  }

  function toggleCollapse(id) {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const nowPct = dayPct(nowLine)

  const LABEL_W = 220 // px

  return (
    <div className="p-6 max-w-full">
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">甘特時程</h1>
          <p className="text-sm text-gray-500">{year} 年度全覽</p>
        </div>
        <div className="flex items-center gap-2">
          {owners.length > 0 && (
            <select
              value={ownerFilter}
              onChange={e => setOwnerFilter(e.target.value)}
              className="select w-36"
            >
              <option value="all">全部成員</option>
              {owners.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          )}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            {ZOOM_LEVELS.map(z => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  zoom === z ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {z === 'month' ? '月' : '季'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 flex-wrap text-xs text-gray-500">
        {[
          { color: 'bg-blue-300', label: '預計' },
          { color: 'bg-green-400', label: '實際完成' },
          { color: 'bg-orange-400', label: '進行中' },
          { color: 'bg-red-400', label: '逾期' },
          { color: 'bg-indigo-300', label: 'CR 修訂' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-sm ${color}`} />
            {label}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="w-0.5 h-4 bg-red-500 rounded" />
          今天
        </span>
      </div>

      {/* Gantt table */}
      <div className="card overflow-auto">
        <div style={{ minWidth: LABEL_W + 800 }}>
          {/* Header */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <div style={{ width: LABEL_W, minWidth: LABEL_W }} className="px-3 py-2 text-xs font-semibold text-gray-600 border-r border-gray-200 flex-shrink-0">
              專案 / 里程碑
            </div>
            <div className="flex-1 relative">
              <div className="flex">
                {months.map(m => (
                  <div
                    key={m.label}
                    style={{ width: `${m.pct}%` }}
                    className="text-center text-xs py-2 font-medium text-gray-600 border-r border-gray-100 last:border-r-0"
                  >
                    {m.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rows */}
          {projects.map(project => {
            const isCollapsed = collapsed[project.id]
            const filteredTasks = ownerFilter === 'all'
              ? project.tasks
              : project.tasks.filter(t => t.owner === ownerFilter)
            if (ownerFilter !== 'all' && filteredTasks.length === 0) return null

            return (
              <div key={project.id}>
                {/* Project header row */}
                <div
                  className="flex items-center border-b border-gray-100 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleCollapse(project.id)}
                >
                  <div style={{ width: LABEL_W, minWidth: LABEL_W }} className="px-3 py-2 flex items-center gap-1.5 border-r border-gray-200 flex-shrink-0">
                    {isCollapsed ? <ChevronRight size={14} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />}
                    <span className={`badge ${CATEGORY_COLOR[project.category]} flex-shrink-0`} style={{fontSize:'10px'}}>
                      {project.category === 'report' ? '報告' : project.category === 'verification' ? '驗證' : project.category === 'assessment' ? '評鑑' : '獎項'}
                    </span>
                    <span className="text-xs font-semibold text-gray-800 truncate">{project.name}</span>
                  </div>
                  <div className="flex-1 h-9 relative">
                    {/* month grid lines */}
                    {months.map(m => (
                      <div key={m.label} style={{ left: `${dayPct(m.start)}%`, width: `${m.pct}%` }} className="absolute inset-y-0 border-r border-gray-100" />
                    ))}
                    {nowPct !== null && (
                      <div style={{ left: `${nowPct}%` }} className="absolute inset-y-0 w-px bg-red-400 z-10" />
                    )}
                  </div>
                </div>

                {/* Task rows */}
                {!isCollapsed && filteredTasks.map(task => {
                  const fStart = parseDate(task.forecast_start)
                  const fDeliv = parseDate(task.forecast_deliver)
                  const aStart = parseDate(task.actual_start)
                  const aDeliv = parseDate(task.actual_deliver || task.actual_end)
                  const crStart = parseDate(task.cr_start)
                  const crDeliv = parseDate(task.cr_deliver)

                  const isOverdue = fDeliv && !task.actual_deliver && today() > fDeliv
                  const isDone    = task.status === 'done'

                  return (
                    <div key={task.id} className="flex items-center border-b border-gray-50 hover:bg-blue-50/40 transition-colors group">
                      <div style={{ width: LABEL_W, minWidth: LABEL_W }} className="px-3 py-1.5 flex items-center gap-2 border-r border-gray-100 flex-shrink-0">
                        <span className="w-4 text-right text-xs text-gray-400 flex-shrink-0">{task.seq}</span>
                        <span className="text-xs text-gray-700 truncate flex-1">{task.name}</span>
                        {task.owner && (
                          <span className="text-xs text-gray-400 flex-shrink-0">{task.owner}</span>
                        )}
                      </div>
                      <div className="flex-1 h-8 relative">
                        {/* Grid lines */}
                        {months.map(m => (
                          <div key={m.label} style={{ left: `${dayPct(m.start)}%`, width: `${m.pct}%` }} className="absolute inset-y-0 border-r border-gray-50" />
                        ))}

                        {/* Today line */}
                        {nowPct !== null && (
                          <div style={{ left: `${nowPct}%` }} className="absolute inset-y-0 w-px bg-red-400 z-10 opacity-60" />
                        )}

                        {/* CR bar (behind) */}
                        {crStart && crDeliv && (
                          <GanttBar
                            left={dayPct(crStart)}
                            right={dayPct(crDeliv)}
                            color="bg-indigo-200 border border-dashed border-indigo-400"
                            height={4}
                            offsetY={12}
                          />
                        )}

                        {/* Forecast bar */}
                        {fStart && fDeliv && (
                          <GanttBar
                            left={dayPct(fStart)}
                            right={dayPct(fDeliv)}
                            color={isOverdue ? 'bg-red-400' : 'bg-blue-300'}
                            height={6}
                            offsetY={11}
                          />
                        )}

                        {/* Actual bar */}
                        {aStart && (
                          <GanttBar
                            left={dayPct(aStart)}
                            right={aDeliv ? dayPct(aDeliv) : nowPct}
                            color={isDone ? 'bg-green-500' : 'bg-orange-400'}
                            height={6}
                            offsetY={11}
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function GanttBar({ left, right, color, height = 6, offsetY = 11 }) {
  if (left === null || right === null) return null
  const width = Math.max(right - left, 0.3)
  return (
    <div
      className={`absolute rounded-full ${color}`}
      style={{
        left:   `${left}%`,
        width:  `${width}%`,
        height: `${height}px`,
        top:    `${offsetY}px`,
      }}
    />
  )
}
