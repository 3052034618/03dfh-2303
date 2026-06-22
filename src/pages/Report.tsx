import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import type { MonthlyReport } from '@/types'
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

function MetricCard({ label, value, unit, highlight }: { label: string; value: number | string; unit?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 shadow-sm border ${highlight ? 'bg-gradient-to-br from-ice-50 to-white border-ice-200' : 'bg-white border-gray-100'}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-navy-500 font-mono">
        {value}
        {unit && <span className="text-sm font-normal text-gray-400 ml-0.5">{unit}</span>}
      </p>
    </div>
  )
}

function ReportList({ reports, onSelect, onGenerate }: { reports: MonthlyReport[]; onSelect: (r: MonthlyReport) => void; onGenerate: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-navy-500">报告列表</h2>
        <button
          onClick={onGenerate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-ice-400 text-white text-sm font-medium rounded-6 hover:bg-ice-500 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> 生成本月报告
        </button>
      </div>
      <div className="grid gap-4">
        {reports.map((report) => {
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
                  onClick={() => downloadHtmlReport(report)}
                  className="flex items-center gap-1.5 text-sm text-navy-300 hover:text-navy-500 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  下载 HTML
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function downloadHtmlReport(report: MonthlyReport) {
  const { keyMetrics, anomalySummary, trainingSuggestions, schedulingSuggestions } = report

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>跟台质量月报 - ${report.month}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: "Noto Sans SC", "Microsoft YaHei", sans-serif; background: #F8F9FC; color: #1B2A4A; padding: 40px; }
    .container { max-width: 960px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 48px; box-shadow: 0 4px 12px rgba(27,42,74,0.08); }
    h1 { font-size: 28px; color: #1B2A4A; margin-bottom: 8px; }
    .subtitle { color: #576C95; font-size: 14px; margin-bottom: 32px; }
    .section-title { font-size: 18px; font-weight: 700; color: #1B2A4A; margin: 32px 0 16px; padding-left: 12px; border-left: 4px solid #4A9EFF; }
    .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .metric-card { background: linear-gradient(135deg, #F0F5FF 0%, #EBF4FF 100%); border-radius: 8px; padding: 20px; }
    .metric-label { font-size: 13px; color: #576C95; margin-bottom: 8px; }
    .metric-value { font-size: 28px; font-weight: 700; color: #4A9EFF; font-family: "DM Mono", monospace; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th { background: #F8F9FC; padding: 12px 16px; text-align: left; font-weight: 600; color: #576C95; border-bottom: 2px solid #E2E8F0; }
    td { padding: 12px 16px; border-bottom: 1px solid #F0F0F5; }
    .trend-up { color: #EF4444; }
    .trend-down { color: #22C55E; }
    .trend-flat { color: #94A3B8; }
    .suggestion-list { list-style: none; counter-reset: item; }
    .suggestion-list li { counter-increment: item; padding: 12px 16px 12px 44px; border: 1px solid #E2E8F0; border-radius: 8px; margin-bottom: 8px; position: relative; background: #FAFBFF; }
    .suggestion-list li::before { content: counter(item); position: absolute; left: 12px; top: 12px; width: 24px; height: 24px; background: #4A9EFF; color: #fff; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E2E8F0; text-align: center; color: #94A3B8; font-size: 12px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .badge-draft { background: #FEF3C7; color: #B45309; }
    .badge-published { background: #D1FAE5; color: #065F46; }
  </style>
</head>
<body>
  <div class="container">
    <h1>跟台质量月报</h1>
    <div class="subtitle">
      ${report.month} &middot; 生成时间：${report.generatedAt} &nbsp;
      <span class="badge ${report.status === 'published' ? 'badge-published' : 'badge-draft'}">
        ${report.status === 'published' ? '已发布' : '草稿'}
      </span>
    </div>

    <div class="section-title">关键指标</div>
    <div class="metrics">
      <div class="metric-card">
        <div class="metric-label">跟台完成率</div>
        <div class="metric-value">${keyMetrics.avgCompletionRate}%</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">准点开台率</div>
        <div class="metric-value">${keyMetrics.avgOnTimeRate}%</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">异常总数</div>
        <div class="metric-value">${keyMetrics.totalAnomalies}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">闭环率</div>
        <div class="metric-value">${keyMetrics.closedRate}%</div>
      </div>
    </div>

    <div class="section-title">异常汇总</div>
    <table>
      <thead>
        <tr><th>项目类别</th><th>异常数</th><th>趋势</th></tr>
      </thead>
      <tbody>
        ${anomalySummary.map(item => `
          <tr>
            <td>${item.category}</td>
            <td>${item.count}</td>
            <td class="${item.trend === '↑' ? 'trend-up' : item.trend === '↓' ? 'trend-down' : 'trend-flat'}">
              ${item.trend} ${item.trend === '↑' ? '上升' : item.trend === '↓' ? '下降' : '持平'}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="section-title">培训建议</div>
    <ol class="suggestion-list">
      ${trainingSuggestions.map(s => `<li>${s}</li>`).join('')}
    </ol>

    <div class="section-title">排班优化建议</div>
    <ol class="suggestion-list">
      ${schedulingSuggestions.map(s => `<li>${s}</li>`).join('')}
    </ol>

    <div class="footer">
      跟台质量复盘平台 &middot; 自动生成于 ${report.generatedAt}
    </div>
  </div>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `跟台质量月报_${report.month}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function ReportDetail({ report, onBack }: { report: MonthlyReport; onBack: () => void }) {
  const cfg = statusConfig[report.status]
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-navy-300 hover:text-navy-500 transition-colors">
            <ArrowLeft className="w-4 h-4" /> 返回列表
          </button>
          <h2 className="text-xl font-bold text-navy-500">{report.month} 月报</h2>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => downloadHtmlReport(report)}
            className="flex items-center gap-1.5 text-sm bg-navy-500 text-white px-4 py-2 rounded-6 hover:bg-nav-400 transition-colors"
          >
            <Download className="w-4 h-4" />
            下载 HTML
          </button>
        </div>
      </div>

      <section>
        <h3 className="text-sm font-semibold text-navy-500 mb-3">关键指标</h3>
        <div className="grid grid-cols-4 gap-3">
          <MetricCard label="平均完成率" value={report.keyMetrics.avgCompletionRate} unit="%" highlight />
          <MetricCard label="平均准点率" value={report.keyMetrics.avgOnTimeRate} unit="%" />
          <MetricCard label="异常总数" value={report.keyMetrics.totalAnomalies} />
          <MetricCard label="闭环率" value={report.keyMetrics.closedRate} unit="%" />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-navy-500 mb-3">异常概览</h3>
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
              {report.anomalySummary.map((item) => (
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
        <h3 className="text-sm font-semibold text-navy-500 mb-3">
          <Lightbulb className="w-4 h-4 inline mr-1.5 text-amber-400" />
          培训建议
        </h3>
        <div className="space-y-2">
          {report.trainingSuggestions.map((s, i) => (
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
        <h3 className="text-sm font-semibold text-navy-500 mb-3">
          <Calendar className="w-4 h-4 inline mr-1.5 text-ice-400" />
          排班建议
        </h3>
        <div className="space-y-2">
          {report.schedulingSuggestions.map((s, i) => (
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
        生成时间：{report.generatedAt} &middot; 跟台质量复盘平台
      </div>
    </div>
  )
}

export default function Report() {
  const reports = useAppStore((s) => s.reports)
  const generateMonthlyReport = useAppStore((s) => s.generateMonthlyReport)

  const [selectedReport, setSelectedReport] = useState<MonthlyReport | null>(null)

  const currentMonth = useMemo(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }, [])

  const sortedReports = useMemo(
    () => [...reports].sort((a, b) => (a.month < b.month ? 1 : -1)),
    [reports],
  )

  const handleGenerate = () => {
    const report = generateMonthlyReport(currentMonth)
    setSelectedReport(report)
  }

  const displayReport = selectedReport
    ? reports.find((r) => r.id === selectedReport.id) || selectedReport
    : null

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-500">月报中心</h1>
          <p className="text-sm text-gray-500 mt-1">月度质控报告自动生成与查阅</p>
        </div>
      </div>

      {displayReport ? (
        <ReportDetail report={displayReport} onBack={() => setSelectedReport(null)} />
      ) : (
        <ReportList reports={sortedReports} onSelect={setSelectedReport} onGenerate={handleGenerate} />
      )}
    </div>
  )
}
