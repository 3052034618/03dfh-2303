import { create } from 'zustand'
import { anomalies as initialAnomalies } from '@/data/anomalies'
import { spotchecks as initialSpotchecks } from '@/data/spotchecks'
import { reports as initialReports } from '@/data/reports'
import { stores } from '@/data/stores'
import { assistants } from '@/data/assistants'
import type { Anomaly, SpotCheck, MonthlyReport, RectificationTask, Attachment } from '@/types'

interface AppState {
  anomalies: Anomaly[]
  spotchecks: SpotCheck[]
  reports: MonthlyReport[]

  addAnomaly: (data: Omit<Anomaly, 'id' | 'createdAt' | 'rectificationTasks'> & {
    assignee?: string
  }) => void

  addRectificationTask: (anomalyId: string, task: Omit<RectificationTask, 'id' | 'status' | 'attachments'> & {
    attachments?: Attachment[]
  }) => void

  submitRectification: (anomalyId: string, taskId: string, note: string, attachments: Attachment[]) => void

  approveRectification: (anomalyId: string, taskId: string, reviewNote: string) => void

  rejectRectification: (anomalyId: string, taskId: string, reviewNote: string) => void

  createSpotCheckAnomaly: (spotCheckId: string) => Anomaly | null

  generateMonthlyReport: (month: string) => MonthlyReport

  exportReportAsHtml: (reportId: string) => string
}

const generateId = (prefix: string) =>
  `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

const getTodayStr = () => new Date().toISOString().slice(0, 10)

const addDays = (dateStr: string, days: number) => {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

const updateAnomalyStatus = (anomaly: Anomaly): Anomaly => {
  const tasks = anomaly.rectificationTasks
  if (tasks.length === 0) return { ...anomaly, status: 'pending' }
  const allApproved = tasks.every(t => t.status === 'approved')
  if (allApproved) return { ...anomaly, status: 'closed' }
  const anyUploaded = tasks.some(t => t.status === 'uploaded' || t.status === 'rejected')
  const anyProcessing = tasks.some(t => t.status !== 'pending' && t.status !== 'approved')
  if (anyUploaded || anyProcessing) return { ...anomaly, status: 'processing' }
  return { ...anomaly, status: 'pending' }
}

export const useAppStore = create<AppState>((set, get) => ({
  anomalies: initialAnomalies,
  spotchecks: initialSpotchecks,
  reports: initialReports,

  addAnomaly: (data) => {
    const id = generateId('an')
    const createdAt = getTodayStr()
    const taskId = generateId('rt')
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
      rectificationTasks: data.assignee
        ? [{
            id: taskId,
            anomalyId: id,
            assignee: data.assignee,
            status: 'pending',
            attachments: [],
          }]
        : [],
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
            return {
              ...t,
              status: 'uploaded' as const,
              uploadedAt: getTodayStr(),
              reviewNote: note,
              attachments,
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
            return { ...t, status: 'approved' as const, reviewNote }
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
            return { ...t, status: 'rejected' as const, reviewNote }
          }),
        })
      }),
    })
  },

  createSpotCheckAnomaly: (spotCheckId) => {
    const check = get().spotchecks.find(s => s.id === spotCheckId)
    if (!check) return null
    const store = stores.find(s => s.id === check.storeId)
    const anomalyId = generateId('an')
    const taskId = generateId('rt')
    const createdAt = getTodayStr()
    const deadline = addDays(createdAt, 7)

    const assitantMatch = assistants.find(a => a.name === check.assistantName)

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
      }],
    }

    set({ anomalies: [newAnomaly, ...get().anomalies] })
    return newAnomaly
  },

  generateMonthlyReport: (month) => {
    const { anomalies, reports } = get()
    const existing = reports.find(r => r.month === month)
    if (existing) return existing

    const avgCompletionRate = +(stores.reduce((s, st) => s + st.completionRate, 0) / stores.length).toFixed(1)
    const avgOnTimeRate = +(stores.reduce((s, st) => s + st.onTimeRate, 0) / stores.length).toFixed(1)
    const totalAnomalies = anomalies.length
    const closedCount = anomalies.filter(a => a.status === 'closed').length
    const closedRate = +(closedCount / totalAnomalies * 100).toFixed(1)

    const injectionCount = anomalies.filter(a => a.projectName === '注射类').length
    const surgeryCount = anomalies.filter(a => a.projectName === '手术类').length
    const laserCount = anomalies.filter(a => a.projectName === '光电类').length

    const sortedStores = [...stores].sort((a, b) => a.totalScore - b.totalScore)
    const weakStores = sortedStores.slice(0, 2).map(s => s.name)
    const highAnomalyStores = [...stores]
      .sort((a, b) => b.tempMaterialCount - a.tempMaterialCount)
      .slice(0, 2)
      .map(s => s.name)

    const trainingSuggestions = [
      `${weakStores.join('、')}综合能力偏低，建议安排集中培训`,
      '注射类药品批号记录问题高发，建议强化批号记录流程培训',
      '物料准备环节异常占比最高，建议制定标准化物料清单',
      '建议对所有新入职医助完成跟台培训认证后方可独立上岗',
    ]

    const schedulingSuggestions = [
      `${weakStores.join('、')}建议增加资深医助配比，降低独立跟台比例`,
      `${highAnomalyStores.join('、')}物料准备问题突出，建议安排物料管理专员`,
      '建议将能力评分85分以下医助安排在低风险项目跟台',
      '高峰时段建议安排双人跟台，减少临时补物料情况',
    ]

    const report: MonthlyReport = {
      id: generateId('r'),
      month,
      generatedAt: getTodayStr(),
      status: 'draft',
      keyMetrics: { avgCompletionRate, avgOnTimeRate, totalAnomalies, closedRate },
      anomalySummary: [
        { category: '注射类', count: injectionCount, trend: '→' },
        { category: '手术类', count: surgeryCount, trend: '↑' },
        { category: '光电类', count: laserCount, trend: '↓' },
      ],
      trainingSuggestions,
      schedulingSuggestions,
    }

    set({ reports: [report, ...get().reports] })
    return report
  },

  exportReportAsHtml: (reportId) => {
    const report = get().reports.find(r => r.id === reportId)
    if (!report) return ''

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

    return html
  },
}))
