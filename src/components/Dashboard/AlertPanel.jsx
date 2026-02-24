import { Link } from 'react-router-dom'
import { AlertTriangle, Clock, Play, RefreshCw } from 'lucide-react'

const ALERT_CONFIG = {
  overdue:     { icon: <AlertTriangle size={13} />, color: 'text-red-600',    bg: 'bg-red-50',    label: '已逾期' },
  due_soon:    { icon: <Clock size={13} />,         color: 'text-amber-600',  bg: 'bg-amber-50',  label: '即將到期' },
  not_started: { icon: <Play size={13} />,          color: 'text-orange-600', bg: 'bg-orange-50', label: '未開始' },
  cr_active:   { icon: <RefreshCw size={13} />,     color: 'text-blue-600',   bg: 'bg-blue-50',   label: 'CR 中' },
}

export default function AlertPanel({ alerts }) {
  const shown = alerts.slice(0, 12)

  return (
    <div className="card">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">⚠️ 待處理提醒</h2>
        <p className="text-xs text-gray-500 mt-0.5">{alerts.length} 項需要關注</p>
      </div>
      <div className="divide-y divide-gray-50">
        {shown.map((alert, i) => {
          const cfg = ALERT_CONFIG[alert.alertType]
          const deliver = alert.task.cr_deliver || alert.task.forecast_deliver
          return (
            <Link
              key={i}
              to={`/projects/${alert.projectId}`}
              className="flex items-start gap-2.5 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <span className={`mt-0.5 flex-shrink-0 ${cfg.color}`}>{cfg.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-900 truncate">{alert.task.name}</p>
                <p className="text-xs text-gray-400 truncate">{alert.projectName}</p>
                {deliver && (
                  <p className={`text-xs font-medium ${cfg.color}`}>{deliver}</p>
                )}
              </div>
              <span className={`badge flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                {cfg.label}
              </span>
            </Link>
          )
        })}
        {alerts.length > 12 && (
          <div className="px-4 py-2 text-center text-xs text-gray-400">
            還有 {alerts.length - 12} 項…
          </div>
        )}
      </div>
    </div>
  )
}
