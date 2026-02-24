import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import {
  calcDeliveryTimeliness, calcEffortEfficiency, getTaskAlert,
  TIMELINESS_LABEL, EFFICIENCY_LABEL, ALERT_LABEL,
  STATUS_COLOR, CATEGORY_COLOR
} from '../../utils/kpi'
import { ArrowLeft, Download, Save, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

const TASK_STATUSES = [
  { value: 'not_started', label: '未開始' },
  { value: 'in_progress', label: '進行中' },
  { value: 'done',        label: '完成' },
  { value: 'blocked',     label: '待解決' },
  { value: 'cancelled',   label: '取消' },
]

const ALERT_BADGE = {
  overdue:     'bg-red-100 text-red-700',
  due_soon:    'bg-amber-100 text-amber-700',
  not_started: 'bg-orange-100 text-orange-700',
  cr_active:   'bg-blue-100 text-blue-700',
}

export default function ProjectDetail({ store }) {
  const { id } = useParams()
  const { projects, settings, updateTask, addTask, deleteTask, exportProjectCSV } = store
  const project = projects.find(p => p.id === id)
  const [expandedCR, setExpandedCR] = useState({})

  if (!project) {
    return (
      <div className="p-6">
        <p className="text-gray-500">找不到專案</p>
        <Link to="/projects" className="btn-secondary mt-3">← 返回</Link>
      </div>
    )
  }

  function handleTaskChange(taskId, field, value) {
    updateTask(project.id, taskId, { [field]: value })
  }

  function toggleCR(taskId) {
    setExpandedCR(prev => ({ ...prev, [taskId]: !prev[taskId] }))
  }

  function handleAddTask() {
    const newSeq = project.tasks.length + 1
    const newTask = {
      id: `t${Date.now()}`,
      seq: newSeq,
      name: '新任務',
      owner: '',
      status: 'not_started',
      forecast_start: '', forecast_deliver: '', forecast_end: '',
      actual_start: '', actual_deliver: '', actual_end: '',
      cr_start: '', cr_deliver: '', cr_end: '', cr_note: '',
      memo: '',
    }
    addTask(project.id, newTask)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft size={14} /> 返回專案列表
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`badge ${CATEGORY_COLOR[project.category]}`}>
              {project.category === 'report' ? '報告書' : project.category === 'verification' ? '驗證' : project.category === 'assessment' ? '評鑑' : '獎項'}
            </span>
            <span className="text-xs text-gray-500">{project.tasks.filter(t => t.status === 'done').length} / {project.tasks.length} 項完成</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => exportProjectCSV(project.id)} className="btn-secondary">
            <Download size={14} /> 匯出 CSV
          </button>
          <button onClick={handleAddTask} className="btn-primary">
            <Plus size={14} /> 新增任務
          </button>
        </div>
      </div>

      {/* Task table */}
      <div className="card overflow-auto">
        <table className="w-full text-sm" style={{ minWidth: 900 }}>
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-600">
              <th className="px-3 py-2 text-left w-8">#</th>
              <th className="px-3 py-2 text-left min-w-40">里程碑</th>
              <th className="px-3 py-2 text-left w-24">Owner</th>
              <th className="px-3 py-2 text-left w-24">狀態</th>
              <th className="px-3 py-2 text-left w-28">預計開始</th>
              <th className="px-3 py-2 text-left w-28">預計交付</th>
              <th className="px-3 py-2 text-left w-28">實際交付</th>
              <th className="px-3 py-2 text-left w-24">準時度</th>
              <th className="px-3 py-2 text-left w-24">工時優化</th>
              <th className="px-3 py-2 text-left w-20">提醒</th>
              <th className="px-3 py-2 w-16">CR / 刪除</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {project.tasks.map(task => {
              const timeliness = calcDeliveryTimeliness(task)
              const efficiency = calcEffortEfficiency(task)
              const alert      = getTaskAlert(task, settings.alertDaysWindow)
              const crOpen     = expandedCR[task.id]

              return (
                <>
                  <tr key={task.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-3 py-2 text-gray-400 text-xs">{task.seq}</td>
                    <td className="px-3 py-2">
                      <input
                        value={task.name}
                        onChange={e => handleTaskChange(task.id, 'name', e.target.value)}
                        className="w-full text-sm text-gray-900 bg-transparent border-0 focus:outline-none focus:bg-white focus:ring-1 focus:ring-brand-400 rounded px-1 -ml-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={task.owner}
                        onChange={e => handleTaskChange(task.id, 'owner', e.target.value)}
                        placeholder="—"
                        className="w-full text-xs text-gray-600 bg-transparent border-0 focus:outline-none focus:bg-white focus:ring-1 focus:ring-brand-400 rounded px-1 -ml-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={task.status}
                        onChange={e => handleTaskChange(task.id, 'status', e.target.value)}
                        className={`badge border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-400 ${STATUS_COLOR[task.status]}`}
                      >
                        {TASK_STATUSES.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        value={task.forecast_start}
                        onChange={e => handleTaskChange(task.id, 'forecast_start', e.target.value)}
                        className="text-xs text-gray-600 bg-transparent border-0 focus:outline-none focus:bg-white focus:ring-1 focus:ring-brand-400 rounded px-1 -ml-1 w-full"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        value={task.forecast_deliver}
                        onChange={e => handleTaskChange(task.id, 'forecast_deliver', e.target.value)}
                        className="text-xs text-gray-600 bg-transparent border-0 focus:outline-none focus:bg-white focus:ring-1 focus:ring-brand-400 rounded px-1 -ml-1 w-full"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        value={task.actual_deliver}
                        onChange={e => handleTaskChange(task.id, 'actual_deliver', e.target.value)}
                        className="text-xs text-gray-600 bg-transparent border-0 focus:outline-none focus:bg-white focus:ring-1 focus:ring-brand-400 rounded px-1 -ml-1 w-full"
                      />
                    </td>
                    <td className="px-3 py-2">
                      {timeliness && (
                        <span className={`badge text-xs ${
                          timeliness === 'early'   ? 'bg-green-100 text-green-700' :
                          timeliness === 'on_time' ? 'bg-blue-100 text-blue-700'  :
                          'bg-red-100 text-red-700'
                        }`}>
                          {TIMELINESS_LABEL[timeliness]}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {efficiency && (
                        <span className={`badge text-xs ${
                          efficiency === 'shortened' ? 'bg-green-100 text-green-700'  :
                          efficiency === 'normal'    ? 'bg-gray-100 text-gray-600'    :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {EFFICIENCY_LABEL[efficiency]}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {alert && (
                        <span className={`badge text-xs ${ALERT_BADGE[alert]}`}>
                          {ALERT_LABEL[alert]}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleCR(task.id)}
                          title="變更請求 (CR)"
                          className={`p-1 rounded text-xs transition-colors ${
                            crOpen ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          CR
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`確定刪除「${task.name}」？`)) deleteTask(project.id, task.id)
                          }}
                          className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* CR expansion row */}
                  {crOpen && (
                    <tr key={`${task.id}-cr`} className="bg-indigo-50/50">
                      <td />
                      <td colSpan={10} className="px-4 py-3">
                        <p className="text-xs font-semibold text-indigo-700 mb-2">📋 變更請求 (CR) 詳情</p>
                        <div className="grid grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">CR 開始日</label>
                            <input type="date" value={task.cr_start}
                              onChange={e => handleTaskChange(task.id, 'cr_start', e.target.value)}
                              className="input text-xs" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">CR 交付日</label>
                            <input type="date" value={task.cr_deliver}
                              onChange={e => handleTaskChange(task.id, 'cr_deliver', e.target.value)}
                              className="input text-xs" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">CR 結束日</label>
                            <input type="date" value={task.cr_end}
                              onChange={e => handleTaskChange(task.id, 'cr_end', e.target.value)}
                              className="input text-xs" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">實際開始</label>
                            <input type="date" value={task.actual_start}
                              onChange={e => handleTaskChange(task.id, 'actual_start', e.target.value)}
                              className="input text-xs" />
                          </div>
                          <div className="col-span-4">
                            <label className="block text-xs text-gray-500 mb-1">CR 說明 / 備注</label>
                            <input value={task.cr_note}
                              onChange={e => handleTaskChange(task.id, 'cr_note', e.target.value)}
                              placeholder="說明變更原因…"
                              className="input text-xs w-full" />
                          </div>
                          <div className="col-span-4">
                            <label className="block text-xs text-gray-500 mb-1">摘要備注</label>
                            <input value={task.memo}
                              onChange={e => handleTaskChange(task.id, 'memo', e.target.value)}
                              placeholder="任何補充說明…"
                              className="input text-xs w-full" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        💾 所有變更自動儲存到瀏覽器。若要永久儲存，請至「設定」頁面匯出 JSON 並提交至 GitHub。
      </p>
    </div>
  )
}
