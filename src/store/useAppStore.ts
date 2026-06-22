import { create } from 'zustand'
import { anomalies as initialAnomalies } from '@/data/anomalies'
import { spotchecks as initialSpotchecks } from '@/data/spotchecks'
import { reports as initialReports } from '@/data/reports'
import { stores } from '@/data/stores'
import { assistants } from '@/data/assistants'
import type { Anomaly, SpotCheck, MonthlyReport, RectificationTask, Attachment, TaskHistoryItem, ReportScope } from '@/types'

interface AppState {
  anomalies: Anomaly[]
  spotchecks: SpotCheck[]
  reports: MonthlyReport[]

  addAnomaly: (data: Omit<Anomaly, 'id' | 'createdAt' | 'rectificationTasks' | 'urgency'> & {
    assignee: string
  }) => void

  addRectificationTask: (anomalyId: string, task: Omit<RectificationTask, 'id' | 'status' | 'attachments' | 'history'> & {
    attachments?: Attachment[]
  }) => void

  submitRectification: (anomalyId: string, taskId: string, note: string, attachments: Attachment[]) => void

  approveRectification: (anomalyId: string, taskId: string, reviewNote: string) => void

  rejectRectification: (anomalyId: string, taskId: string, reviewNote: string) => void

  createSpotCheckAnomaly: (spotCheckId: string) => Anomaly | null

  generateMonthlyReport: (month: string, scope?: ReportScope, regenerate?: boolean) => MonthlyReport

  exportReportAsHtml: (reportId: string) => string

  getAnomalyById: (id: string) => Anomaly | undefined
}

