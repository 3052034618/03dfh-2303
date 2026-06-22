import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { stores } from '@/data/stores'
import { assistants } from '@/data/assistants'
import type { Anomaly as AnomalyType } from '@/types'
import {
  Clock, Loader, CheckCircle2, AlertTriangle, Eye, X, FileText, Plus, Upload, Send, Check, XCircle } from 'lucide-react'

type StatusFilter = 'all' | 'pending' | 'processing' | 'closed'

const statusConfig = {
  pending: { label: '待处理', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-l-amber-400', icon: Clock },
  processing: { label: '处理中', bg: 'bg-ice-50', text: 'text-ice-600', border: 'border-l-ice-400', icon: Loader },
  closed: { label: '已闭环', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-l-emerald-400', icon: CheckCircle2 },
} as const

const taskStatusMap: Record<string, { label: string; color: string; bgLight: string }> = {
  pending: { label: '待上传', color: 'text-amber-600', bgLight: 'bg-amber-50' },
  uploaded: { label: '已上传', color: 'text-ice-600', bgLight: 'bg-ice-50' },
  approved: { label: '已通过', color: 'text-emerald-600', bgLight: 'bg-emerald-50' },
  rejected: { label: '已驳回', color: 'text-red-600', bgLight: 'bg-red-50' },
}

export default function Anomaly() {
  const anomalies = useAppStore((s) => s.anomalies)
  const addAnomaly = useAppStore((s) => s.addAnomaly)
  const submitRectification = useAppStore((s) => s.submitRectification)
  const approveRectification = useAppStore((s) => s.approveRectification)
  const rejectRectification = useAppStore((s) => s.rejectRectification)

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyType | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showNewModal, setShowNewModal] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  const [newForm, setNewForm] = useState({
    title: '',
    storeId: '',
    projectName: '注射类',
    description: '',
    deadline: '',
    assignee: '',
  })

  const [submitNote, setSubmitNote] = useState('')
  const [reviewNote, setReviewNote] = useState('')

  const filtered = useMemo(
    () => (statusFilter === 'all' ? anomalies : anomalies.filter((a) => a.status === statusFilter)),
    [statusFilter, anomalies],
  )

  const counts = useMemo(
    () => ({
      pending: anomalies.filter((a) => a.status === 'pending').length,
      processing: anomalies.filter((a) => a.status === 'processing').length,
      closed: anomalies.filter((a) => a.status === 'closed').length,
    }),
    [anomalies],
  )

  const summaryCards = [
    { key: 'pending' as const, count: counts.pending, ...statusConfig.pending },
    { key: 'processing' as const, count: counts.processing, ...statusConfig.processing },
    { key: 'closed' as const, count: counts.closed, ...statusConfig.closed },
  ]

  const tabs: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'pending', label: '待处理' },
    { value: 'processing', label: '处理中' },
    { value: 'closed', label: '已闭环' },
  ]

  const openDetail = (a: AnomalyType) => {
    setSelectedAnomaly(a)
    setShowDetail(true)
  }

  const currentAnomaly = selectedAnomaly
    ? anomalies.find((a) => a.id === selectedAnomaly.id) || selectedAnomaly
    : null

  const handleCreate = () => {
    if (!newForm.title || !newForm.storeId || !newForm.deadline) return
    const store = stores.find((s) => s.id === newForm.storeId)
    if (!store) return
    addAnomaly({
      title: newForm.title,
      storeId: newForm.storeId,
      storeName: store.name,
      projectName: newForm.projectName,
      deadline: newForm.deadline,
      description: newForm.description,
      status: 'pending',
      assignee: newForm.assignee || undefined,
    })
    setShowNewModal(false)
    setNewForm({ title: '', storeId: '', projectName: '注射类', description: '', deadline: '', assignee: '' })
  }

  const handleSubmit = () => {
    if (!currentAnomaly || !activeTaskId || !submitNote) return
    submitRectification(currentAnomaly.id, activeTaskId, submitNote, [
      { name: '复盘说明.pdf', type: 'pdf', url: '#' },
    ])
    setShowSubmitModal(false)
    setSubmitNote('')
    setActiveTaskId(null)
  }

  const handleApprove = () => {
    if (!currentAnomaly || !activeTaskId) return
    approveRectification(currentAnomaly.id, activeTaskId, reviewNote || '整改到位，同意闭环')
    setShowSubmitModal(false)
    setReviewNote('')
    setActiveTaskId(null)
  }

  const handleReject = () => {
    if (!currentAnomaly || !activeTaskId) return
    rejectRectification(currentAnomaly.id, activeTaskId, reviewNote || '整改不充分，请重新提交')
    setShowSubmitModal(false)
    setReviewNote('')
    setActiveTaskId(null)
  }

  const openSubmit = (taskId: string) => {
    setActiveTaskId(taskId)
    setShowSubmitModal(true)
    setSubmitNote('')
    setReviewNote('')
  }

  const openReview = (taskId: string) => {
    setActiveTaskId(taskId)
    setShowSubmitModal(true)
    setReviewNote('')
    setSubmitNote('')
  }

  const selectedStore = stores.find((s) => s.id === newForm.storeId)
  const storeAssistants = selectedStore
    ? assistants.filter((a) => a.storeId === selectedStore.id)
    : []

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-500">异常闭环</h1>
          <p className="text-navy-200 text-sm mt-1">问题发现、整改派发与闭环追踪</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-ice-400 text-white text-sm font-medium rounded-6 hover:bg-ice-500 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> 新建整改任务
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {summaryCards.map((card) => (
          <div
            key={card.key}
            className={`bg-white rounded-lg shadow-sm border-l-4 ${card.border} p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer`}
            onClick={() => setStatusFilter(card.key)}
          >
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

      {/* 详情弹窗 */}
      {showDetail && currentAnomaly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/50 backdrop-blur-sm" onClick={() => setShowDetail(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-navy-500">{currentAnomaly.title}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig[currentAnomaly.status].bg} ${statusConfig[currentAnomaly.status].text}`}>
                  {statusConfig[currentAnomaly.status].label}
                </span>
              </div>
              <button onClick={() => setShowDetail(false)} className="text-navy-200 hover:text-navy-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <p className="text-sm text-navy-300 whitespace-pre-line">{currentAnomaly.description}</p>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-navy-200">门店：</span><span className="text-navy-500 font-medium">{currentAnomaly.storeName}</span></div>
                <div><span className="text-navy-200">项目：</span><span className="text-navy-500 font-medium">{currentAnomaly.projectName}</span></div>
                <div><span className="text-navy-200">创建：</span><span className="text-navy-500 font-mono">{currentAnomaly.createdAt}</span></div>
                <div><span className="text-navy-200">截止：</span><span className="text-navy-500 font-mono">{currentAnomaly.deadline}</span></div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-navy-500 mb-3">整改任务</h3>
                <div className="space-y-3">
                  {currentAnomaly.rectificationTasks.map((task) => {
                    const ts = taskStatusMap[task.status]
                    const canReview = task.status === 'uploaded' || task.status === 'rejected'
                    const canSubmit = task.status === 'pending' || task.status === 'rejected'
                    return (
                      <div key={task.id} className={`border rounded-lg p-4 ${ts.bgLight}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-navy-500">负责人：{task.assignee}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${ts.color} bg-white border`}>
                              {ts.label}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {canSubmit && (
                              <button
                                onClick={() => openSubmit(task.id)}
                                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-ice-400 text-white hover:bg-ice-500 transition-colors"
                              >
                                <Upload className="w-3 h-3" /> 提交
                              </button>
                            )}
                            {canReview && (
                              <button
                                onClick={() => openReview(task.id)}
                                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-amber-400 text-white hover:bg-amber-500 transition-colors"
                              >
                                审批
                              </button>
                            )}
                            {task.status === 'approved' && (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                                <Check className="w-3 h-3" /> 已通过
                              </span>
                            )}
                          </div>
                        </div>
                        {task.uploadedAt && <p className="text-xs text-navy-200 mb-1">上传时间：{task.uploadedAt}</p>}
                        {task.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {task.attachments.map((att, j) => (
                              <span key={j} className="inline-flex items-center gap-1 text-xs bg-white text-ice-600 px-2 py-0.5 rounded border border-ice-100">
                                <FileText className="w-3 h-3" />{att.name}
                              </span>
                            ))}
                          </div>
                        )}
                        {task.reviewNote && (
                          <p className="text-xs text-navy-300 bg-white px-2 py-1 rounded border border-gray-100">
                            {task.status === 'approved' ? '审批意见' : '说明'}：{task.reviewNote}
                          </p>
                        )}
                      </div>
                    )
                  })}
                  {currentAnomaly.rectificationTasks.length === 0 && (
                    <p className="text-sm text-navy-200 text-center py-6">暂无整改任务</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowDetail(false)}
                className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-navy-300 hover:bg-gray-200 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新建整改任务弹窗 */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/50 backdrop-blur-sm" onClick={() => setShowNewModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-navy-500">新建整改任务</h2>
              <button onClick={() => setShowNewModal(false)} className="text-navy-200 hover:text-navy-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-500 mb-1">异常标题</label>
                <input
                  type="text"
                  value={newForm.title}
                  onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                  placeholder="请输入异常标题"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ice-400/50 focus:border-ice-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-500 mb-1">门店</label>
                  <select
                    value={newForm.storeId}
                    onChange={(e) => setNewForm({ ...newForm, storeId: e.target.value, assignee: '' })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ice-400/50 focus:border-ice-400"
                  >
                    <option value="">请选择门店</option>
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-500 mb-1">项目类别</label>
                  <select
                    value={newForm.projectName}
                    onChange={(e) => setNewForm({ ...newForm, projectName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ice-400/50 focus:border-ice-400"
                  >
                    <option value="注射类">注射类</option>
                    <option value="手术类">手术类</option>
                    <option value="光电类">光电类</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-500 mb-1">负责人</label>
                  <select
                    value={newForm.assignee}
                    onChange={(e) => setNewForm({ ...newForm, assignee: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ice-400/50 focus:border-ice-400"
                    disabled={!newForm.storeId}
                  >
                    <option value="">请选择负责人</option>
                    {storeAssistants.map((a) => (
                      <option key={a.id} value={a.name}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-500 mb-1">截止日期</label>
                  <input
                    type="date"
                    value={newForm.deadline}
                    onChange={(e) => setNewForm({ ...newForm, deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ice-400/50 focus:border-ice-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-500 mb-1">问题描述</label>
                <textarea
                  value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  placeholder="请描述问题详情"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ice-400/50 focus:border-ice-400 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-navy-300 hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                disabled={!newForm.title || !newForm.storeId || !newForm.deadline}
                className="inline-flex items-center gap-1 px-4 py-2 text-sm rounded-lg bg-ice-400 text-white hover:bg-ice-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" /> 创建任务
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 提交/审批弹窗 */}
      {showSubmitModal && currentAnomaly && activeTaskId && (() => {
        const task = currentAnomaly.rectificationTasks.find((t) => t.id === activeTaskId)
        if (!task) return null
        const isReview = task.status === 'uploaded' || task.status === 'rejected'
        const isSubmitView = task.status === 'pending' || task.status === 'rejected'
        const showApproveReject = isReview && task.status !== 'pending'

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/50 backdrop-blur-sm" onClick={() => { setShowSubmitModal(false); setActiveTaskId(null) }}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-navy-500">
                  {showApproveReject ? '审批整改' : '提交整改说明'}
                </h2>
                <button onClick={() => { setShowSubmitModal(false); setActiveTaskId(null) }} className="text-navy-200 hover:text-navy-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div className="text-sm text-navy-300">
                  <p>负责人：<span className="text-navy-500 font-medium">{task.assignee}</span></p>
                  <p className="mt-1">异常：<span className="text-navy-500 font-medium">{currentAnomaly.title}</span></p>
                </div>

                {isSubmitView && (
                  <div>
                    <label className="block text-sm font-medium text-navy-500 mb-1">复盘说明</label>
                    <textarea
                      value={submitNote}
                      onChange={(e) => setSubmitNote(e.target.value)}
                      placeholder="请输入复盘说明..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ice-400/50 focus:border-ice-400 resize-none"
                    />
                  </div>
                )}

                {showApproveReject && (
                  <div>
                    <label className="block text-sm font-medium text-navy-500 mb-1">审批意见</label>
                    <textarea
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      placeholder="请输入审批意见..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ice-400/50 focus:border-ice-400 resize-none"
                    />
                  </div>
                )}

                {isSubmitView && (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                    <Upload className="w-6 h-6 text-navy-200 mx-auto mb-1" />
                    <p className="text-xs text-navy-200">点击或拖拽上传附件</p>
                    <p className="text-xs text-navy-100 mt-1">支持 PDF / Word / 图片</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
                <button
                  onClick={() => { setShowSubmitModal(false); setActiveTaskId(null) }}
                  className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-navy-300 hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                {isSubmitView && (
                  <button
                    onClick={handleSubmit}
                    disabled={!submitNote}
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm rounded-lg bg-ice-400 text-white hover:bg-ice-500 transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" /> 提交
                  </button>
                )}
                {showApproveReject && (
                  <>
                    <button
                      onClick={handleReject}
                      className="inline-flex items-center gap-1 px-4 py-2 text-sm rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <XCircle className="w-4 h-4" /> 驳回
                    </button>
                    <button
                      onClick={handleApprove}
                      className="inline-flex items-center gap-1 px-4 py-2 text-sm rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                    >
                      <Check className="w-4 h-4" /> 通过
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
