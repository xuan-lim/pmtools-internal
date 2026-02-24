import { useState } from 'react'
import { Download, RotateCcw, Save } from 'lucide-react'

export default function SettingsPage({ store }) {
  const { settings, setSettings, exportJSON, resetToDefault } = store
  const [alertDays, setAlertDays] = useState(settings.alertDaysWindow)

  function saveSettings() {
    setSettings(prev => ({ ...prev, alertDaysWindow: Number(alertDays) }))
    alert('設定已儲存')
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">設定</h1>
        <p className="text-sm text-gray-500 mt-0.5">工具偏好與資料管理</p>
      </div>

      {/* Alert settings */}
      <div className="card p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">⏰ 提醒設定</h2>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-700">「即將到期」提前幾天提醒</label>
          <select
            value={alertDays}
            onChange={e => setAlertDays(e.target.value)}
            className="select w-24"
          >
            {[3, 7, 14, 30].map(d => <option key={d} value={d}>{d} 天</option>)}
          </select>
          <button onClick={saveSettings} className="btn-primary">
            <Save size={14} /> 儲存
          </button>
        </div>
      </div>

      {/* Data management */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">💾 資料管理</h2>
        <p className="text-xs text-gray-500 mb-4">
          所有編輯自動儲存在瀏覽器（localStorage）。要讓變更永久生效並與團隊同步，
          請匯出 JSON 並將其提交到 GitHub repo 的 <code className="bg-gray-100 px-1 rounded">src/data/projects.json</code>。
        </p>
        <div className="flex items-center gap-3">
          <button onClick={exportJSON} className="btn-primary">
            <Download size={14} /> 匯出 projects.json
          </button>
          <button onClick={resetToDefault} className="btn-danger">
            <RotateCcw size={14} /> 還原預設資料
          </button>
        </div>
        <div className="mt-4 bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
          <p className="font-medium mb-1">📌 提交流程：</p>
          <ol className="space-y-0.5 list-decimal list-inside">
            <li>點「匯出 projects.json」下載檔案</li>
            <li>將檔案覆蓋 <code>src/data/projects.json</code></li>
            <li>git commit &amp; push → GitHub Actions 自動重新部署</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
