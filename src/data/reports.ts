import type { MonthlyReport } from '@/types'

export const reports: MonthlyReport[] = [
  {
    id: 'r1', month: '2025-06', generatedAt: '2025-06-22', status: 'draft', scope: {},
    keyMetrics: { avgCompletionRate: 88.5, avgOnTimeRate: 85.7, totalAnomalies: 15, closedRate: 26.7 },
    comparison: { avgCompletionRate: 1.7, avgOnTimeRate: 1.7, totalAnomalies: 3, closedRate: -31.6 },
    anomalySummary: [
      { category: '注射类', count: 6, trend: '↑' },
      { category: '手术类', count: 5, trend: '→' },
      { category: '光电类', count: 4, trend: '↓' },
    ],
    trainingSuggestions: [
      '渝北金开院和武侯锦江院综合能力偏低，建议安排集中培训',
      '注射类药品批号记录问题高发，建议强化批号记录流程培训',
      '物料准备环节异常占比最高，建议制定标准化物料清单',
    ],
    schedulingSuggestions: [
      '渝北金开院建议增加资深医助配比，降低独立跟台比例',
      '徐汇衡山院物料准备问题突出，建议安排物料管理专员',
      '建议将能力评分85分以下医助安排在低风险项目跟台',
    ],
  },
  {
    id: 'r2', month: '2025-05', generatedAt: '2025-05-25', status: 'published', scope: {},
    keyMetrics: { avgCompletionRate: 86.8, avgOnTimeRate: 84.0, totalAnomalies: 12, closedRate: 58.3 },
    comparison: { avgCompletionRate: 2.0, avgOnTimeRate: 1.9, totalAnomalies: -2, closedRate: 15.4 },
    anomalySummary: [
      { category: '注射类', count: 5, trend: '↓' },
      { category: '手术类', count: 4, trend: '→' },
      { category: '光电类', count: 3, trend: '↓' },
    ],
    trainingSuggestions: [
      '注射类问题较上月减少，培训效果显现',
      '建议持续推进物料管理规范化培训',
      '西南区域需加强基础操作流程培训',
    ],
    schedulingSuggestions: [
      '西南区域门店建议增加导师带教时间',
      '建议在高峰时段安排双人跟台',
    ],
  },
  {
    id: 'r3', month: '2025-04', generatedAt: '2025-04-25', status: 'published', scope: {},
    keyMetrics: { avgCompletionRate: 84.8, avgOnTimeRate: 82.1, totalAnomalies: 14, closedRate: 42.9 },
    anomalySummary: [
      { category: '注射类', count: 7, trend: '↑' },
      { category: '手术类', count: 4, trend: '→' },
      { category: '光电类', count: 3, trend: '↓' },
    ],
    trainingSuggestions: [
      '注射类问题上升，需重点关注药品批号记录',
      '建议加强术前核对流程的培训力度',
      '新入职医助需完成跟台培训认证',
    ],
    schedulingSuggestions: [
      '新入职医助不应安排在高风险项目独立跟台',
      '建议优化门店排班，确保关键时段有资深医助在岗',
    ],
  },
  {
    id: 'r4', month: '2025-03', generatedAt: '2025-03-25', status: 'published', scope: {},
    keyMetrics: { avgCompletionRate: 82.5, avgOnTimeRate: 79.8, totalAnomalies: 16, closedRate: 37.5 },
    anomalySummary: [
      { category: '注射类', count: 6, trend: '→' },
      { category: '手术类', count: 6, trend: '↑' },
      { category: '光电类', count: 4, trend: '→' },
    ],
    trainingSuggestions: [
      '手术类问题增多，需重点培训器械清点流程',
      '建议统一各门店术前核对标准',
      '加强术后交接环节的培训和监督',
    ],
    schedulingSuggestions: [
      '手术类项目建议安排经验丰富的医助跟台',
      '建议在手术后增加交接确认环节',
    ],
  },
  {
    id: 'r5', month: '2025-02', generatedAt: '2025-02-25', status: 'published', scope: {},
    keyMetrics: { avgCompletionRate: 80.2, avgOnTimeRate: 77.5, totalAnomalies: 18, closedRate: 33.3 },
    anomalySummary: [
      { category: '注射类', count: 6, trend: '↑' },
      { category: '手术类', count: 7, trend: '↑' },
      { category: '光电类', count: 5, trend: '↑' },
    ],
    trainingSuggestions: [
      '异常数量整体偏高，建议开展全员质控培训',
      '术后交接问题突出，需重点整改',
      '建议制定标准化操作手册',
    ],
    schedulingSuggestions: [
      '建议在各门店设立质控专员岗位',
      '异常高发门店建议增加质控抽查频次',
    ],
  },
  {
    id: 'r6', month: '2025-01', generatedAt: '2025-01-25', status: 'published', scope: {},
    keyMetrics: { avgCompletionRate: 77.6, avgOnTimeRate: 75.0, totalAnomalies: 22, closedRate: 27.3 },
    anomalySummary: [
      { category: '注射类', count: 8, trend: '→' },
      { category: '手术类', count: 8, trend: '→' },
      { category: '光电类', count: 6, trend: '→' },
    ],
    trainingSuggestions: [
      '首月数据基线建立，需持续跟踪',
      '建议从注射类和手术类入手改善',
      '所有门店需完成基础质控培训',
    ],
    schedulingSuggestions: [
      '建议建立各门店能力基线档案',
      '根据能力评估结果优化排班',
    ],
  },
]
