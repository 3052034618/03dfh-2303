import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { stores } from '@/data/stores'
import type { MonthlyReport, ReportScope } from '@/types'
import {
  FileBarChart,
  Download,
  Lightbulb,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  CheckCircle2,
  ArrowLeft,
  Plus,
  FileText,
  Filter,
  RefreshCw,
  ChevronDown,
  Info,
} from 'lucide-react'

const statusConfig = {
  draft: { label: '草稿', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-l-amber-400' },
  published: { label: '已发布', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-l-emerald-400' },
}

const trendIcon = (trend: string) => {
  if (trend === '↑') return <TrendingUp className="w-3.5 h-3.5 text-red-500" />
  if (trend === '↓') return <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
  return <Minus className="w-3.5 h-3.5 text-gray-400" />
}

const regions = ['全部区域', ...Array.from(new Set(stores.map(s => s.region)))]

function DiffBadge({ value, isRate = true, inverse = false }: { value: number; isRate?: boolean; inverse?: boolean }) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-gray-400">
        <Minus className="w-3 h-3" /> 持平
      </span>
    )
  }
  const isGood = inverse ? value < 0 : value > 0
  const isBad = inverse ? value > 0 : value < 0
  const color = isGood ? 'text-emerald-500' : isBad ? 'text-red-500' : 'text-gray-400'
  const icon = value > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
  const display = isRate ? `${Math.abs(value)}%` : `${value > 0 ? '+' : ''}${value}`
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs ${color}`}>
      {icon} {display}
    </span>
  )
}

function MetricCard({ label, value, unit, highlight, diff, diffInverse, isBaseline }: {
  label: string
  value: number | string
  unit?: string
  highlight?: boolean
  diff?: number
  diffInverse?: boolean
  isBaseline?: boolean
}) {
  const isRate = unit === '%'
  return (
    <div className={`rounded-xl p-4 shadow-sm border ${highlight ? 'bg-gradient-to-br from-ice-50 to-white border-ice-200' : 'bg-white border-gray-100'}`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-gray-500">{label}</p>
        {isBaseline && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
            <Info className="w-2.5 h-2.5" /> 基线对比
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-navy-500 font-mono">
        {value}
        {unit && <span className="text-sm font-normal text-gray-400 ml-0.5">{unit}</span>}
      </p>
      {diff !== undefined && (
        <div className="mt-1">
          <DiffBadge value={diff} isRate={isRate} inverse={diffInverse} />
          <span className="text-xs text-gray-400 ml-1">{isBaseline ? '较基线' : '环比'}</span>
          {diff !== 0 && (
            <span className={`text-xs ml-1 ${
              (diffInverse ? diff < 0 : diff > 0) ? 'text-emerald-500' : 'text-red-500'
            }`}>
              {(diffInverse ? diff < 0 : diff > 0) ? '变好' : '变差'}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function getScopeText(scope: ReportScope): string {
  const parts: string[] = []
  if (scope.region) parts.push(scope.region)
  if (scope.storeId) {
    const store = stores.find(s => s.id === scope.storeId)
    if (store) parts.push(store.name)
  }
  if (scope.projectType) {
    const map: Record<string, string> = { injection: '注射类', surgery: '手术类', laser: '光电类' }
    parts.push(map[scope.projectType] || scope.projectType)
  }
  return parts.length > 0 ? parts.join(' / ') : '全部范围'
}

function downloadHtmlReport(report: MonthlyReport, exportFn: (id: string) => string) {
  const html = exportFn(report.id)
  if (!html) return
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `跟台质量月报_${report.month}_${getScopeText(report.scope)}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function ReportList({
  reports,
  onSelect,
  onGenerate,
  onRegenerate,
  scope,
  currentMonth,
}: {
  reports: MonthlyReport[]
  onSelect: (r: MonthlyReport) => void
  onGenerate: () => void
  onRegenerate: () => void
  scope: ReportScope
  currentMonth: string
}) {
  const scopeKey = JSON.stringify(scope)
  const scopeReports = reports.filter(r => JSON.stringify(r.scope) === scopeKey)
  const currentReport = scopeReports.find(r => r.month === currentMonth)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-navy-500">报告列表</h2>
        {currentReport ? (
          <button
            onClick={onRegenerate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-6 hover:bg-emerald-600 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" /> 重新生成本月
          </button>
        ) : (
          <button
            onClick={onGenerate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-ice-400 text-white text-sm font-medium rounded-6 hover:bg-ice-500 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> 生成本月报告
          </button>
        )}
      </div>

      <div className="grid gap-4">
        {scopeReports.map((report) => {
          const cfg = statusConfig[report.status]
          return (
            <div
              key={report.id}
              className={`bg-white rounded-xl shadow-sm border-l-4 ${cfg.border} p-5 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FileBarChart className="w-5 h-5 text-navy-400" />
                  <span className="text-lg font-bold text-navy-500">{report.month} 月报</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.text}`}>
                    {cfg.label}
                  </span>
                  <span className="text-xs text-navy-200 bg-gray-50 px-2 py-0.5 rounded-full">
                    {getScopeText(report.scope)}
                  </span>
                  {report.comparison?.isBaseline && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                      <Info className="w-2.5 h-2.5" /> 基线对比
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">生成于 {report.generatedAt}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">
                  完成率 {report.keyMetrics.avgCompletionRate}%
                </span>
                <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">
                  准点率 {report.keyMetrics.avgOnTimeRate}%
                </span>
                <span className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full">
                  异常 {report.keyMetrics.totalAnomalies}
                </span>
                <span className="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">
                  闭环率 {report.keyMetrics.closedRate}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelect(report)}
                  className="flex items-center gap-1.5 text-sm text-ice-400 hover:text-ice-500 font-medium transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  查看详情
                </button>
                <span className="text-gray-200">|</span>
                <button
                  onClick={() => downloadHtmlReport(report, useAppStore.getState().exportReportAsHtml)}
                  className="flex items-center gap-1.5 text-sm text-navy-300 hover:text-navy-500 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  下载 HTML
                </button>
              </div>
            </div>
          )
        })}
        {scopeReports.length === 0 && (
          <div className="py-12 text-center text-navy-200 bg-white rounded-xl">
            <FileText className="w-10 h-10 mx-auto mb-2 text-gray-200" />
            <p className="text-sm">当前范围暂无报告，点击上方按钮生成本月报告</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ReportDetail({ report, onBack }: { report: MonthlyReport; onBack: () => void }) {
  const liveReports = useAppStore((s) => s.reports)
  const liveReport = liveReports.find(r => r.id === report.id) || report

  const cfg = statusConfig[liveReport.status]
  const cmp = liveReport.comparison

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-navy-300 hover:text-navy-500 transition-colors">
            <ArrowLeft className="w-4 h-4" /> 返回列表
          </button>
          <h2 className="text-xl font-bold text-navy-500">{liveReport.month} 月报</h2>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
          </span>
          <span className="text-xs text-navy-200 bg-gray-50 px-2 py-0.5 rounded-full">
            {getScopeText(liveReport.scope)}
          </span>
          {cmp?.isBaseline && (
            <span className="inline-flex items-center gap-0.5 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              <Info className="w-3 h-3" /> 基于历史趋势基线对比
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => downloadHtmlReport(liveReport, useAppStore.getState().exportReportAsHtml)}
            className="flex items-center gap-1.5 text-sm bg-navy-500 text-white px-4 py-2 rounded-6 hover:bg-navy-400 transition-colors"
          >
            <Download className="w-4 h-4" />
            下载 HTML
          </button>
        </div>
      </div>

      <section>
        <h3 className="text-sm font-semibold text-navy-500 mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-ice-400 rounded-full"></span>
          关键指标
          {cmp && <span className="text-xs font-normal text-navy-200">（{cmp.isBaseline ? '与基线对比' : '与上月对比'}）</span>}
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <MetricCard label="平均完成率" value={liveReport.keyMetrics.avgCompletionRate} unit="%" highlight diff={cmp?.avgCompletionRate} isBaseline={cmp?.isBaseline} />
          <MetricCard label="平均准点率" value={liveReport.keyMetrics.avgOnTimeRate} unit="%" diff={cmp?.avgOnTimeRate} isBaseline={cmp?.isBaseline} />
          <MetricCard label="异常总数" value={liveReport.keyMetrics.totalAnomalies} diff={cmp?.totalAnomalies} diffInverse isBaseline={cmp?.isBaseline} />
          <MetricCard label="闭环率" value={liveReport.keyMetrics.closedRate} unit="%" diff={cmp?.closedRate} isBaseline={cmp?.isBaseline} />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-navy-500 mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-amber-400 rounded-full"></span>
          异常概览
        </h3>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500">
                <th className="text-left px-4 py-2.5 font-medium">异常类别</th>
                <th className="text-center px-4 py-2.5 font-medium">数量</th>
                <th className="text-center px-4 py-2.5 font-medium">趋势</th>
              </tr>
            </thead>
            <tbody>
              {liveReport.anomalySummary.map((item) => (
                <tr key={item.category} className="border-t border-gray-100">
                  <td className="px-4 py-2.5 text-navy-500 font-medium">{item.category}</td>
                  <td className="px-4 py-2.5 text-center font-mono">{item.count}</td>
                  <td className="px-4 py-2.5 flex items-center justify-center gap-1">
                    {trendIcon(item.trend)}
                    <span
                      className={`text-xs ${
                        item.trend === '↑' ? 'text-red-500' : item.trend === '↓' ? 'text-emerald-500' : 'text-gray-400'
                      }`}
                    >
                      {item.trend === '↑' ? '上升' : item.trend === '↓' ? '下降' : '持平'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-navy-500 mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          培训建议
        </h3>
        <div className="space-y-2">
          {liveReport.trainingSuggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-50 text-amber-600 text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <p className="text-sm text-navy-500 leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-navy-500 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-ice-400" />
          排班建议
        </h3>
        <div className="space-y-2">
          {liveReport.schedulingSuggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 text-ice-400 text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <p className="text-sm text-navy-500 leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="pt-4 border-t border-gray-100 text-xs text-navy-200 text-center">
        生成时间：{liveReport.generatedAt} &middot; 跟台质量复盘平台
      </div>
    </div>
  )
}

export default function Report() {
  const { id: paramId } = useParams()
  const navigate = useNavigate()
  const reports = useAppStore((s) => s.reports)
  const generateMonthlyReport = useAppStore((s) => s.generateMonthlyReport)

  const [selectedReport, setSelectedReport] = useState<MonthlyReport | null>(null)
  const [scopeRegion, setScopeRegion] = useState('全部区域')
  const [scopeStore, setScopeStore] = useState('')
  const [scopeProject, setScopeProject] = useState('')

  const currentMonth = useMemo(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }, [])

  useEffect(() => {
    if (paramId) {
      const report = reports.find((r) => r.id === paramId)
      if (report) {
        setSelectedReport(report)
      }
    }
  }, [paramId, reports])

  const scope: ReportScope = useMemo(() => {
    const s: ReportScope = {}
    if (scopeRegion !== '全部区域') s.region = scopeRegion
    if (scopeStore) s.storeId = scopeStore
    if (scopeProject) s.projectType = scopeProject
    return s
  }, [scopeRegion, scopeStore, scopeProject])

  const scopeStores = useMemo(() => {
    if (scopeRegion === '全部区域') return stores
    return stores.filter(s => s.region === scopeRegion)
  }, [scopeRegion])

  const sortedReports = useMemo(
    () => [...reports].sort((a, b) => (a.month < b.month ? 1 : -1)),
    [reports],
  )

  const handleGenerate = () => {
    const report = generateMonthlyReport(currentMonth, scope, false)
    setSelectedReport(report)
    navigate(`/report/${report.id}`)
  }

  const handleRegenerate = () => {
    const report = generateMonthlyReport(currentMonth, scope, true)
    setSelectedReport(report)
  }

  const displayReport = selectedReport
    ? reports.find((r) => r.id === selectedReport.id) || selectedReport
    : null

  const handleSelect = (r: MonthlyReport) => {
    setSelectedReport(r)
    navigate(`/report/${r.id}`)
  }

  const handleBack = () => {
    setSelectedReport(null)
    navigate('/report')
  }

  const handleRegionChange = (val: string) => {
    setScopeRegion(val)
    setScopeStore('')
    setSelectedReport(null)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-500">月报中心</h1>
          <p className="text-sm text-gray-500 mt-1">月度质控报告自动生成与查阅</p>
        </div>
      </div>

      {/* 范围筛选 */}
      {!displayReport && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-navy-200" />
            <span className="text-sm text-navy-300">报告范围：</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-navy-200">区域</label>
            <select
              value={scopeRegion}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ice-400/50"
            >
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-navy-200">门店</label>
            <select
              value={scopeStore}
              onChange={(e) => { setScopeStore(e.target.value); setSelectedReport(null) }}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ice-400/50 min-w-[160px]"
              disabled={scopeStores.length === 0}
            >
              <option value="">全部门店</option>
              {scopeStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-navy-200">项目类别</label>
            <select
              value={scopeProject}
              onChange={(e) => { setScopeProject(e.target.value); setSelectedReport(null) }}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ice-400/50"
            >
              <option value="">全部项目</option>
              <option value="injection">注射类</option>
              <option value="surgery">手术类</option>
              <option value="laser">光电类</option>
            </select>
          </div>
          <div className="ml-auto text-xs text-navy-200">
            当前月份：<span className="text-navy-500 font-medium font-mono">{currentMonth}</span>
          </div>
        </div>
      )}

      {displayReport ? (
        <ReportDetail report={displayReport} onBack={handleBack} />
      ) : (
        <ReportList
          reports={sortedReports}
          onSelect={handleSelect}
          onGenerate={handleGenerate}
          onRegenerate={handleRegenerate}
          scope={scope}
          currentMonth={currentMonth}
        />
      )}
    </div>
  )
}
