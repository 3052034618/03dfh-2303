import { useState } from 'react'
import { anomalies } from '@/data/anomalies'
import type { Anomaly } from '@/types'
import { Clock, Loader, CheckCircle2, AlertTriangle, Eye, X, FileText, Upload } from 'lucide-react'

type StatusFilter = 'all' | 'pending' | 'processing' | 'closed'

const statusConfig = {
  pending: { label: '待处理', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-l-amber-400', icon: Clock },
  processing: { label: '处理中', bg: 'bg-ice-50', text: 'text-ice-600', border: 'border-l-ice-400', icon: Loader },
  closed: { label: '已闭环', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-l-emerald-400', icon: CheckCircle2 },
} as const

const taskStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待上传', color: 'bg-amber-400' },
  uploaded: { label: '已上传', color: 'bg-ice-400' },
  approved: { label: '已通过', color: 'bg-emerald-400' },
  rejected: { label: '已驳回', color: 'bg-red-400' },
}

function countByStatus(s: Anomaly['status']) {
  return anomalies.filter((a) => a.status === s).length
}

export default function AnomalyClosure() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null)
  const [showModal, setShowModal] = useState(false)

  const filtered = statusFilter === 'all' ? anomalies : anomalies.filter((a) => a.status === statusFilter)

  const openDetail = (a: Anomaly) => {
    setSelectedAnomaly(a)
    setShowModal(true)
  }

  const summaryCards = [
    { key: 'pending' as const, count: countByStatus('pending'), ...statusConfig.pending },
    { key: 'processing' as const, count: countByStatus('processing'), ...statusConfig.processing },
    { key: 'closed' as const, count: countByStatus('closed'), ...statusConfig.closed },
  ]

  const tabs: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'pending', label: '待处理' },
    { value: 'processing', label: '处理中' },
    { value: 'closed', label: '已闭环' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-500">异常闭环</h1>
        <p className="text-navy-200 text-sm mt-1">问题发现、整改派发与闭环追踪</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {summaryCards.map((card) => (
          <div key={card.key} className={`bg-white rounded-lg shadow-sm border-l-4 ${card.border} p-4 flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-lg ${card.bg} ${card.text} flex items-center justify-center`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-mono font-bold text-navy-500">{card.count}</p>
              <p className="text-xs text-navy-200">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex border-b border-gray-100 px-4">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                statusFilter === tab.value
                  ? 'border-ice-400 text-ice-500'
                  : 'border-transparent text-navy-200 hover:text-navy-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-navy-200 text-xs border-b border-gray-50">
                <th className="px-4 py-3 font-medium">异常标题</th>
                <th className="px-4 py-3 font-medium">门店</th>
                <th className="px-4 py-3 font-medium">项目类别</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">创建日期</th>
                <th className="px-4 py-3 font-medium">截止日期</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const sc = statusConfig[a.status]
                return (
                  <tr key={a.id} className="border-b border-gray-50 hover:bg-surface-hover transition-colors">
                    <td className="px-4 py-3 font-medium text-navy-500">{a.title}</td>
                    <td className="px-4 py-3 text-navy-300">{a.storeName}</td>
                    <td className="px-4 py-3 text-navy-300">{a.projectName}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-navy-300 font-mono text-xs">{a.createdAt}</td>
                    <td className="px-4 py-3 text-navy-300 font-mono text-xs">{a.deadline}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => openDetail(a)} className="text-ice-400 hover:underline inline-flex items-center gap-1 text-xs">
                        <Eye className="w-3.5 h-3.5" />查看详情
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selectedAnomaly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-navy-500">{selectedAnomaly.title}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-navy-200 hover:text-navy-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <p className="text-sm text-navy-300">{selectedAnomaly.description}</p>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-navy-200">门店：</span><span className="text-navy-500 font-medium">{selectedAnomaly.storeName}</span></div>
                <div><span className="text-navy-200">项目：</span><span className="text-navy-500 font-medium">{selectedAnomaly.projectName}</span></div>
                <div><span className="text-navy-200">创建：</span><span className="text-navy-500 font-mono">{selectedAnomaly.createdAt}</span></div>
                <div><span className="text-navy-200">截止：</span><span className="text-navy-500 font-mono">{selectedAnomaly.deadline}</span></div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-navy-500 mb-3">整改任务时间线</h3>
                <div className="space-y-0">
                  {selectedAnomaly.rectificationTasks.map((task, i) => {
                    const ts = taskStatusMap[task.status]
                    return (
                      <div key={task.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${ts.color} ring-2 ring-white shadow-sm`} />
                          {i < selectedAnomaly.rectificationTasks.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" />}
                        </div>
                        <div className="pb-4 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-navy-500">{task.assignee}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${ts.color.replace('bg-', 'text-').replace('-400', '-600')} bg-gray-50`}>{ts.label}</span>
                          </div>
                          {task.uploadedAt && <p className="text-xs text-navy-200 mb-1">上传时间：{task.uploadedAt}</p>}
                          {task.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-1">
                              {task.attachments.map((att, j) => (
                                <span key={j} className="inline-flex items-center gap-1 text-xs bg-ice-50 text-ice-600 px-2 py-0.5 rounded">
                                  <FileText className="w-3 h-3" />{att.name}
                                </span>
                              ))}
                            </div>
                          )}
                          {task.reviewNote && <p className="text-xs text-navy-300 bg-gray-50 px-2 py-1 rounded">审批意见：{task.reviewNote}</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-navy-300 hover:bg-gray-200 transition-colors">关闭</button>
              <button className="px-4 py-2 text-sm rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">驳回</button>
              <button className="px-4 py-2 text-sm rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">审批通过</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
