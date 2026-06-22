import type { ProjectCategory } from '@/types'

export const projects: ProjectCategory[] = [
  {
    id: 'p1',
    name: '注射类',
    type: 'injection',
    icon: 'Syringe',
    anomalyCount: 23,
    totalCases: 580,
    metrics: {
      batchRecordRate: 87.5,
      siteRecordRate: 82.3,
    },
    topIssues: [
      { issue: '药品批号未记录', count: 8 },
      { issue: '注射部位记录缺失', count: 6 },
      { issue: '术前拍照遗漏', count: 4 },
      { issue: '过敏史确认不完整', count: 3 },
      { issue: '术后观察记录缺失', count: 2 },
    ],
  },
  {
    id: 'p2',
    name: '手术类',
    type: 'surgery',
    icon: 'Scissors',
    anomalyCount: 18,
    totalCases: 320,
    metrics: {
      instrumentCheckRate: 91.2,
      handoverRate: 85.6,
    },
    topIssues: [
      { issue: '器械清点不符', count: 6 },
      { issue: '术后交接记录缺失', count: 5 },
      { issue: '术中临时补物料', count: 4 },
      { issue: '手术安全核对遗漏', count: 2 },
      { issue: '术后器械归还延迟', count: 1 },
    ],
  },
  {
    id: 'p3',
    name: '光电类',
    type: 'laser',
    icon: 'Zap',
    anomalyCount: 12,
    totalCases: 450,
    metrics: {
      paramRecordRate: 89.0,
      consentCheckRate: 93.5,
    },
    topIssues: [
      { issue: '治疗参数记录不完整', count: 5 },
      { issue: '知情同意书签署遗漏', count: 3 },
      { issue: '术后护理指导缺失', count: 2 },
      { issue: '设备消毒记录缺失', count: 1 },
      { issue: '治疗前后对比照遗漏', count: 1 },
    ],
  },
]
