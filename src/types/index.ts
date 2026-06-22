export interface StoreTrend {
  month: string
  completionRate: number
  onTimeRate: number
}

export interface Store {
  id: string
  name: string
  region: string
  city: string
  completionRate: number
  onTimeRate: number
  preCheckOmissionRate: number
  tempMaterialCount: number
  totalScore: number
  trend: StoreTrend[]
}

export interface ProjectMetrics {
  batchRecordRate?: number
  siteRecordRate?: number
  instrumentCheckRate?: number
  handoverRate?: number
  paramRecordRate?: number
  consentCheckRate?: number
}

export interface TopIssue {
  issue: string
  count: number
}

export interface ProjectCategory {
  id: string
  name: string
  type: 'injection' | 'surgery' | 'laser'
  icon: string
  anomalyCount: number
  totalCases: number
  metrics: ProjectMetrics
  topIssues: TopIssue[]
}

export interface CapabilityTag {
  name: string
  score: number
}

export interface AssistantTrend {
  month: string
  score: number
}

export interface Assistant {
  id: string
  name: string
  avatar: string
  storeId: string
  storeName: string
  overallScore: number
  proficiencyProjects: string[]
  capabilityTags: CapabilityTag[]
  anomalyProneLinks: string[]
  trainingSuggestions: string[]
  trend: AssistantTrend[]
}

export interface Attachment {
  name: string
  type: string
  url: string
}

export type TaskStatus = 'pending' | 'uploaded' | 'approved' | 'rejected' | 'reminded'

export interface TaskHistoryItem {
  id: string
  status: TaskStatus
  operator: string
  operatorRole: '质控' | '医助' | '护士长'
  note: string
  timestamp: string
  attachments?: Attachment[]
}

export interface RectificationTask {
  id: string
  anomalyId: string
  assignee: string
  status: TaskStatus
  reviewNote?: string
  uploadedAt?: string
  attachments: Attachment[]
  history: TaskHistoryItem[]
}

export interface Anomaly {
  id: string
  title: string
  storeId: string
  storeName: string
  projectName: string
  status: 'pending' | 'processing' | 'closed'
  createdAt: string
  deadline: string
  description: string
  rectificationTasks: RectificationTask[]
  fromSpotCheckId?: string
  urgency?: 'normal' | 'soon' | 'overdue'
}

export interface Photo {
  url: string
  caption: string
}

export interface SpotCheck {
  id: string
  storeId: string
  storeName: string
  date: string
  assistantName: string
  projectName: string
  result: 'pass' | 'fail' | 'warning'
  photos: Photo[]
  audioSummary: string
  signatureConfirmed: boolean
  notes: string
  createdAt: string
  anomalyIds?: string[]
}

export interface AnomalySummaryItem {
  category: string
  count: number
  trend: string
}

export interface KeyMetrics {
  avgCompletionRate: number
  avgOnTimeRate: number
  totalAnomalies: number
  closedRate: number
}

export interface ReportScope {
  region?: string
  storeId?: string
  projectType?: string
}

export interface MetricsComparison {
  avgCompletionRate: number
  avgOnTimeRate: number
  totalAnomalies: number
  closedRate: number
  isBaseline?: boolean
}

export interface RiskStore {
  name: string
  reason: string
  completionRate: number
  onTimeRate: number
  anomalyCount: number
}

export interface TrackingItem {
  title: string
  storeName: string
  deadline: string
  status: string
  assignee: string
}

export interface ReminderRecord {
  id: string
  anomalyIds: string[]
  operator: string
  timestamp: string
  note: string
}

export interface MonthlyReport {
  id: string
  month: string
  generatedAt: string
  status: 'draft' | 'published'
  scope: ReportScope
  keyMetrics: KeyMetrics
  comparison?: MetricsComparison
  anomalySummary: AnomalySummaryItem[]
  trainingSuggestions: string[]
  schedulingSuggestions: string[]
  riskStores?: RiskStore[]
  trackingItems?: TrackingItem[]
}
