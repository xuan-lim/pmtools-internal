import { Link } from 'react-router-dom'
import { getProjectHealth, getProjectProgress, getNextDeadline, CATEGORY_COLOR } from '../../utils/kpi'
import { formatDate, daysBetween, today } from '../../utils/kpi'
import { ChevronRight, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react'

const HEALTH_CONFIG = {
  green:  { bar: 'bg-green-500',  ring: 'ring-green-200',  dot: 'bg-green-500',  label: '正常' },
  yellow: { bar: 'bg-amber-400',  ring: 'ring-amber-200',  dot: 'bg-amber-400',  label: '注意' },
  red:    { bar: 'bg-red-500',    ring: 'ring-red-200',    dot: 'bg-red-500',    label: '逾期' },
}

const CATEGORY_LABEL = {
  report:       '報告書',
  verification: '驗證',
  assessment:   '評鑑',
  award:        '獎項',
}

export default function ProjectCard({ project, settings, alerts }) {
  const health   = getProjectHealth(project, settings.alertDaysWindow)
  const progress = getProjectProgress(project)
  const nextDate = getNextDeadline(project)
  const cfg      = HEALTH_CONFIG[health]

  const overdueCount  = alerts.filter(a => a.alertType === 'overdue').length
  const dueSoonCount  = alerts.filter(a => a.alertType === 'due_soon').length
  const daysUntilNext = nextDate ? daysBetween(today(), nextDate) : null

  return (
    <Link to={`/projects/${project.id}`} className="card block p-4 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`badge ${CATEGORY_COLOR[project.category]}`}>
              {CATEGORY_LABEL[project.category]}
            </span>
            <span className={`flex items-center gap-1 text-xs font-medium`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-brand-700 transition-colors">
            {project.name}
          </h3>
        </div>
        <ChevronRight size={16} className="text-gray-400 flex-shrink-0 mt-1" />
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>進度</span>
          <span>{progress.done} / {progress.total} 項完成</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${cfg.bar}`}
            style={{ width: `${progress.pct}%` }}
          />
        </div>
      </div>

      {/* Footer info */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        {nextDate && (
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {daysUntilNext === 0
              ? '今天到期'
              : daysUntilNext > 0
              ? `${daysUntilNext} 天後到期`
              : `${Math.abs(daysUntilNext)} 天前到期`}
          </span>
        )}
        {overdueCount > 0 && (
          <span className="flex items-center gap-1 text-red-600 font-medium">
            <AlertTriangle size={12} />
            {overdueCount} 項逾期
          </span>
        )}
        {dueSoonCount > 0 && overdueCount === 0 && (
          <span className="flex items-center gap-1 text-amber-600">
            <Clock size={12} />
            {dueSoonCount} 項即將到期
          </span>
        )}
        {overdueCount === 0 && dueSoonCount === 0 && progress.done === progress.total && progress.total > 0 && (
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle2 size={12} />
            全部完成
          </span>
        )}
      </div>
    </Link>
  )
}
