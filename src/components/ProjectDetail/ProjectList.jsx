import { Link } from 'react-router-dom'
import { getProjectProgress, getProjectHealth, CATEGORY_COLOR } from '../../utils/kpi'
import { ChevronRight, Download } from 'lucide-react'

const CATEGORY_LABEL = { report: '報告書', verification: '驗證', assessment: '評鑑', award: '獎項' }
const PROJECT_STATUS_LABEL = { not_started: '未開始', in_progress: '進行中', on_hold: '暫停', completed: '已完成' }
const HEALTH_DOT = { green: 'bg-green-500', yellow: 'bg-amber-400', red: 'bg-red-500' }

export default function ProjectList({ store }) {
  const { projects, settings, exportProjectCSV } = store

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">專案管理</h1>
          <p className="text-sm text-gray-500 mt-0.5">共 {projects.length} 個專案</p>
        </div>
      </div>

      <div className="card divide-y divide-gray-100">
        {projects.map(project => {
          const progress = getProjectProgress(project)
          const health   = getProjectHealth(project, settings.alertDaysWindow)

          return (
            <div key={project.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${HEALTH_DOT[health]}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`badge ${CATEGORY_COLOR[project.category]}`} style={{fontSize:'10px'}}>
                    {CATEGORY_LABEL[project.category]}
                  </span>
                  <span className="text-xs text-gray-400">{PROJECT_STATUS_LABEL[project.status]}</span>
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">{project.name}</p>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-2 w-36">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full"
                    style={{ width: `${progress.pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-14 text-right">{progress.done}/{progress.total}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => exportProjectCSV(project.id)}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  title="匯出 CSV"
                >
                  <Download size={15} />
                </button>
                <Link
                  to={`/projects/${project.id}`}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ChevronRight size={15} />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
