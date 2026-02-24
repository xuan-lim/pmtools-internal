import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock, TrendingUp } from 'lucide-react'
import { getProjectHealth, getProjectProgress, getNextDeadline, CATEGORY_COLOR, ALERT_LABEL } from '../../utils/kpi'
import { formatDate } from '../../utils/kpi'
import ProjectCard from './ProjectCard'
import AlertPanel from './AlertPanel'

const CATEGORY_FILTER = [
  { value: 'all',          label: '全部' },
  { value: 'report',       label: '報告書' },
  { value: 'verification', label: '驗證' },
  { value: 'assessment',   label: '評鑑' },
  { value: 'award',        label: '獎項' },
]

export default function Dashboard({ store, alerts }) {
  const [categoryFilter, setCategoryFilter] = useState('all')
  const { projects, settings } = store

  const filtered = categoryFilter === 'all'
    ? projects
    : projects.filter(p => p.category === categoryFilter)

  const totalTasks    = projects.reduce((s, p) => s + p.tasks.length, 0)
  const doneTasks     = projects.reduce((s, p) => s + p.tasks.filter(t => t.status === 'done').length, 0)
  const overdueCount  = alerts.filter(a => a.alertType === 'overdue').length
  const dueSoonCount  = alerts.filter(a => a.alertType === 'due_soon').length

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">總覽儀表板</h1>
        <p className="text-sm text-gray-500 mt-0.5">ESG 年度專案健康狀態</p>
      </div>

      {/* Summary counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<FolderIcon />}
          label="進行中專案"
          value={projects.filter(p => p.status === 'in_progress').length}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle2 size={18} />}
          label="任務完成率"
          value={totalTasks === 0 ? '—' : `${Math.round((doneTasks / totalTasks) * 100)}%`}
          sub={`${doneTasks} / ${totalTasks} 項`}
          color="green"
        />
        <StatCard
          icon={<AlertTriangle size={18} />}
          label="已逾期任務"
          value={overdueCount}
          color={overdueCount > 0 ? 'red' : 'green'}
        />
        <StatCard
          icon={<Clock size={18} />}
          label={`${settings.alertDaysWindow} 天內到期`}
          value={dueSoonCount}
          color={dueSoonCount > 0 ? 'amber' : 'green'}
        />
      </div>

      <div className="flex gap-6 items-start">
        {/* Project cards */}
        <div className="flex-1 min-w-0">
          {/* Category filter */}
          <div className="flex gap-1.5 mb-4">
            {CATEGORY_FILTER.map(f => (
              <button
                key={f.value}
                onClick={() => setCategoryFilter(f.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  categoryFilter === f.value
                    ? 'bg-brand-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                settings={settings}
                alerts={alerts.filter(a => a.projectId === project.id)}
              />
            ))}
          </div>
        </div>

        {/* Alert panel */}
        {alerts.length > 0 && (
          <div className="w-72 flex-shrink-0">
            <AlertPanel alerts={alerts} />
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub, color }) {
  const colors = {
    blue:  'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red:   'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
  }
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-lg font-semibold text-gray-900 leading-tight">{value}</p>
          {sub && <p className="text-xs text-gray-400">{sub}</p>}
        </div>
      </div>
    </div>
  )
}

function FolderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  )
}
