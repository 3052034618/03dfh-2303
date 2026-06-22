import { useState, useMemo, useRef, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { stores } from '@/data/stores'
import { assistants } from '@/data/assistants'
import type { Anomaly as AnomalyType, Attachment, TaskStatus } from '@/types'
import {
  Clock, Loader, CheckCircle2, AlertTriangle, Eye, X, FileText, Plus, Upload, Send, Check, XCircle,
  History, AlertOctagon, Bell, ChevronRight, Paperclip, User, Calendar, ArrowLeft,
  Users, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react'

type StatusFilter = 'all' | 'pending' | 'processing' | 'closed' | 'urgent' | 'overdue'
type GroupBy = 'none' | 'assignee' | 'days'

const statusConfig = {
  pending: { label: '待处理', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-l-amber-400', icon: Clock },
  processing: { label: '处理中', bg: 'bg-ice-50', text: 'text-ice-600', border: 'border-l-ice-400', icon: Loader },
  closed: { label: '已闭环', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-l-emerald-400', icon: CheckCircle2 },
} as const

const urgencyConfig = {
  normal: { label: '正常', bg: 'bg-gray-50', text: 'text-gray-500' },
  soon: { label: '即将到期', bg: 'bg-amber-50', text: 'text-amber-600' },
  overdue: { label: '已逾期', bg: 'bg-red-50', text: 'text-red-600' },
} as const

const taskStatusMap: Record<string, { label: string; color: string; bgLight: string; dot: string }> = {
  pending: { label: '待提交', color: 'text-amber-600', bgLight: 'bg-amber-50', dot: 'bg-amber-400' },
  uploaded: { label: '已提交', color: 'text-ice-600', bgLight: 'bg-ice-50', dot: 'bg-ice-400' },
  approved: { label: '已通过', color: 'text-emerald-600', bgLight: 'bg-emerald-50', dot: 'bg-emerald-400' },
  rejected: { label: '已驳回', color: 'text-red-600', bgLight: 'bg-red-50', dot: 'bg-red-400' },
}

const historyStatusLabel: Record<TaskStatus, string> = {
  pending: '任务派发',
  uploaded: '提交整改',
  approved: '审批通过',
  rejected: '审批驳回',
}

const getDaysRemaining = (deadline: string): number => {
  const today = new Date(new Date().toISOString().slice(0, 10))
  const dl = new Date(deadline)
  return Math.ceil((dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

const getDaysGroup = (days: number): string => {
  if (days < 0) return '已逾期'
  if (days === 0) return '今日到期'
  if (days <= 1) return '1天内到期'
  if (days <= 3) return '2-3天内到期'
  if (days <= 7) return '4-7天内到期'
  return '7天以上'
}

const daysGroupOrder = ['已逾期', '今日到期', '1天内到期', '2-3天内到期', '4-7天内到期', '7天以上']

export default function Anomaly() {
  const { id: paramId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const fromSpotCheck = searchParams.get('from') === 'spotcheck'

  const anomalies = useAppStore((s) => s.anomalies)
  const addAnomaly = useAppStore((s) => s.addAnomaly)
  const submitRectification = useAppStore((s) => s.submitRectification)
  const approveRectification = useAppStore((s) => s.approveRectification)
  const rejectRectification = useAppStore((s) => s.rejectRectification)

  const [statusFilter, setStatusFilter] = useState<StatusFilter>(fromSpotCheck ? 'all' : 'all')
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyType | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showNewModal, setShowNewModal] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [detailTab, setDetailTab] = useState<'tasks' | 'timeline'>('tasks')
  const [groupBy, setGroupBy] = useState<GroupBy>('none')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

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
  const [submitFiles, setSubmitFiles] = useState<Attachment[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (paramId) {
      const anomaly = anomalies.find((a) => a.id === paramId)
      if (anomaly) {
        setSelectedAnomaly(anomaly)
        setShowDetail(true)
        setDetailTab('tasks')
      }
    }
  }, [paramId, anomalies])

  const handleBack = () => {
    if (fromSpotCheck) {
      navigate('/spotcheck')
    } else {
      setShowDetail(false)
      setSelectedAnomaly(null)
      navigate('/anomaly')
    }
  }

  const filtered = useMemo(() => {
    let list = anomalies
    if (statusFilter === 'all') list = anomalies
    else if (statusFilter === 'urgent') list = anomalies.filter(a => a.urgency === 'soon' || a.urgency === 'overdue')
    else if (statusFilter === 'overdue') list = anomalies.filter(a => a.urgency === 'overdue')
    else list = anomalies.filter((a) => a.status === statusFilter)
    return [...list].sort((a, b) => {
      const da = getDaysRemaining(a.deadline)
      const db = getDaysRemaining(b.deadline)
      return da - db
    })
  }, [statusFilter, anomalies])

  const groupedData = useMemo(() => {
    if (groupBy === 'none' || statusFilter !== 'urgent') {
      return [{ key: 'all', label: '', items: filtered }]
    }
    const groups: Record<string, AnomalyType[]> = {}
    filtered.forEach(a => {
      let key: string
      if (groupBy === 'assignee') {
        const task = a.rectificationTasks[0]
        key = task?.assignee || '未分配'
      } else {
        key = getDaysGroup(getDaysRemaining(a.deadline))
      }
      if (!groups[key]) groups[key] = []
      groups[key].push(a)
    })
    const keys = groupBy === 'days'
      ? daysGroupOrder.filter(k => groups[k])
      : Object.keys(groups).sort()
    return keys.map(k => ({ key: k, label: k, items: groups[k] }))
  }, [filtered, groupBy, statusFilter])

  const counts = useMemo(
    () => ({
      pending: anomalies.filter((a) => a.status === 'pending').length,
      processing: anomalies.filter((a) => a.status === 'processing').length,
      closed: anomalies.filter((a) => a.status === 'closed').length,
      urgent: anomalies.filter(a => a.urgency === 'soon' || a.urgency === 'overdue').length,
      overdue: anomalies.filter(a => a.urgency === 'overdue').length,
    }),
    [anomalies],
  )

  const tabs: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'pending', label: '待处理' },
    { value: 'processing', label: '处理中' },
    { value: 'closed', label: '已闭环' },
    { value: 'urgent', label: '催办视图' },
  ]

  const openDetail = (a: AnomalyType) => {
    setSelectedAnomaly(a)
    setShowDetail(true)
    setDetailTab('tasks')
    navigate(`/anomaly/${a.id}`)
  }

  const currentAnomaly = selectedAnomaly
    ? anomalies.find((a) => a.id === selectedAnomaly.id) || selectedAnomaly
    : null

  const canCreate = newForm.title && newForm.storeId && newForm.deadline && newForm.assignee

  const handleCreate = () => {
    if (!canCreate) return
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
      assignee: newForm.assignee,
    })
    setShowNewModal(false)
    setNewForm({ title: '', storeId: '', projectName: '注射类', description: '', deadline: '', assignee: '' })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const newAtts: Attachment[] = Array.from(files).map(f => ({
      name: f.name,
      type: f.type || 'file',
      url: URL.createObjectURL(f),
    }))
    setSubmitFiles(prev => [...prev, ...newAtts])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = (idx: number) => {
    setSubmitFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = () => {
    if (!currentAnomaly || !activeTaskId || !submitNote) return
    submitRectification(currentAnomaly.id, activeTaskId, submitNote, submitFiles)
    setShowSubmitModal(false)
    setSubmitNote('')
    setSubmitFiles([])
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
    setSubmitFiles([])
    setReviewNote('')
  }

  const openReview = (taskId: string) => {
    setActiveTaskId(taskId)
    setShowSubmitModal(true)
    setReviewNote('')
    setSubmitNote('')
    setSubmitFiles([])
  }

  const selectedStore = stores.find((s) => s.id === newForm.storeId)
  const storeAssistants = selectedStore
    ? assistants.filter((a) => a.storeId === selectedStore.id)
    : []

  const allHistory = useMemo(() => {
    if (!currentAnomaly) return []
    const items = currentAnomaly.rectificationTasks.flatMap(t =>
      t.history.map(h => ({ ...h, taskId: t.id, assignee: t.assignee }))
    )
    return items.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  }, [currentAnomaly])

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleAllGroups = () => {
    if (expandedGroups.size === groupedData.length) {
      setExpandedGroups(new Set())
    } else {
      setExpandedGroups(new Set(groupedData.map(g => g.key)))
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            {fromSpotCheck && showDetail && (
              <button onClick={handleBack} className="text-navy-300 hover:text-navy-500">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-2xl font-bold text-navy-500">异常闭环</h1>
          </div>
          <p className="text-navy-200 text-sm mt-1 ml-8">问题发现、整改派发与闭环追踪</p>
        </div>
        {!showDetail && (
          <button
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-ice-400 text-white text-sm font-medium rounded-6 hover:bg-ice-500 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> 新建整改任务
          </button>
        )}
      </div>

      {!showDetail && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <div
              className={`bg-white rounded-lg shadow-sm border-l-4 ${statusConfig.pending.border} p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer`}
              onClick={() => setStatusFilter('pending')}
            >
              <div className={`w-10 h-10 rounded-lg ${statusConfig.pending.bg} ${statusConfig.pending.text} flex items-center justify-center`}>
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-navy-500">{counts.pending}</p>
                <p className="text-xs text-navy-200">待处理</p>
              </div>
            </div>
            <div
              className={`bg-white rounded-lg shadow-sm border-l-4 ${statusConfig.processing.border} p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer`}
              onClick={() => setStatusFilter('processing')}
            >
              <div className={`w-10 h-10 rounded-lg ${statusConfig.processing.bg} ${statusConfig.processing.text} flex items-center justify-center`}>
                <Loader className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-navy-500">{counts.processing}</p>
                <p className="text-xs text-navy-200">处理中</p>
              </div>
            </div>
            <div
              className={`bg-white rounded-lg shadow-sm border-l-4 ${statusConfig.closed.border} p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer`}
              onClick={() => setStatusFilter('closed')}
            >
              <div className={`w-10 h-10 rounded-lg ${statusConfig.closed.bg} ${statusConfig.closed.text} flex items-center justify-center`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-navy-500">{counts.closed}</p>
                <p className="text-xs text-navy-200">已闭环</p>
              </div>
            </div>
            <div
              className="bg-white rounded-lg shadow-sm border-l-4 border-l-red-400 p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setStatusFilter('urgent')}
            >
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-mono font-bold text-navy-500">{counts.urgent}</p>
                <p className="text-xs text-navy-200">需关注（含逾期 {counts.overdue}）</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex border-b border-gray-100 px-4 items-center justify-between">
              <div className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => { setStatusFilter(tab.value); setExpandedGroups(new Set()) }}
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
              {statusFilter === 'urgent' && (
                <div className="flex items-center gap-2 px-4">
                  <span className="text-xs text-navy-200">分组：</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setGroupBy('none')}
                      className={`text-xs px-2.5 py-1 rounded transition-colors ${
                        groupBy === 'none' ? 'bg-ice-100 text-ice-600' : 'bg-gray-100 text-navy-300 hover:bg-gray-200'
                      }`}
                    >
                      无
                    </button>
                    <button
                      onClick={() => setGroupBy('assignee')}
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded transition-colors ${
                        groupBy === 'assignee' ? 'bg-ice-100 text-ice-600' : 'bg-gray-100 text-navy-300 hover:bg-gray-200'
                      }`}
                    >
                      <Users className="w-3 h-3" /> 按负责人
                    </button>
                    <button
                      onClick={() => setGroupBy('days')}
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded transition-colors ${
                        groupBy === 'days' ? 'bg-ice-100 text-ice-600' : 'bg-gray-100 text-navy-300 hover:bg-gray-200'
                      }`}
                    >
                      <CalendarDays className="w-3 h-3" /> 按剩余天数
                    </button>
                  </div>
                  {groupBy !== 'none' && (
                    <button onClick={toggleAllGroups} className="text-xs text-ice-500 hover:text-ice-600">
                      {expandedGroups.size === groupedData.length ? '全部收起' : '全部展开'}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              {groupBy !== 'none' && statusFilter === 'urgent' ? (
                <div className="p-4 space-y-4">
                  {groupedData.map((group) => {
                    const isExpanded = expandedGroups.has(group.key)
                    const overdueCount = group.items.filter(a => a.urgency === 'overdue').length
                    const soonCount = group.items.filter(a => a.urgency === 'soon').length
                    return (
                      <div key={group.key} className="border border-gray-100 rounded-lg overflow-hidden">
                        <div
                          onClick={() => toggleGroup(group.key)}
                          className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {groupBy === 'assignee' ? (
                              <div className="w-8 h-8 rounded-full bg-ice-100 text-ice-600 flex items-center justify-center">
                                <User className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                                <Clock className="w-4 h-4" />
                              </div>
                            )}
                            <span className="font-medium text-navy-500">{group.label}</span>
                            <span className="text-xs text-navy-200">共 {group.items.length} 项</span>
                            {overdueCount > 0 && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-600">
                                逾期 {overdueCount}
                              </span>
                            )}
                            {soonCount > 0 && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-600">
                                即将到期 {soonCount}
                              </span>
                            )}
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-navy-300" /> : <ChevronDown className="w-4 h-4 text-navy-300" />}
                        </div>
                        {isExpanded && (
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-navy-200 text-xs border-b border-gray-50 bg-gray-50/50">
                                <th className="px-4 py-2 font-medium">异常标题</th>
                                <th className="px-4 py-2 font-medium">门店</th>
                                <th className="px-4 py-2 font-medium">项目类别</th>
                                <th className="px-4 py-2 font-medium">状态</th>
                                <th className="px-4 py-2 font-medium">截止日期</th>
                                <th className="px-4 py-2 font-medium">剩余天数</th>
                                <th className="px-4 py-2 font-medium">操作</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.items.map((a) => {
                                const sc = statusConfig[a.status]
                                const uc = urgencyConfig[a.urgency || 'normal']
                                const days = getDaysRemaining(a.deadline)
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
                                    <td className="px-4 py-3 text-navy-300 font-mono text-xs">{a.deadline}</td>
                                    <td className="px-4 py-3">
                                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${uc.bg} ${uc.text}`}>
                                        {days < 0 && <AlertOctagon className="w-3 h-3" />}
                                        {days >= 0 && days <= 3 && <Clock className="w-3 h-3" />}
                                        {days < 0 ? `逾期 ${Math.abs(days)} 天` : days === 0 ? '今日到期' : `${days} 天`}
                                      </span>
                                    </td>
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
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-navy-200 text-xs border-b border-gray-50">
                      <th className="px-4 py-3 font-medium">异常标题</th>
                      <th className="px-4 py-3 font-medium">门店</th>
                      <th className="px-4 py-3 font-medium">项目类别</th>
                      <th className="px-4 py-3 font-medium">状态</th>
                      <th className="px-4 py-3 font-medium">截止日期</th>
                      <th className="px-4 py-3 font-medium">紧急度</th>
                      <th className="px-4 py-3 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a) => {
                      const sc = statusConfig[a.status]
                      const uc = urgencyConfig[a.urgency || 'normal']
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
                          <td className="px-4 py-3 text-navy-300 font-mono text-xs">{a.deadline}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${uc.bg} ${uc.text}`}>
                              {a.urgency === 'overdue' && <AlertOctagon className="w-3 h-3" />}
                              {a.urgency === 'soon' && <Clock className="w-3 h-3" />}
                              {uc.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => openDetail(a)} className="text-ice-400 hover:underline inline-flex items-center gap-1 text-xs">
                              <Eye className="w-3.5 h-3.5" />查看详情
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-navy-200 text-sm">暂无数据</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {/* 详情弹窗 */}
      {showDetail && currentAnomaly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/50 backdrop-blur-sm" onClick={handleBack}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-navy-500">{currentAnomaly.title}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig[currentAnomaly.status].bg} ${statusConfig[currentAnomaly.status].text}`}>
                  {statusConfig[currentAnomaly.status].label}
                </span>
                {currentAnomaly.urgency && currentAnomaly.urgency !== 'normal' && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${urgencyConfig[currentAnomaly.urgency].bg} ${urgencyConfig[currentAnomaly.urgency].text}`}>
                    {urgencyConfig[currentAnomaly.urgency].label}
                  </span>
                )}
              </div>
              <button onClick={handleBack} className="text-navy-200 hover:text-navy-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-3 border-b border-gray-100 flex gap-4">
              <button
                onClick={() => setDetailTab('tasks')}
                className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                  detailTab === 'tasks' ? 'border-ice-400 text-ice-500' : 'border-transparent text-navy-200 hover:text-navy-400'
                }`}
              >
                整改任务
              </button>
              <button
                onClick={() => setDetailTab('timeline')}
                className={`text-sm font-medium pb-1 border-b-2 transition-colors inline-flex items-center gap-1 ${
                  detailTab === 'timeline' ? 'border-ice-400 text-ice-500' : 'border-transparent text-navy-200 hover:text-navy-400'
                }`}
              >
                <History className="w-3.5 h-3.5" />时间线
              </button>
            </div>

            <div className="px-6 py-4 overflow-y-auto flex-1">
              {detailTab === 'tasks' && (
                <div className="space-y-4">
                  <p className="text-sm text-navy-300 whitespace-pre-line">{currentAnomaly.description}</p>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-navy-200" />
                      <span className="text-navy-200">门店：</span>
                      <span className="text-navy-500 font-medium">{currentAnomaly.storeName}</span>
                    </div>
                    <div><span className="text-navy-200">项目：</span><span className="text-navy-500 font-medium">{currentAnomaly.projectName}</span></div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-navy-200" />
                      <span className="text-navy-200">创建：</span>
                      <span className="text-navy-500 font-mono">{currentAnomaly.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-navy-200" />
                      <span className="text-navy-200">截止：</span>
                      <span className={`font-mono ${currentAnomaly.urgency === 'overdue' ? 'text-red-600 font-medium' : 'text-navy-500'}`}>
                        {currentAnomaly.deadline}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {currentAnomaly.rectificationTasks.map((task) => {
                      const ts = taskStatusMap[task.status]
                      const canReview = task.status === 'uploaded'
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
                              {task.status === 'approved' || task.status === 'rejected' ? '审批意见' : '说明'}：{task.reviewNote}
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
              )}

              {detailTab === 'timeline' && (
                <div className="relative pl-4">
                  <div className="absolute left-[7px] top-1 bottom-1 w-0.5 bg-gray-200"></div>
                  {allHistory.map((h) => {
                    const ts = taskStatusMap[h.status]
                    return (
                      <div key={h.id} className="relative mb-6 last:mb-0">
                        <div className={`absolute -left-4 top-0.5 w-3.5 h-3.5 rounded-full ${ts.dot} border-2 border-white shadow`}></div>
                        <div className="bg-gray-50 rounded-lg p-3 ml-4">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-navy-500">{h.operator}</span>
                              <span className="text-xs text-navy-200">{h.operatorRole}</span>
                            </div>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${ts.color} ${ts.bgLight}`}>
                              {historyStatusLabel[h.status]}
                            </span>
                          </div>
                          <p className="text-xs text-navy-300 mb-1 font-mono">{h.timestamp}</p>
                          <p className="text-sm text-navy-400">{h.note}</p>
                          {h.attachments && h.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {h.attachments.map((att, i) => (
                                <span key={i} className="inline-flex items-center gap-1 text-xs bg-white text-ice-600 px-2 py-0.5 rounded border border-ice-100">
                                  <Paperclip className="w-3 h-3" />{att.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {allHistory.length === 0 && (
                    <p className="text-sm text-navy-200 text-center py-6">暂无操作记录</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={handleBack}
                className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-navy-300 hover:bg-gray-200 transition-colors"
              >
                {fromSpotCheck ? '返回抽查记录' : '关闭'}
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
                <label className="block text-sm font-medium text-navy-500 mb-1">异常标题 <span className="text-red-500">*</span></label>
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
                  <label className="block text-sm font-medium text-navy-500 mb-1">门店 <span className="text-red-500">*</span></label>
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
                  <label className="block text-sm font-medium text-navy-500 mb-1">负责人 <span className="text-red-500">*</span></label>
                  <select
                    value={newForm.assignee}
                    onChange={(e) => setNewForm({ ...newForm, assignee: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ice-400/50 focus:border-ice-400"
                    disabled={!newForm.storeId}
                  >
                    <option value="">{newForm.storeId ? '请选择负责人' : '请先选择门店'}</option>
                    {storeAssistants.map((a) => (
                      <option key={a.id} value={a.name}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-500 mb-1">截止日期 <span className="text-red-500">*</span></label>
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
                disabled={!canCreate}
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
        const isReview = task.status === 'uploaded'
        const isSubmitView = task.status === 'pending' || task.status === 'rejected'

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/50 backdrop-blur-sm" onClick={() => { setShowSubmitModal(false); setActiveTaskId(null) }}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-navy-500">
                  {isReview ? '审批整改' : '提交整改说明'}
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
                    <label className="block text-sm font-medium text-navy-500 mb-1">复盘说明 <span className="text-red-500">*</span></label>
                    <textarea
                      value={submitNote}
                      onChange={(e) => setSubmitNote(e.target.value)}
                      placeholder="请输入复盘说明..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ice-400/50 focus:border-ice-400 resize-none"
                    />
                  </div>
                )}

                {isReview && (
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
                  <div>
                    <label className="block text-sm font-medium text-navy-500 mb-1">附件</label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-ice-400 hover:bg-ice-50/30 transition-colors"
                    >
                      <Upload className="w-6 h-6 text-navy-200 mx-auto mb-1" />
                      <p className="text-xs text-navy-200">点击选择文件上传</p>
                      <p className="text-xs text-navy-100 mt-1">支持 PDF / Word / 图片</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {submitFiles.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {submitFiles.map((f, i) => (
                          <div key={i} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1.5 text-xs">
                            <span className="flex items-center gap-1 text-navy-400">
                              <Paperclip className="w-3 h-3" />{f.name}
                            </span>
                            <button onClick={() => removeFile(i)} className="text-navy-200 hover:text-red-500">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
                {isReview && (
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
