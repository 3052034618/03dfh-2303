import { useState } from 'react'
import { reports } from '@/data/reports'
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

function MetricCard({ label, value, unit }: { label: string; value: number; unit?: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-navy-500 font-mono">
        {value}
        {unit && <span className="text-sm font-normal text-gray-400 ml-0.5">{unit}</span>}
      </p>
    </div>
  )
}

function ReportList({ onSelect }: { onSelect: (r: MonthlyReport) => void }) {
  return (
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
                <span className="text-lg font-bold text-navy-500">{report.month}</span>
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
                准时率 {report.keyMetrics.avgOnTimeRate}%
              </span>
              <span className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full">
                异常 {report.keyMetrics.totalAnomalies}
              </span>
              <span className="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">
                闭环率 {report.keyMetrics.closedRate}%
              </span>
            </div>
            <button
              onClick={() => onSelect(report)}
              className="flex items-center gap-1.5 text-sm text-ice-400 hover:text-ice-500 font-medium transition-colors"
            >
              <Eye className="w-4 h-4" />
              查看详情
            </button>
          </div>
        )
      })}
    </div>
  )
}

function ReportDetail({ report, onBack }: { report: MonthlyReport; onBack: () => void }) {
  const cfg = statusConfig[report.status]
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-sm text-gray-500 hover:text-navy-500 transition-colors">
            ← 返回列表
          </button>
          <h2 className="text-xl font-bold text-navy-500">{report.month} 月报</h2>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
          </span>
        </div>
        <button className="flex items-center gap-1.5 text-sm bg-navy-500 text-white px-4 py-2 rounded-6 hover:bg-navy-400 transition-colors">
          <Download className="w-4 h-4" />
          下载报告
        </button>
      </div>

      <section>
        <h3 className="text-sm font-semibold text-navy-500 mb-3">关键指标</h3>
        <div className="grid grid-cols-4 gap-3">
          <MetricCard label="平均完成率" value={report.keyMetrics.avgCompletionRate} unit="%" />
          <MetricCard label="平均准时率" value={report.keyMetrics.avgOnTimeRate} unit="%" />
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
    </div>
  )
}

export default function Report() {
  const [selectedReport, setSelectedReport] = useState<MonthlyReport | null>(null)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-500">月报中心</h1>
          <p className="text-sm text-gray-500 mt-1">月度质控报告自动生成与查阅</p>
        </div>
        <button className="bg-ice-400 text-white rounded-6 px-4 py-2 text-sm font-medium hover:bg-ice-500 transition-colors">
          生成本月报告
        </button>
      </div>

      {selectedReport ? (
        <ReportDetail report={selectedReport} onBack={() => setSelectedReport(null)} />
      ) : (
        <ReportList onSelect={setSelectedReport} />
      )}
    </div>
  )
}
