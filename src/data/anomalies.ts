import type { Anomaly } from '@/types'

export const anomalies: Anomaly[] = [
  {
    id: 'an1', title: '玻尿酸注射批号记录遗漏', storeId: 's4', storeName: '徐汇衡山院', projectName: '注射类',
    status: 'pending', createdAt: '2025-06-18', deadline: '2025-06-25',
    description: '抽查发现3台玻尿酸注射术中药品批号未记录，存在溯源风险',
    rectificationTasks: [{ id: 'rt1', anomalyId: 'an1', assignee: '赵红', status: 'pending', attachments: [] }],
  },
  {
    id: 'an2', title: '双眼皮手术器械清点不符', storeId: 's6', storeName: '福田中心院', projectName: '手术类',
    status: 'processing', createdAt: '2025-06-15', deadline: '2025-06-22',
    description: '术后器械清点发现止血钳数量不符，经确认遗留在手术包内',
    rectificationTasks: [{ id: 'rt2', anomalyId: 'an2', assignee: '谢敏', status: 'uploaded', uploadedAt: '2025-06-19', attachments: [{ name: '整改说明.pdf', type: 'pdf', url: '#' }] }],
  },
  {
    id: 'an3', title: '热玛吉治疗参数记录不完整', storeId: 's8', storeName: '渝北金开院', projectName: '光电类',
    status: 'pending', createdAt: '2025-06-20', deadline: '2025-06-27',
    description: '5台热玛吉治疗中3台参数记录不完整，缺少能量等级和发数',
    rectificationTasks: [{ id: 'rt3', anomalyId: 'an3', assignee: '邓晓雯', status: 'pending', attachments: [] }],
  },
  {
    id: 'an4', title: '隆鼻术后交接记录缺失', storeId: 's6', storeName: '福田中心院', projectName: '手术类',
    status: 'closed', createdAt: '2025-06-08', deadline: '2025-06-15',
    description: '术后交接记录未填写，导致后续护理信息断层',
    rectificationTasks: [{ id: 'rt4', anomalyId: 'an4', assignee: '谢敏', status: 'approved', uploadedAt: '2025-06-12', reviewNote: '整改到位，已建立交接检查表', attachments: [{ name: '整改报告.pdf', type: 'pdf', url: '#' }] }],
  },
  {
    id: 'an5', title: '肉毒素注射部位记录缺失', storeId: 's2', storeName: '海淀学院院', projectName: '注射类',
    status: 'processing', createdAt: '2025-06-16', deadline: '2025-06-23',
    description: '2台肉毒素注射部位记录不清晰，无法确认注射点位',
    rectificationTasks: [{ id: 'rt5', anomalyId: 'an5', assignee: '杨静', status: 'uploaded', uploadedAt: '2025-06-20', attachments: [{ name: '复盘说明.docx', type: 'docx', url: '#' }] }],
  },
  {
    id: 'an6', title: '吸脂手术术中临时补物料', storeId: 's4', storeName: '徐汇衡山院', projectName: '手术类',
    status: 'pending', createdAt: '2025-06-19', deadline: '2025-06-26',
    description: '术中临时补充辅料3次，术前物料准备不充分',
    rectificationTasks: [{ id: 'rt6', anomalyId: 'an6', assignee: '孙丽', status: 'pending', attachments: [] }],
  },
  {
    id: 'an7', title: '光子嫩肤知情同意书签署遗漏', storeId: 's7', storeName: '武侯锦江院', projectName: '光电类',
    status: 'processing', createdAt: '2025-06-12', deadline: '2025-06-19',
    description: '1台光子嫩肤治疗知情同意书未在术前签署',
    rectificationTasks: [{ id: 'rt7', anomalyId: 'an7', assignee: '曹雨萱', status: 'uploaded', uploadedAt: '2025-06-17', attachments: [{ name: '整改说明.pdf', type: 'pdf', url: '#' }] }],
  },
  {
    id: 'an8', title: '水光针术前核对缺漏', storeId: 's8', storeName: '渝北金开院', projectName: '注射类',
    status: 'pending', createdAt: '2025-06-21', deadline: '2025-06-28',
    description: '水光针治疗术前核对项目遗漏2项，存在安全隐患',
    rectificationTasks: [{ id: 'rt8', anomalyId: 'an8', assignee: '黄丽萍', status: 'pending', attachments: [] }],
  },
  {
    id: 'an9', title: '超声刀术后护理指导缺失', storeId: 's7', storeName: '武侯锦江院', projectName: '光电类',
    status: 'closed', createdAt: '2025-06-05', deadline: '2025-06-12',
    description: '超声刀术后未提供书面护理指导',
    rectificationTasks: [{ id: 'rt9', anomalyId: 'an9', assignee: '曹雨萱', status: 'approved', uploadedAt: '2025-06-09', reviewNote: '已补充术后护理指导流程', attachments: [{ name: '整改报告.pdf', type: 'pdf', url: '#' }] }],
  },
  {
    id: 'an10', title: '脂肪填充器械清点延迟', storeId: 's3', storeName: '浦东陆家嘴院', projectName: '手术类',
    status: 'closed', createdAt: '2025-06-03', deadline: '2025-06-10',
    description: '术后器械清点延迟15分钟完成，影响手术室周转效率',
    rectificationTasks: [{ id: 'rt10', anomalyId: 'an10', assignee: '刘敏', status: 'approved', uploadedAt: '2025-06-07', reviewNote: '已优化清点流程', attachments: [{ name: '改进方案.pdf', type: 'pdf', url: '#' }] }],
  },
  {
    id: 'an11', title: '线雕提升术中配合不规范', storeId: 's2', storeName: '海淀学院院', projectName: '注射类',
    status: 'pending', createdAt: '2025-06-22', deadline: '2025-06-29',
    description: '线雕提升术中医助配合不到位，导致手术暂停等待',
    rectificationTasks: [{ id: 'rt11', anomalyId: 'an11', assignee: '杨静', status: 'pending', attachments: [] }],
  },
  {
    id: 'an12', title: '点阵激光设备消毒记录缺失', storeId: 's2', storeName: '海淀学院院', projectName: '光电类',
    status: 'processing', createdAt: '2025-06-14', deadline: '2025-06-21',
    description: '点阵激光设备使用后消毒记录未及时填写',
    rectificationTasks: [{ id: 'rt12', anomalyId: 'an12', assignee: '朱佳', status: 'uploaded', uploadedAt: '2025-06-18', attachments: [{ name: '整改说明.docx', type: 'docx', url: '#' }] }],
  },
  {
    id: 'an13', title: '眼袋手术术前拍照遗漏', storeId: 's5', storeName: '天河珠江新城院', projectName: '手术类',
    status: 'closed', createdAt: '2025-06-01', deadline: '2025-06-08',
    description: '眼袋手术术前照片拍摄遗漏，影响术后对比评估',
    rectificationTasks: [{ id: 'rt13', anomalyId: 'an13', assignee: '吴秀英', status: 'approved', uploadedAt: '2025-06-05', reviewNote: '已建立术前拍照清单', attachments: [{ name: '整改报告.pdf', type: 'pdf', url: '#' }] }],
  },
  {
    id: 'an14', title: '水光针过敏史确认不完整', storeId: 's7', storeName: '武侯锦江院', projectName: '注射类',
    status: 'processing', createdAt: '2025-06-17', deadline: '2025-06-24',
    description: '水光针治疗前过敏史确认流程执行不完整',
    rectificationTasks: [{ id: 'rt14', anomalyId: 'an14', assignee: '何玉珍', status: 'pending', attachments: [] }],
  },
  {
    id: 'an15', title: '脱毛治疗前后对比照遗漏', storeId: 's6', storeName: '福田中心院', projectName: '光电类',
    status: 'closed', createdAt: '2025-06-06', deadline: '2025-06-13',
    description: '激光脱毛治疗前后对比照未拍摄存档',
    rectificationTasks: [{ id: 'rt15', anomalyId: 'an15', assignee: '冯晓丽', status: 'approved', uploadedAt: '2025-06-10', reviewNote: '已补充拍照环节', attachments: [{ name: '整改报告.pdf', type: 'pdf', url: '#' }] }],
  },
]