const generateId = (prefix: string) =>
  `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

const getTodayStr = () => new Date().toISOString().slice(0, 10)

const getNowStr = () => {
  const d = new Date()
  return `${d.toISOString().slice(0, 10)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const addDays = (dateStr: string, days: number) => {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

const getPrevMonth = (month: string) => {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const calcUrgency = (deadline: string, status: string): 'normal' | 'soon' | 'overdue' => {
  if (status === 'closed') return 'normal'
  const today = new Date(getTodayStr())
  const dl = new Date(deadline)
  const diffDays = Math.ceil((dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'overdue'
  if (diffDays <= 3) return 'soon'
  return 'normal'
}

const updateAnomalyStatus = (anomaly: Anomaly): Anomaly => {
  const tasks = anomaly.rectificationTasks
  if (tasks.length === 0) return { ...anomaly, status: 'pending', urgency: calcUrgency(anomaly.deadline, 'pending') }
  const allApproved = tasks.every(t => t.status === 'approved')
  let status: 'pending' | 'processing' | 'closed'
  if (allApproved) {
    status = 'closed'
  } else {
    const anyProcessing = tasks.some(t => t.status !== 'pending')
    status = anyProcessing ? 'processing' : 'pending'
  }
  return { ...anomaly, status, urgency: calcUrgency(anomaly.deadline, status) }
}

const makeHistory = (status: TaskHistoryItem['status'], operator: string, operatorRole: TaskHistoryItem['operatorRole'], note: string, attachments?: Attachment[]): TaskHistoryItem => ({
  id: generateId('h'),
  status,
  operator,
  operatorRole,
  note,
  timestamp: getNowStr(),
  attachments,
})

export const useAppStore = create<AppState>((set, get) => ({
  anomalies: initialAnomalies,
  spotchecks: initialSpotchecks,
  reports: initialReports,

  getAnomalyById: (id) => get().anomalies.find(a => a.id === id),

  addAnomaly: (data) => {
    const id = generateId('an')
    const createdAt = getTodayStr()
    const taskId = generateId('rt')
    const task = {
      id: taskId,
      anomalyId: id,
      assignee: data.assignee,
      status: 'pending' as const,
      attachments: [],
      history: [makeHistory('pending', '质控专员', '质控', '派发整改任务')],
    }
    const newAnomaly: Anomaly = {
      id,
      title: data.title,
      storeId: data.storeId,
      storeName: data.storeName,
      projectName: data.projectName,
      status: 'pending',
      createdAt,
      deadline: data.deadline,
      description: data.description,
      rectificationTasks: [task],
      urgency: calcUrgency(data.deadline, 'pending'),
    }
    set({ anomalies: [newAnomaly, ...get().anomalies] })
  },

  addRectificationTask: (anomalyId, task) => {
    set({
      anomalies: get().anomalies.map(a => {
        if (a.id !== anomalyId) return a
        const newTask: RectificationTask = {
          id: generateId('rt'),
          anomalyId,
          assignee: task.assignee,
          status: 'pending',
          attachments: task.attachments ?? [],
          history: [makeHistory('pending', '质控专员', '质控', '新增整改任务')],
        }
        return updateAnomalyStatus({
          ...a,
          rectificationTasks: [...a.rectificationTasks, newTask],
        })
      }),
    })
  },

  submitRectification: (anomalyId, taskId, note, attachments) => {
    set({
      anomalies: get().anomalies.map(a => {
        if (a.id !== anomalyId) return a
        return updateAnomalyStatus({
          ...a,
          rectificationTasks: a.rectificationTasks.map(t => {
            if (t.id !== taskId) return t
            const historyItem = makeHistory('uploaded', t.assignee, '医助', note || '提交整改说明', attachments)
            return {
              ...t,
              status: 'uploaded' as const,
              uploadedAt: getTodayStr(),
              reviewNote: note,
              attachments,
              history: [...t.history, historyItem],
            }
          }),
        })
      }),
    })
  },

  approveRectification: (anomalyId, taskId, reviewNote) => {
    set({
      anomalies: get().anomalies.map(a => {
        if (a.id !== anomalyId) return a
        return updateAnomalyStatus({
          ...a,
          rectificationTasks: a.rectificationTasks.map(t => {
            if (t.id !== taskId) return t
            const historyItem = makeHistory('approved', '质控专员', '质控', reviewNote || '审批通过')
            return { ...t, status: 'approved' as const, reviewNote, history: [...t.history, historyItem] }
          }),
        })
      }),
    })
  },

  rejectRectification: (anomalyId, taskId, reviewNote) => {
    set({
      anomalies: get().anomalies.map(a => {
        if (a.id !== anomalyId) return a
        return updateAnomalyStatus({
          ...a,
          rectificationTasks: a.rectificationTasks.map(t => {
            if (t.id !== taskId) return t
            const historyItem = makeHistory('rejected', '质控专员', '质控', reviewNote || '审批驳回')
            return { ...t, status: 'rejected' as const, reviewNote, history: [...t.history, historyItem] }
          }),
        })
      }),
    })
  },

  createSpotCheckAnomaly: (spotCheckId) => {
    const check = get().spotchecks.find(s => s.id === spotCheckId)
    if (!check) return null

    if (check.anomalyIds && check.anomalyIds.length > 0) {
      const existing = get().anomalies.find(a => a.id === check.anomalyIds![0])
      return existing || null
    }

    const anomalyId = generateId('an')
    const taskId = generateId('rt')
    const createdAt = getTodayStr()
    const deadline = addDays(createdAt, 7)

    const newAnomaly: Anomaly = {
      id: anomalyId,
      title: `[抽查整改] ${check.projectName} - ${check.result === 'fail' ? '不合规' : '待关注'}`,
      storeId: check.storeId,
      storeName: check.storeName,
      projectName: check.projectName,
      status: 'pending',
      createdAt,
      deadline,
      description: `来源：抽查记录 ${check.date} - ${check.projectName}\n录音摘要：${check.audioSummary}\n备注：${check.notes}`,
      rectificationTasks: [{
        id: taskId,
        anomalyId,
        assignee: check.assistantName,
        status: 'pending',
        attachments: check.photos.map(p => ({ name: p.caption, type: 'image', url: p.url })),
        history: [makeHistory('pending', '质控专员', '质控', `来自抽查记录 ${check.date} 的整改派发`, check.photos.map(p => ({ name: p.caption, type: 'image', url: p.url })))],
      }],
      fromSpotCheckId: spotCheckId,
      urgency: calcUrgency(deadline, 'pending'),
    }

    set({
      anomalies: [newAnomaly, ...get().anomalies],
      spotchecks: get().spotchecks.map(s => {
        if (s.id !== spotCheckId) return s
        return { ...s, anomalyIds: [...(s.anomalyIds || []), anomalyId] }
      }),
    })
    return newAnomaly
  },

  generateMonthlyReport: (month, scope = {}, regenerate = false) => {
    const { anomalies, reports } = get()

    const scopeKey = JSON.stringify(scope)
    const existing = reports.find(r => r.month === month && JSON.stringify(r.scope) === scopeKey)
    if (existing && !regenerate) return existing

    let scopeStores = stores
    if (scope.region) scopeStores = scopeStores.filter(s => s.region === scope.region)
    if (scope.storeId) scopeStores = scopeStores.filter(s => s.id === scope.storeId)
    const storeIds = scopeStores.map(s => s.id)

    let scopeAnomalies = anomalies.filter(a => storeIds.includes(a.storeId))
    if (scope.projectType) {
      const typeMap: Record<string, string[]> = {
        injection: ['注射类'],
        surgery: ['手术类'],
        laser: ['光电类'],
      }
      const names = typeMap[scope.projectType] || [scope.projectType]
      scopeAnomalies = scopeAnomalies.filter(a => names.some(n => a.projectName.includes(n)))
    }

    const avgCompletionRate = scopeStores.length > 0
      ? +(scopeStores.reduce((s, st) => s + st.completionRate, 0) / scopeStores.length).toFixed(1)
      : 0
    const avgOnTimeRate = scopeStores.length > 0
      ? +(scopeStores.reduce((s, st) => s + st.onTimeRate, 0) / scopeStores.length).toFixed(1)
      : 0
    const totalAnomalies = scopeAnomalies.length
    const closedCount = scopeAnomalies.filter(a => a.status === 'closed').length
    const closedRate = totalAnomalies > 0 ? +(closedCount / totalAnomalies * 100).toFixed(1) : 0

    const injectionCount = scopeAnomalies.filter(a => a.projectName.includes('注射')).length
    const surgeryCount = scopeAnomalies.filter(a => a.projectName.includes('手术')).length
    const laserCount = scopeAnomalies.filter(a => a.projectName.includes('光电') || a.projectName.includes('热玛吉') || a.projectName.includes('光子') || a.projectName.includes('点阵') || a.projectName.includes('超声') || a.projectName.includes('脱毛')).length

    const prevMonth = getPrevMonth(month)
    const prevReport = reports.find(r => r.month === prevMonth && JSON.stringify(r.scope) === scopeKey)
    const comparison = prevReport ? {
      avgCompletionRate: +(avgCompletionRate - prevReport.keyMetrics.avgCompletionRate).toFixed(1),
      avgOnTimeRate: +(avgOnTimeRate - prevReport.keyMetrics.avgOnTimeRate).toFixed(1),
      totalAnomalies: totalAnomalies - prevReport.keyMetrics.totalAnomalies,
      closedRate: +(closedRate - prevReport.keyMetrics.closedRate).toFixed(1),
    } : undefined

    const sortedStores = [...scopeStores].sort((a, b) => a.totalScore - b.totalScore)
    const weakStores = sortedStores.slice(0, 2).map(s => s.name)
    const highAnomalyStores = [...scopeStores]
      .sort((a, b) => b.tempMaterialCount - a.tempMaterialCount)
      .slice(0, 2)
      .map(s => s.name)

    const scopeLabel = scope.region || scope.storeId ? (scope.region || stores.find(s => s.id === scope.storeId)?.name || '') : '全部门店'
    const projectLabel = scope.projectType ? (scope.projectType === 'injection' ? '注射类' : scope.projectType === 'surgery' ? '手术类' : '光电类') : '全部项目'

    const trainingSuggestions = [
      weakStores.length > 0 ? `${weakStores.join('、')}综合能力偏低，建议安排集中培训` : '整体能力良好，建议维持培训节奏',
      injectionCount > 0 ? '注射类药品批号记录问题高发，建议强化批号记录流程培训' : '注射类质控情况良好',
      surgeryCount > 0 ? '手术类器械清点和交接需重点培训，建议增加实操演练' : '手术类质控情况良好',
      '建议对所有新入职医助完成跟台培训认证后方可独立上岗',
    ].filter(Boolean)

    const schedulingSuggestions = [
      weakStores.length > 0 ? `${weakStores.join('、')}建议增加资深医助配比，降低独立跟台比例` : '各门店能力均衡，维持现有排班',
      highAnomalyStores.length > 0 ? `${highAnomalyStores.join('、')}物料准备问题突出，建议安排物料管理专员` : '物料准备整体良好',
      '建议将能力评分85分以下医助安排在低风险项目跟台',
      '高峰时段建议安排双人跟台，减少临时补物料情况',
    ].filter(Boolean)

    const getTrend = (current: number, prev?: number) => {
      if (prev === undefined) return '→'
      if (current > prev) return '↑'
      if (current < prev) return '↓'
      return '→'
    }

    const prevInjection = prevReport?.anomalySummary.find(a => a.category === '注射类')?.count
    const prevSurgery = prevReport?.anomalySummary.find(a => a.category === '手术类')?.count
    const prevLaser = prevReport?.anomalySummary.find(a => a.category === '光电类')?.count

    const report: MonthlyReport = {
      id: existing?.id || generateId('r'),
      month,
      generatedAt: getTodayStr(),
      status: 'draft',
      scope,
      keyMetrics: { avgCompletionRate, avgOnTimeRate, totalAnomalies, closedRate },
      comparison,
      anomalySummary: [
        { category: '注射类', count: injectionCount, trend: getTrend(injectionCount, prevInjection) },
        { category: '手术类', count: surgeryCount, trend: getTrend(surgeryCount, prevSurgery) },
        { category: '光电类', count: laserCount, trend: getTrend(laserCount, prevLaser) },
      ],
      trainingSuggestions,
      schedulingSuggestions,
    }

    if (existing && regenerate) {
      set({
        reports: reports.map(r => r.id === existing.id ? report : r),
      })
    } else {
      set({ reports: [report, ...reports] })
    }
    return report
  },

  exportReportAsHtml: (reportId) => {
    const report = get().reports.find(r => r.id === reportId)
    if (!report) return ''

    const { keyMetrics, anomalySummary, trainingSuggestions, schedulingSuggestions, comparison, scope } = report

    const scopeText = [
      scope.region ? `区域：${scope.region}` : '',
      scope.storeId ? `门店：${stores.find(s => s.id === scope.storeId)?.name || ''}` : '',
      scope.projectType ? `项目：${scope.projectType === 'injection' ? '注射类' : scope.projectType === 'surgery' ? '手术类' : '光电类'}` : '',
    ].filter(Boolean).join(' &middot; ') || '全部范围'

    const formatDiff = (val: number, isRate = true) => {
      if (val === 0) return '<span style="color:#94A3B8">→ 持平</span>'
      if (val > 0) return `<span style="color:${isRate ? '#22C55E' : '#EF4444'}">↑ ${isRate ? val + '%' : val}</span>`
      return `<span style="color:${isRate ? '#EF4444' : '#22C55E'}">↓ ${isRate ? Math.abs(val) + '%' : Math.abs(val)}</span>`
    }

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
    .metric-card { background: linear-gradient(135deg, #F0F5FF 0%, #EBF4FF 100%); border-radius: 8px; padding: 20px; position: relative; }
    .metric-label { font-size: 13px; color: #576C95; margin-bottom: 8px; }
    .metric-value { font-size: 28px; font-weight: 700; color: #4A9EFF; font-family: "DM Mono", monospace; }
    .metric-diff { font-size: 12px; margin-top: 6px; }
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
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-left: 8px; }
    .badge-draft { background: #FEF3C7; color: #B45309; }
    .badge-published { background: #D1FAE5; color: #065F46; }
    .scope-bar { background: #F0F5FF; padding: 10px 16px; border-radius: 6px; font-size: 13px; color: #1B2A4A; margin-bottom: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>跟台质量月报</h1>
    <div class="subtitle">
      ${report.month} &middot; 生成时间：${report.generatedAt}
      <span class="badge ${report.status === 'published' ? 'badge-published' : 'badge-draft'}">
        ${report.status === 'published' ? '已发布' : '草稿'}
      </span>
    </div>
    <div class="scope-bar">报告范围：${scopeText}</div>

    <div class="section-title">关键指标</div>
    <div class="metrics">
      <div class="metric-card">
        <div class="metric-label">跟台完成率</div>
        <div class="metric-value">${keyMetrics.avgCompletionRate}%</div>
        ${comparison ? `<div class="metric-diff">${formatDiff(comparison.avgCompletionRate)}</div>` : ''}
      </div>
      <div class="metric-card">
        <div class="metric-label">准点开台率</div>
        <div class="metric-value">${keyMetrics.avgOnTimeRate}%</div>
        ${comparison ? `<div class="metric-diff">${formatDiff(comparison.avgOnTimeRate)}</div>` : ''}
      </div>
      <div class="metric-card">
        <div class="metric-label">异常总数</div>
        <div class="metric-value">${keyMetrics.totalAnomalies}</div>
        ${comparison ? `<div class="metric-diff">${formatDiff(comparison.totalAnomalies, false)}</div>` : ''}
      </div>
      <div class="metric-card">
        <div class="metric-label">闭环率</div>
        <div class="metric-value">${keyMetrics.closedRate}%</div>
        ${comparison ? `<div class="metric-diff">${formatDiff(comparison.closedRate)}</div>` : ''}
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

    return html
  },
}))
