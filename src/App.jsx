import { HashRouter, Routes, Route, NavLink } from 'react-router-dom'
import { LayoutDashboard, GanttChartSquare, FolderKanban, Settings } from 'lucide-react'
import { useProjects } from './hooks/useProjects'
import { useAlerts } from './hooks/useAlerts'
import Dashboard from './components/Dashboard/Dashboard'
import GanttView from './components/GanttView/GanttView'
import ProjectList from './components/ProjectDetail/ProjectList'
import ProjectDetail from './components/ProjectDetail/ProjectDetail'
import SettingsPage from './components/Shared/SettingsPage'

export default function App() {
  const store = useProjects()
  const alerts = useAlerts(store.projects, store.settings.alertDaysWindow)
  const overdueCount = alerts.filter(a => a.alertType === 'overdue').length

  return (
    <HashRouter>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          {/* Logo */}
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <GanttChartSquare size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">ESG 專案管理</p>
                <p className="text-xs text-gray-500">pmtools-internal</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-2 py-3 space-y-0.5">
            <NavItem to="/" icon={<LayoutDashboard size={16} />} label="總覽儀表板">
              {overdueCount > 0 && (
                <span className="ml-auto badge bg-red-100 text-red-700">{overdueCount}</span>
              )}
            </NavItem>
            <NavItem to="/gantt" icon={<GanttChartSquare size={16} />} label="甘特時程" />
            <NavItem to="/projects" icon={<FolderKanban size={16} />} label="專案管理" />
          </nav>

          {/* Bottom */}
          <div className="px-2 py-3 border-t border-gray-100">
            <NavItem to="/settings" icon={<Settings size={16} />} label="設定" />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <Routes>
            <Route path="/"          element={<Dashboard  store={store} alerts={alerts} />} />
            <Route path="/gantt"     element={<GanttView  store={store} />} />
            <Route path="/projects"  element={<ProjectList store={store} />} />
            <Route path="/projects/:id" element={<ProjectDetail store={store} />} />
            <Route path="/settings"  element={<SettingsPage store={store} />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  )
}

function NavItem({ to, icon, label, children }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive
            ? 'bg-brand-50 text-brand-700 font-medium'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      {icon}
      <span className="flex-1">{label}</span>
      {children}
    </NavLink>
  )
}
