import { useState } from 'react'
import { Syringe, Scissors, Zap, ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { projects } from '@/data/projects'
import type { ProjectCategory } from '@/types'

const iconMap = { Syringe, Scissors, Zap } as const
const borderColors: Record<string, string> = {
  injection: 'border-l-sky-400',
  surgery: 'border-l-amber-400',
  laser: 'border-l-emerald-400',
}
const ringColors: Record<string, string> = {
  injection: 'ring-sky-400/40',
  surgery: 'ring-amber-400/40',
  laser: 'ring-emerald-400/40',
}

const metricLabels: Record<string, { key: string; label: string }[]> = {
  injection: [
    { key: 'batchRecordRate', label: '药品批号记录率' },
    { key: 'siteRecordRate', label: '部位记录完整率' },
  ],
  surgery: [
    { key: 'instrumentCheckRate', label: '器械清点合规率' },
    { key: 'handoverRate', label: '术后交接完成率' },
  ],
  laser: [
    { key: 'paramRecordRate', label: '治疗参数记录率' },
    { key: 'consentCheckRate', label: '知情同意确认率' },
  ],
}

function ProgressItem({ label, value }: { label: string; value: number }) {
  const color = value >= 90 ? 'bg-emerald-500' : value >= 80 ? 'bg-amber-500' : 'bg-red-500'
  const textColor = value >= 90 ? 'text-emerald-600' : value >= 80 ? 'text-amber-600' : 'text-red-600'
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className={`font-mono font-semibold ${textColor}`}>{value}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function IssueTable({ issues }: { issues: ProjectCategory['topIssues'] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100 text-left text-gray-400">
          <th className="pb-2 font-medium">问题项</th>
          <th className="pb-2 font-medium text-right">次数</th>
          <th className="pb-2 font-medium text-right">严重度</th>
        </tr>
      </thead>
      <tbody>
        {issues.map((item, i) => (
          <tr key={i} className="border-b border-gray-50 last:border-0">
            <td className="py-2.5 text-gray-700">{item.issue}</td>
            <td className="py-2.5 text-right font-mono text-gray-800">{item.count}</td>
            <td className="py-2.5 text-right">
              {item.count >= 5 ? (
                <span className="inline-flex items-center gap-1 text-red-500">
                  <AlertTriangle size={13} /> 高
                </span>
              ) : item.count >= 3 ? (
                <span className="inline-flex items-center gap-1 text-amber-500">
                  <AlertTriangle size={13} /> 中
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-emerald-500">
                  <CheckCircle2 size={13} /> 低
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function Quality() {
  const [activeId, setActiveId] = useState<string>(projects[0].id)
  const active = projects.find((p) => p.id === activeId)!

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-6 font-[Noto_Sans_SC]">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">项目质控</h1>
        <p className="mt-1 text-sm text-gray-400">按项目类别查看常见问题与合规指标</p>
      </header>

      <div className="grid grid-cols-3 gap-4">
        {projects.map((p) => {
          const Icon = iconMap[p.icon as keyof typeof iconMap]
          const isActive = p.id === activeId
          const badgeBg = p.anomalyCount > 15 ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'
          return (
            <button
              key={p.id}
              onClick={() => setActiveId(p.id)}
              className={`group relative w-full rounded-xl border-l-4 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${borderColors[p.type]} ${
                isActive ? `ring-2 ${ringColors[p.type]} shadow-md` : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-[#4A9EFF]">
                    <Icon size={20} />
                  </div>
                  <span className="text-lg font-semibold text-[#1B2A4A]">{p.name}</span>
                </div>
                <ChevronRight
                  size={18}
                  className={`text-gray-300 transition-transform duration-200 ${isActive ? 'rotate-90 text-[#4A9EFF]' : 'group-hover:translate-x-0.5'}`}
                />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeBg}`}>
                  <AlertTriangle size={12} /> {p.anomalyCount} 异常
                </span>
                <span className="text-xs text-gray-400">共 {p.totalCases} 例</span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-6 grid grid-cols-5 gap-5">
        <div className="col-span-2 rounded-xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-[#1B2A4A]">合规指标</h3>
          <div className="space-y-5">
            {metricLabels[active.type].map(({ key, label }) => (
              <ProgressItem key={key} label={label} value={active.metrics[key as keyof typeof active.metrics] ?? 0} />
            ))}
          </div>
        </div>

        <div className="col-span-3 rounded-xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-[#1B2A4A]">TOP5 问题分布</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={active.topIssues} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="issue" width={130} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip
                formatter={(v: number) => [`${v} 次`, '次数']}
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,.08)' }}
              />
              <Bar dataKey="count" fill="#4A9EFF" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-[#1B2A4A]">问题明细表</h3>
        <IssueTable issues={active.topIssues} />
      </div>
    </div>
  )
}
