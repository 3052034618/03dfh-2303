import { useState, useMemo, useEffect } from 'react'
import { stores } from '@/data/stores'
import type { Store } from '@/types'
import { Target, Clock, AlertCircle, PackageOpen, TrendingUp, TrendingDown, Award, ChevronDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const regions = ['全部区域', '华北区', '华东区', '华南区', '西南区']

const medalColors = ['#F59E0B', '#94A3B8', '#CD7F32']

function valueColor(v: number, inverse = false) {
  const score = inverse ? -v : v
  if (score > 90) return '#22C55E'
  if (score >= 80) return '#4A9EFF'
  return '#F59E0B'
}

function calcChange(current: number, previous: number) {
  if (previous === 0) return 0
  return +((current - previous) / previous * 100).toFixed(1)
}

export default function Overview() {
  const [region, setRegion] = useState('全部区域')
  const [selectedStoreId, setSelectedStoreId] = useState(stores[0].id)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const filtered = useMemo(() =>
    region === '全部区域' ? stores : stores.filter(s => s.region === region),
    [region]
  )

  useEffect(() => {
    if (filtered.length > 0 && !filtered.find(s => s.id === selectedStoreId)) {
      setSelectedStoreId(filtered[0].id)
    }
  }, [filtered, selectedStoreId])

  const sorted = useMemo(() =>
    [...filtered].sort((a, b) => b.totalScore - a.totalScore),
    [filtered]
  )

  const kpis = useMemo(() => {
    const n = filtered.length || 1
    const avgComp = filtered.reduce((s, st) => s + st.completionRate, 0) / n
    const avgOnTime = filtered.reduce((s, st) => s + st.onTimeRate, 0) / n
    const avgOmit = filtered.reduce((s, st) => s + st.preCheckOmissionRate, 0) / n
    const sumTemp = filtered.reduce((s, st) => s + st.tempMaterialCount, 0)

    const prevComp = filtered.reduce((s, st) => s + st.trend[4].completionRate, 0) / n
    const prevOnTime = filtered.reduce((s, st) => s + st.trend[4].onTimeRate, 0) / n

    return [
      { label: '跟台完成率', value: avgComp, change: calcChange(avgComp, prevComp), icon: Target, color: '#4A9EFF', inverse: false },
      { label: '准点开台率', value: avgOnTime, change: calcChange(avgOnTime, prevOnTime), icon: Clock, color: '#4A9EFF', inverse: false },
      { label: '术前核对缺漏率', value: avgOmit, change: -3.2, icon: AlertCircle, color: '#F59E0B', inverse: true },
      { label: '术中补物料次数', value: sumTemp, change: 0, icon: PackageOpen, color: '#4A9EFF', inverse: false, isCount: true },
    ]
  }, [filtered])

  const selectedStore = useMemo(() =>
    stores.find(s => s.id === selectedStoreId) ?? stores[0],
    [selectedStoreId]
  )

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-6 font-['Noto_Sans_SC',sans-serif]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">机构总览</h1>
          <p className="text-sm text-[#576C95] mt-1">全部门店跟台质量数据一览</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm text-[#1B2A4A] shadow-sm hover:border-[#4A9EFF] transition-colors"
          >
            {region} <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-[#E2E8F0] bg-white shadow-lg z-10">
              {regions.map(r => (
                <button
                  key={r}
                  onClick={() => { setRegion(r); setDropdownOpen(false) }}
                  className={`block w-full px-4 py-2 text-left text-sm hover:bg-[#F0F5FF] transition-colors ${region === r ? 'text-[#4A9EFF] font-medium' : 'text-[#1B2A4A]'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map(kpi => (
          <div key={kpi.label} className="rounded-lg bg-white p-5 shadow-sm flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full shrink-0" style={{ backgroundColor: `${kpi.color}18` }}>
              <kpi.icon size={20} style={{ color: kpi.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#576C95] mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-[#1B2A4A] font-['DM_Mono',monospace]">
                {kpi.isCount ? kpi.value : `${kpi.value.toFixed(1)}%`}
              </p>
              {kpi.change !== 0 && (
                <div className={`flex items-center gap-1 text-xs mt-1 ${kpi.inverse ? (kpi.change > 0 ? 'text-red-500' : 'text-green-500') : (kpi.change > 0 ? 'text-green-500' : 'text-red-500')}`}>
                  {kpi.change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(kpi.change)}%
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Ranking Table */}
      <div className="rounded-lg bg-white shadow-sm mb-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F0F0F5]">
          <h2 className="text-base font-semibold text-[#1B2A4A]">门店排名</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F8F9FC] text-[#576C95]">
              <th className="px-5 py-3 text-left font-medium">排名</th>
              <th className="px-5 py-3 text-left font-medium">门店名称</th>
              <th className="px-5 py-3 text-left font-medium">区域</th>
              <th className="px-5 py-3 text-right font-medium">完成率</th>
              <th className="px-5 py-3 text-right font-medium">准点率</th>
              <th className="px-5 py-3 text-right font-medium">核对缺漏率</th>
              <th className="px-5 py-3 text-right font-medium">补物料次数</th>
              <th className="px-5 py-3 text-right font-medium">综合评分</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((store, i) => (
              <tr key={store.id} className="border-t border-[#F0F0F5] hover:bg-[#F0F5FF] transition-colors">
                <td className="px-5 py-3">
                  {i < 3 ? (
                    <Award size={18} style={{ color: medalColors[i] }} className="inline-block" />
                  ) : (
                    <span className="text-[#576C95]">{i + 1}</span>
                  )}
                </td>
                <td className="px-5 py-3 font-medium text-[#1B2A4A]">{store.name}</td>
                <td className="px-5 py-3 text-[#576C95]">{store.region}</td>
                <td className="px-5 py-3 text-right font-['DM_Mono',monospace]" style={{ color: valueColor(store.completionRate) }}>{store.completionRate}%</td>
                <td className="px-5 py-3 text-right font-['DM_Mono',monospace]" style={{ color: valueColor(store.onTimeRate) }}>{store.onTimeRate}%</td>
                <td className="px-5 py-3 text-right font-['DM_Mono',monospace]" style={{ color: valueColor(store.preCheckOmissionRate, true) }}>{store.preCheckOmissionRate}%</td>
                <td className="px-5 py-3 text-right font-['DM_Mono',monospace] text-[#1B2A4A]">{store.tempMaterialCount}</td>
                <td className="px-5 py-3 text-right font-['DM_Mono',monospace] font-semibold" style={{ color: valueColor(store.totalScore) }}>{store.totalScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Trend Chart */}
      <div className="rounded-lg bg-white shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#1B2A4A]">趋势分析</h2>
          <div className="flex gap-2">
            {filtered.map(store => (
              <button
                key={store.id}
                onClick={() => setSelectedStoreId(store.id)}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  selectedStoreId === store.id
                    ? 'bg-[#1B2A4A] text-white'
                    : 'bg-[#F0F5FF] text-[#576C95] hover:bg-[#E0EAFF]'
                }`}
              >
                {store.name}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={selectedStore.trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#576C95' }} />
            <YAxis domain={[60, 100]} tick={{ fontSize: 12, fill: '#576C95' }} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }}
              formatter={(v: number, name: string) => [`${v}%`, name === 'completionRate' ? '完成率' : '准点率']}
            />
            <Legend formatter={(v: string) => v === 'completionRate' ? '跟台完成率' : '准点开台率'} />
            <Line type="monotone" dataKey="completionRate" stroke="#4A9EFF" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="onTimeRate" stroke="#576C95" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
