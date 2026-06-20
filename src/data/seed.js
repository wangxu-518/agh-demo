export const seedState = {
  language: 'zh',
  activeCaseId: 'AGH-MY-2026-0018',
  patients: [
    {
      id: 'P-0018', caseId: 'AGH-MY-2026-0018', name: '林秀英', englishName: 'Lim Siew Eng',
      age: 52, gender: 'female', country: 'Malaysia', city: 'Kuala Lumpur', language: 'zh',
      phone: '+60 12-*** 8861', diagnosis: '肺腺癌 IIIB期', diagnosisEn: 'Stage IIIB lung adenocarcinoma',
      phase: 'review', phaseLabel: '专家评审', completeness: 86, consent: true, owner: 'Aisyah',
      risk: 'high', avatar: '林', source: 'Facebook', updatedAt: '今天 10:32',
    },
    {
      id: 'P-0021', caseId: 'AGH-MY-2026-0021', name: '陈伟强', englishName: 'Tan Wei Keong',
      age: 61, gender: 'male', country: 'Malaysia', city: 'Penang', language: 'en',
      diagnosis: '胃癌待分期', diagnosisEn: 'Gastric cancer, staging pending',
      phase: 'lead', phaseLabel: '新咨询', completeness: 35, consent: false, owner: 'Nur',
      risk: 'normal', avatar: '陈', source: 'TikTok', updatedAt: '今天 09:10',
    },
    {
      id: 'P-0012', caseId: 'AGH-MY-2026-0012', name: '王美玲', englishName: 'Ong Mei Ling',
      age: 47, gender: 'female', country: 'Malaysia', city: 'Johor Bahru', language: 'zh',
      diagnosis: '乳腺癌术后', diagnosisEn: 'Post-operative breast cancer',
      phase: 'treatment', phaseLabel: '在华治疗', completeness: 100, consent: true, owner: 'Aisyah',
      risk: 'normal', avatar: '王', source: 'Referral', updatedAt: '昨天 18:22',
    },
    {
      id: 'P-0007', caseId: 'AGH-MY-2026-0007', name: '黄丽珍', englishName: 'Wong Lai Zhen',
      age: 58, gender: 'female', country: 'Malaysia', city: 'Kuching', language: 'zh',
      diagnosis: '卵巢癌复查异常', diagnosisEn: 'Ovarian cancer, abnormal follow-up',
      phase: 'followup', phaseLabel: '高危随访', completeness: 100, consent: true, owner: 'Farah',
      risk: 'critical', avatar: '黄', source: 'Referral', updatedAt: '今天 08:45',
    },
  ],
  documents: [
    { id: 'D1', caseId: 'AGH-MY-2026-0018', type: '病理报告', name: '肺穿刺病理报告.pdf', language: 'zh', source: '患者上传', status: 'verified', version: 2 },
    { id: 'D2', caseId: 'AGH-MY-2026-0018', type: '影像资料', name: 'PET-CT影像与报告.zip', language: 'en', source: '马来医院', status: 'verified', version: 1 },
    { id: 'D3', caseId: 'AGH-MY-2026-0018', type: '检验报告', name: '血常规与肝肾功能.pdf', language: 'en', source: '患者上传', status: 'translated', version: 1 },
    { id: 'D4', caseId: 'AGH-MY-2026-0018', type: '咨询表', name: 'Cancer Consultation Form.pdf', language: 'bilingual', source: '马来服务端', status: 'verified', version: 3 },
    { id: 'D5', caseId: 'AGH-MY-2026-0018', type: '授权书', name: '跨境数据授权书.pdf', language: 'bilingual', source: '患者签署', status: 'verified', version: 1 },
  ],
  tasks: [
    { id: 'T-101', caseId: 'AGH-MY-2026-0018', title: '补充最新肿瘤标志物报告', from: 'china', to: 'malaysia', owner: 'Aisyah', due: '今天 18:00', status: 'pending', priority: 'high' },
    { id: 'T-102', caseId: 'AGH-MY-2026-0018', title: '完成中文病历摘要', from: 'malaysia', to: 'china', owner: '李雯', due: '明天 10:00', status: 'done', priority: 'normal' },
    { id: 'T-103', caseId: 'AGH-MY-2026-0018', title: '提交专家评审意见', from: 'china', to: 'expert', owner: '张主任', due: '明天 18:00', status: 'pending', priority: 'urgent' },
    { id: 'T-104', caseId: 'AGH-MY-2026-0018', title: '预留胸外科床位', from: 'china', to: 'hospital', owner: '刘协调员', due: '6月24日', status: 'blocked', priority: 'normal' },
  ],
  review: {
    status: 'in_review', expert: '张建国 主任', specialty: '胸外科',
    summary: '影像提示右上肺原发灶伴纵隔淋巴结转移，需结合分子检测和肺功能评估确定综合治疗路径。',
    recommendation: '', hospital: '', meetingAt: '2026-06-22 15:00', version: 1,
  },
  treatment: {
    status: 'planning', hospital: '广州医科大学附属第一医院', department: '胸外科',
    doctor: '张建国 主任', admissionDate: '2026-06-28', bed: '待确认',
    estimatedCost: '¥180,000–230,000', paid: 0,
    schedule: [
      { date: '6月28日', title: '入院及基线检查', status: 'planned' },
      { date: '6月29日', title: 'MDT复核与麻醉评估', status: 'planned' },
      { date: '7月1日', title: '胸腔镜手术（拟）', status: 'planned' },
      { date: '7月8日', title: '出院评估与归国交接', status: 'planned' },
    ],
  },
  followup: {
    generated: false,
    stages: [
      { id: 'pre-return', name: '归国前准备', nameEn: 'Pre-return preparation', period: '治疗结束前3天', frequency: '一次集中筹备', status: 'upcoming', owner: '健康管家', items: ['电子档案归集', '双语用药告知', '本地资源预约', '患者及家属培训'] },
      { id: 'adaptation', name: '归国适应期', nameEn: 'Return adaptation', period: '归国后1–7天', frequency: '每日联系', status: 'upcoming', owner: '健康管家＋本地医护', items: ['生命体征', '伤口与副作用', '用药核对', '保险材料'] },
      { id: 'short', name: '短期康复期', nameEn: 'Early rehabilitation', period: '1–3个月', frequency: '每3日跟进／每月会诊', status: 'upcoming', owner: '康复团队', items: ['康复训练', '检验复查', '心理与癌痛', '用药依从性'] },
      { id: 'stable', name: '中期稳定期', nameEn: 'Stable monitoring', period: '3个月–1年', frequency: '每月随访／每3月复查', status: 'upcoming', owner: '健康管家＋医生', items: ['复发预警', '影像复查', '营养运动', '远程专家会诊'] },
      { id: 'long', name: '长期随访期', nameEn: 'Long-term care', period: '1年以上', frequency: '每3月随访／年度筛查', status: 'upcoming', owner: '健康管理中心', items: ['终身健康档案', '年度复盘', '生活质量', '安宁疗护预案'] },
    ],
  },
  alerts: [
    { id: 'A-07', caseId: 'AGH-MY-2026-0007', patient: '黄丽珍', type: '复查异常', severity: 'critical', detail: 'CA-125 连续两次升高，需在12小时内发起专家复评', status: 'open', createdAt: '今天 08:45' },
    { id: 'A-12', caseId: 'AGH-MY-2026-0012', patient: '王美玲', type: '用药提醒', severity: 'medium', detail: '连续2次未确认服药', status: 'open', createdAt: '昨天 20:10' },
  ],
  events: [
    { id: 1, at: '06-18 09:12', actor: '患者', system: 'patient', title: '提交在线咨询', detail: '完成基础信息及病情描述' },
    { id: 2, at: '06-18 10:05', actor: 'Aisyah', system: 'malaysia', title: '建立患者档案', detail: '生成 Case AGH-MY-2026-0018' },
    { id: 3, at: '06-19 14:30', actor: '患者', system: 'patient', title: '签署数据授权', detail: '授权中马团队按角色访问资料' },
    { id: 4, at: '06-20 11:20', actor: '李雯', system: 'china', title: '完成病历整理', detail: '形成中文结构化摘要 v1' },
    { id: 5, at: '今天 10:32', actor: '系统', system: 'expert', title: '进入专家评审', detail: '已分配张建国主任，截止明日18:00' },
  ],
}
