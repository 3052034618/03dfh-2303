import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import type { SpotCheck, Anomaly as AnomalyType } from '@/types'
import {
  ClipboardCheck,
  Headphones,
  CheckCircle2,
  XCircle,
  Camera,
  ChevronDown,
  Filter,
  AlertTriangle,
  ArrowRight,
  FileText,
  X,
  AlertOctagon,
  Clock,
  Loader,
  Upload,
  Send,
  Check,
  XCircle as XCircleIcon,
  History,
  Bell,
  Paperclip,
  User,
  CalendarDays,
} from 'lucide-react'

type ResultFilter = '全部' | '合规' | '不合规' | '待关注'

const resultConfig: Record<string, { label: string; bg: string; text: string }> = {
  pass: { label: '合规', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  fail: { label: '不合规', bg: 'bg-red-100', text: 'text-red-600' },
  warning: { label: '待关注', bg: 'bg-amber-100', text: 'text-amber-600' },
}

export default function SpotCheck() {
  const spotchecks = useAppStore((s) => s.spotchecks)
  const anomalies = useAppStore((s) => s.anomalies)
  const createSpotCheckAnomaly = useAppStore((s) => s.createSpotCheckAnomaly)

  const [resultFilter, setResultFilter] = useState<ResultFilter>('全部')
  const [selectedCheck, setSelectedCheck] = useState<string | null>(null)
  const [storeFilter, setStoreFilter] = useState('全部')
  const [justCreatedAnomaly, setJustCreatedAnomaly] = useState<string | null>(null)
  const [viewingAnomalyId, setViewingAnomalyId] = useState<string | null>(null)

  const stores = ['全部', ...Array.from(new Set(spotchecks.map((s) => s.storeName)))]

  const filtered = spotchecks.filter((s) => {
    if (resultFilter !== '全部' && resultConfig[s.result]?.label !== resultFilter) return false
    if (storeFilter !== '全部' && s.storeName !== storeFilter) return false
    return true
  })

  const handleCreateAnomaly = (check: SpotCheck) => {
    if (check.anomalyIds && check.anomalyIds.length > 0) {
      setViewingAnomalyId(check.anomalyIds[0])
      return
    }
    const newAnomaly = createSpotCheckAnomaly(check.id)
    if (newAnomaly) {
      setJustCreatedAnomaly(newAnomaly.id)
      setTimeout(() => setJustCreatedAnomaly(null), 3000)
    }
  }

  const getLinkedAnomaly = (check: SpotCheck): AnomalyType | undefined => {
    if (!check.anomalyIds || check.anomalyIds.length === 0) return undefined
    return anomalies.find(a => a.id === check.anomalyIds![0])
  }

  const resultButtons: ResultFilter[] = ['全部', '合规', '不合规', '待关注']

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-6 font-['Noto_Sans_SC']">
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-8 w-8 text-[#4A9EFF]" />
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">抽查记录</h1>
            <p className="text-sm text-[#1B2A4A]/60">质控抽查证据与结论记录</p>
          </div>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#1B2A4A]/50" />
          <select
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-[#1B2A4A]"
          >
            {stores.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          {resultButtons.map((b) => (
            <button
              key={b}
              onClick={() => setResultFilter(b)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                resultFilter === b
                  ? 'bg-[#4A9EFF] text-white'
                  : 'bg-gray-100 text-[#1B2A4A]/70 hover:bg-gray-200'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
        <span className="ml-auto text-sm text-[#1B2A4A]/50">近30天</span>
      </div>

      <div className="grid gap-4">
        {filtered.map((check) => {
          const cfg = resultConfig[check.result]
          const expanded = selectedCheck === check.id
          return (
            <div
              key={check.id}
              onClick={() => setSelectedCheck(expanded ? null : check.id)}
              className="cursor-pointer rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                    {cfg.label}
                  </span>
                  <span className="font-['DM_Mono'] text-sm text-[#1B2A4A]/60">{check.date}</span>
                  <span className="text-sm font-medium text-[#1B2A4A]">{check.storeName}</span>
                  {check.anomalyIds && check.anomalyIds.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-ice-100 px-2 py-0.5 text-xs font-semibold text-ice-600">
                      <FileText className="w-3 h-3" /> 已关联整改
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-[#1B2A4A]/40 transition ${expanded ? 'rotate-180' : ''}`}
                />
              </div>

              <div className="mt-3 flex gap-6 text-sm text-[#1B2A4A]/70">
                <span>咨询师：{check.assistantName}</span>
                <span>项目：{check.projectName}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {(expanded ? check.photos : check.photos.slice(0, 4)).map((photo, i) => (
                  <div key={i} className="relative overflow-hidden rounded-lg">
                    <img
                      src={photo.url}
                      alt={photo.caption || `证据${i + 1}`}
                      className={`object-cover transition hover:scale-105 ${
                        expanded ? 'h-40 w-40' : 'h-16 w-16'
                      }`}
                    />
                    {!expanded && check.photos.length > 4 && i === 3 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs text-white">
                        +{check.photos.length - 4}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm">
                <Headphones className="h-4 w-4 text-[#4A9EFF]" />
                <span className="text-[#1B2A4A]/70">
                  {expanded ? check.audioSummary : check.audioSummary.slice(0, 40) + '…'}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm">
                {check.signatureConfirmed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-400" />
                )}
                <span className={check.signatureConfirmed ? 'text-emerald-600' : 'text-red-400'}>
                  {check.signatureConfirmed ? '已签名' : '未签名'}
                </span>
                <Camera className="ml-4 h-4 w-4 text-[#1B2A4A]/30" />
                <span className="text-[#1B2A4A]/50">{check.photos.length}张</span>
              </div>

              {expanded && (
                <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-[#1B2A4A]/60 mb-1">备注</p>
                    <p className="text-sm leading-relaxed text-[#1B2A4A]/70">{check.notes}</p>
                  </div>
                  {(check.result === 'fail' || check.result === 'warning') && (
                    <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        {check.anomalyIds && check.anomalyIds.length > 0 ? (
                          <>
                            <FileText className="w-4 h-4 text-ice-500" />
                            <span className="text-sm text-ice-700">
                              已创建整改任务（{getLinkedAnomaly(check)?.status === 'closed' ? '已闭环' : '处理中'}）
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <span className="text-sm text-amber-700">
                              {check.result === 'fail' ? '检查不合规，请发起整改' : '存在待关注问题，建议发起整改'}
                            </span>
                          </>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCreateAnomaly(check) }}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                          check.anomalyIds && check.anomalyIds.length > 0
                            ? 'bg-ice-500 text-white hover:bg-ice-600'
                            : 'bg-amber-500 text-white hover:bg-amber-600'
                        }`}
                      >
                        {check.anomalyIds && check.anomalyIds.length > 0 ? (
                          <>查看整改 <ArrowRight className="w-3 h-3" /></>
                        ) : (
                          <>发起整改 <ArrowRight className="w-3 h-3" /></>
                        )}
                      </button>
                    </div>
                  )}
                  {justCreatedAnomaly && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-700 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      整改任务已创建，可在异常闭环模块查看
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-[#1B2A4A]/40">暂无匹配的抽查记录</div>
        )}
      </div>

      {/* 关联异常详情弹窗 */}
      {viewingAnomalyId && (() => {
        const anomaly = anomalies.find(a => a.id === viewingAnomalyId)
        if (!anomaly) return null
        const statusMap = {
          pending: { label: '待处理', bg: 'bg-amber-50', text: 'text-amber-600', icon: Clock },
          processing: { label: '处理中', bg: 'bg-ice-50', text: 'text-ice-600', icon: Loader },
          closed: { label: '已闭环', bg: 'bg-emerald-50', text: 'text-emerald-600', icon: CheckCircle2 },
        } as const
        const taskStatusMap: Record<string, { label: string; color: string; bgLight: string }> = {
          pending: { label: '待提交', color: 'text-amber-600', bgLight: 'bg-amber-50' },
          uploaded: { label: '已提交', color: 'text-ice-600', bgLight: 'bg-ice-50' },
          approved: { label: '已通过', color: 'text-emerald-600', bgLight: 'bg-emerald-50' },
          rejected: { label: '已驳回', color: 'text-red-600', bgLight: 'bg-red-50' },
        }
        const sc = statusMap[anomaly.status]
        const StatusIcon = sc.icon

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/50 backdrop-blur-sm" onClick={() => setViewingAnomalyId(null)}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-bold text-navy-500">{anomaly.title}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                    <StatusIcon className="w-3 h-3 inline mr-1" />{sc.label}
                  </span>
                </div>
                <button onClick={() => setViewingAnomalyId(null)} className="text-navy-200 hover:text-navy-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-4 space-y-4">
                <p className="text-sm text-navy-300 whitespace-pre-line">{anomaly.description}</p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-navy-200" />
                    <span className="text-navy-200">门店：</span>
                    <span className="text-navy-500 font-medium">{anomaly.storeName}</span>
                  </div>
                  <div><span className="text-navy-200">项目：</span><span className="text-navy-500 font-medium">{anomaly.projectName}</span></div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5 text-navy-200" />
                    <span className="text-navy-200">创建：</span>
                    <span className="text-navy-500 font-mono">{anomaly.createdAt}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-navy-200" />
                    <span className="text-navy-200">截止：</span>
                    <span className={`font-mono ${anomaly.urgency === 'overdue' ? 'text-red-600 font-medium' : 'text-navy-500'}`}>
                      {anomaly.deadline}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-navy-500 mb-3">整改任务</h3>
                  <div className="space-y-3">
                    {anomaly.rectificationTasks.map((task) => {
                      const ts = taskStatusMap[task.status]
                      return (
                        <div key={task.id} className={`border rounded-lg p-4 ${ts.bgLight}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-navy-500">负责人：{task.assignee}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${ts.color} bg-white border`}>
                                {ts.label}
                              </span>
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
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 text-center">
                  <p className="text-xs text-navy-200">完整操作请前往 <span className="text-ice-500 font-medium">异常闭环</span> 模块</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
                <button
                  onClick={() => setViewingAnomalyId(null)}
                  className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-navy-300 hover:bg-gray-200 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
