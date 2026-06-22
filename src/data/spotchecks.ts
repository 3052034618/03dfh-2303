import type { SpotCheck } from '@/types'

export const spotchecks: SpotCheck[] = [
  {
    id: 'sc1', storeId: 's1', storeName: '朝阳旗舰院', date: '2025-06-20', assistantName: '王雪梅', projectName: '玻尿酸注射',
    result: 'pass', photos: [{ url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=medical+sterile+operating+room+with+injection+tray+and+labeled+medication+vials+on+clean+white+surface&image_size=landscape_4_3', caption: '注射台药品摆放' }],
    audioSummary: '全程操作规范，药品批号逐一核对并记录，注射部位标记清晰', signatureConfirmed: true, notes: '操作规范，无异常', createdAt: '2025-06-20',
  },
  {
    id: 'sc2', storeId: 's4', storeName: '徐汇衡山院', date: '2025-06-18', assistantName: '赵红', projectName: '玻尿酸注射',
    result: 'fail', photos: [{ url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=medical+desk+with+incomplete+paperwork+and+missing+records+highlighted+with+red+arrows&image_size=landscape_4_3', caption: '批号记录缺失' }],
    audioSummary: '药品批号未记录，注射部位记录不完整，需整改', signatureConfirmed: false, notes: '已关联异常派发整改任务', createdAt: '2025-06-18',
    anomalyIds: ['an1'],
  },
  {
    id: 'sc3', storeId: 's3', storeName: '浦东陆家嘴院', date: '2025-06-15', assistantName: '陈晓燕', projectName: '线雕提升',
    result: 'pass', photos: [{ url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=organized+surgical+instrument+tray+with+counted+tools+and+checklist+on+sterile+blue+draping&image_size=landscape_4_3', caption: '器械清点表' }],
    audioSummary: '术前器械清点规范，线材批号记录完整，术后交接顺利', signatureConfirmed: true, notes: '操作规范', createdAt: '2025-06-15',
  },
  {
    id: 'sc4', storeId: 's6', storeName: '福田中心院', date: '2025-06-16', assistantName: '谢敏', projectName: '双眼皮手术',
    result: 'warning', photos: [{ url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=surgical+room+with+instrument+counting+board+showing+minor+discrepancy+marked+in+yellow&image_size=landscape_4_3', caption: '器械清点现场' }],
    audioSummary: '器械清点发现微小差异，经核实后确认无遗漏', signatureConfirmed: true, notes: '需关注器械清点流程的精确性', createdAt: '2025-06-16',
  },
  {
    id: 'sc5', storeId: 's5', storeName: '天河珠江新城院', date: '2025-06-14', assistantName: '周美玲', projectName: '热玛吉',
    result: 'pass', photos: [{ url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern+esthetic+clinic+treatment+room+with+laser+device+and+treatment+parameter+screen+display&image_size=landscape_4_3', caption: '设备参数显示' }],
    audioSummary: '治疗参数记录完整，知情同意书术前签署，操作规范', signatureConfirmed: true, notes: '操作规范', createdAt: '2025-06-14',
  },
  {
    id: 'sc6', storeId: 's8', storeName: '渝北金开院', date: '2025-06-19', assistantName: '邓晓雯', projectName: '热玛吉',
    result: 'fail', photos: [{ url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=medical+record+form+with+blank+empty+fields+highlighted+with+red+warning+markers&image_size=landscape_4_3', caption: '参数记录不完整' }],
    audioSummary: '热玛吉能量等级和发数未记录，需整改', signatureConfirmed: false, notes: '已关联异常派发整改任务', createdAt: '2025-06-19',
    anomalyIds: ['an3'],
  },
  {
    id: 'sc7', storeId: 's2', storeName: '海淀学院院', date: '2025-06-17', assistantName: '杨静', projectName: '肉毒素注射',
    result: 'warning', photos: [{ url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=injection+site+marking+diagram+on+face+with+partially+unclear+markings+in+medical+chart&image_size=landscape_4_3', caption: '注射部位记录' }],
    audioSummary: '肉毒素注射部位记录不清晰，需补充完善', signatureConfirmed: true, notes: '建议规范注射部位记录方式', createdAt: '2025-06-17',
  },
  {
    id: 'sc8', storeId: 's7', storeName: '武侯锦江院', date: '2025-06-13', assistantName: '曹雨萱', projectName: '光子嫩肤',
    result: 'fail', photos: [{ url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=medical+consent+form+with+missing+signature+highlighted+with+red+circle+on+clinical+desk&image_size=landscape_4_3', caption: '知情同意书遗漏' }],
    audioSummary: '知情同意书未在术前签署，违反操作规范', signatureConfirmed: false, notes: '已关联异常派发整改任务', createdAt: '2025-06-13',
    anomalyIds: ['an7'],
  },
  {
    id: 'sc9', storeId: 's1', storeName: '朝阳旗舰院', date: '2025-06-10', assistantName: '李婷', projectName: '双眼皮手术',
    result: 'pass', photos: [{ url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=surgical+safety+checklist+fully+completed+with+green+checkmarks+on+clipboard&image_size=landscape_4_3', caption: '手术安全核对表' }],
    audioSummary: '术前核对完整，术中配合到位，术后交接规范', signatureConfirmed: true, notes: '操作规范', createdAt: '2025-06-10',
  },
  {
    id: 'sc10', storeId: 's3', storeName: '浦东陆家嘴院', date: '2025-06-08', assistantName: '刘敏', projectName: '吸脂手术',
    result: 'pass', photos: [{ url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=organized+surgical+back+table+with+neatly+arranged+instruments+and+complete+count+sheet&image_size=landscape_4_3', caption: '器械清点完毕' }],
    audioSummary: '吸脂手术全流程操作规范，器械清点准确，交接顺利', signatureConfirmed: true, notes: '操作规范', createdAt: '2025-06-08',
  },
  {
    id: 'sc11', storeId: 's5', storeName: '天河珠江新城院', date: '2025-06-05', assistantName: '吴秀英', projectName: '眼袋手术',
    result: 'warning', photos: [{ url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pre-operative+photography+setup+in+clinic+with+camera+on+tripod+and+patient+consent+board&image_size=landscape_4_3', caption: '术前拍照设置' }],
    audioSummary: '术前拍照环节曾遗漏，经提醒后补充完成', signatureConfirmed: true, notes: '需加强术前拍照意识', createdAt: '2025-06-05',
  },
  {
    id: 'sc12', storeId: 's6', storeName: '福田中心院', date: '2025-06-03', assistantName: '冯晓丽', projectName: '光子嫩肤',
    result: 'warning', photos: [{ url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=before+and+after+comparison+photo+display+screen+in+dermatology+clinic+with+one+side+missing&image_size=landscape_4_3', caption: '对比照展示' }],
    audioSummary: '治疗前后对比照遗漏，需补充存档', signatureConfirmed: true, notes: '已关联整改', createdAt: '2025-06-03',
  },
]
