import { useState, useMemo } from 'react'
import { Search, User, Lightbulb, TrendingUp, X } from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { assistants } from '@/data/assistants'
import { stores } from '@/data/stores'
import type { Assistant } from '@/types'

const avatarColor = (score: number) => {
  if (score > 90) return 'bg-emerald-500'
  if (score >= 80) return 'bg-ice-400'
  return 'bg-amber-400'
}

const scoreColor = (score: number) => {
  if (score > 90) return 'text-emerald-600'
  if (score >= 80) return 'text-ice-600'
  return 'text-amber-600'
}

export default function Profile() {
  const [search, setSearch] = useState('')
  const [storeFilter, setStoreFilter] = useState('')
  const [selected, setSelected] = useState<Assistant | null>(null)

  const filtered = useMemo(() =>
    assistants.filter(a =>
      a.name.includes(search) &&
      (!storeFilter || a.storeId === storeFilter)
    ), [search, storeFilter])

  const uniqueStores = useMemo(() =>
    [...new Map(assistants.map(a => [a.storeId, a.storeName])).entries()],
    [])

  return (
    <div className="min-h-screen bg-surface-primary p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-500">人员画像</h1>
          <p className="text-sm text-navy-200 mt-1">医助能力标签与培训建议</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-200" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="搜索医助姓名"
              className="pl-9 pr-4 py-2 rounded-lg border border-navy-50 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ice-400 w-56"
            />
          </div>
          <select
            value={storeFilter} onChange={e => setStoreFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-navy-50 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ice-400"
          >
            <option value="">全部门店</option>
            {uniqueStores.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {filtered.map(a => (
          <div
            key={a.id}
            onClick={() => setSelected(a)}
            className="bg-white rounded-xl shadow-sm p-5 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${avatarColor(a.overallScore)}`}>
                {a.name.slice(-2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy-500">{a.name}</span>
                  <span className={`font-mono text-2xl font-bold ${scoreColor(a.overallScore)}`}>
                    {a.overallScore}
                  </span>
                </div>
                <span className="text-xs text-navy-200">{a.storeName}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {a.proficiencyProjects.map(p => (
                <span key={p} className="bg-ice-50 text-ice-600 rounded px-2 py-0.5 text-xs">{p}</span>
              ))}
              {a.anomalyProneLinks.map(l => (
                <span key={l} className="bg-amber-50 text-amber-600 rounded px-2 py-0.5 text-xs flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {l}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${avatarColor(selected.overallScore)}`}>
                {selected.name.slice(-2)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-navy-500">{selected.name}</h2>
                <p className="text-xs text-navy-200">{selected.storeName} · 综合评分 <span className={`font-mono font-bold ${scoreColor(selected.overallScore)}`}>{selected.overallScore}</span></p>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-surface-hover text-navy-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-5 gap-6 mb-6">
            <div className="col-span-2">
              <h3 className="text-sm font-semibold text-navy-400 mb-3 flex items-center gap-1.5">
                <User className="w-4 h-4" />能力雷达
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={selected.capabilityTags}>
                  <PolarGrid stroke="#E8EBF0" />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: '#8E9BB7' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: '#C5CBD9' }} />
                  <Radar dataKey="score" stroke="#4A9EFF" fill="#4A9EFF" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="col-span-3 flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-semibold text-navy-400 mb-2">熟练项目</h3>
                <div className="flex flex-wrap gap-1.5">
                  {selected.proficiencyProjects.map(p => (
                    <span key={p} className="bg-emerald-50 text-emerald-600 rounded px-2 py-1 text-xs font-medium">{p}</span>
                  ))}
                  {selected.proficiencyProjects.length === 0 && (
                    <span className="text-xs text-navy-200">暂无</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-navy-400 mb-2">异常高发环节</h3>
                <div className="flex flex-wrap gap-1.5">
                  {selected.anomalyProneLinks.map(l => (
                    <span key={l} className="bg-amber-50 text-amber-600 rounded px-2 py-1 text-xs font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{l}
                    </span>
                  ))}
                  {selected.anomalyProneLinks.length === 0 && (
                    <span className="text-xs text-navy-200">暂无异常</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-navy-400 mb-2 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" />培训建议
                </h3>
                <div className="space-y-2">
                  {selected.trainingSuggestions.map((s, i) => (
                    <div key={i} className="border border-navy-50 rounded-lg px-3 py-2 text-xs text-navy-300 bg-surface-primary">
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-navy-400 mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />月度评分趋势
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={selected.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EBF0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8E9BB7' }} tickFormatter={v => v.slice(5)} />
                <YAxis domain={[40, 100]} tick={{ fontSize: 10, fill: '#C5CBD9' }} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E8EBF0' }}
                  formatter={(v: number) => [`${v} 分`, '评分']}
                  labelFormatter={l => `${l}`}
                />
                <Line type="monotone" dataKey="score" stroke="#4A9EFF" strokeWidth={2} dot={{ r: 3, fill: '#4A9EFF' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
