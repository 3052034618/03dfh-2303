import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  ShieldCheck,
  UserCircle,
  AlertTriangle,
  ClipboardCheck,
  FileBarChart,
  Activity,
} from 'lucide-react'

const navItems = [
  { to: '/overview', label: '机构总览', icon: LayoutDashboard },
  { to: '/quality', label: '项目质控', icon: ShieldCheck },
  { to: '/profile', label: '人员画像', icon: UserCircle },
  { to: '/anomaly', label: '异常闭环', icon: AlertTriangle },
  { to: '/spotcheck', label: '抽查记录', icon: ClipboardCheck },
  { to: '/report', label: '月报中心', icon: FileBarChart },
]

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-surface-primary">
      <aside className="fixed left-0 top-0 bottom-0 w-60 bg-navy-500 flex flex-col z-50 shadow-lg">
        <div className="h-16 flex items-center gap-3 px-5 border-b border-navy-400/30">
          <div className="w-8 h-8 rounded-lg bg-ice-400 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white text-sm font-bold leading-tight">跟台质量复盘</h1>
            <p className="text-navy-200 text-xs leading-tight">Quality Review Platform</p>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-6 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-ice-400/20 text-ice-400 shadow-sm'
                    : 'text-navy-100 hover:bg-navy-400/30 hover:text-white'
                }`
              }
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-navy-400/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-ice-400/20 flex items-center justify-center text-ice-400 text-xs font-bold">
              QC
            </div>
            <div>
              <p className="text-white text-xs font-medium">质控专员</p>
              <p className="text-navy-200 text-xs">总部护理管理部</p>
            </div>
          </div>
        </div>
      </aside>
      <main className="ml-60 flex-1 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
