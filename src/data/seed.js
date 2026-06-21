const followupStages = () => ([
  { id: 'pre-return', name: '归国前准备', nameEn: 'Pre-return preparation', period: '治疗结束前3天', frequency: '一次集中筹备', status: 'upcoming', owner: '健康管家', items: ['电子档案归集', '双语用药告知', '本地资源预约', '患者及家属培训'] },
  { id: 'adaptation', name: '归国适应期', nameEn: 'Return adaptation', period: '归国后1–7天', frequency: '每日联系', status: 'upcoming', owner: '健康管家＋本地医护', items: ['生命体征', '伤口与副作用', '用药核对', '保险材料'] },
  { id: 'short', name: '短期康复期', nameEn: 'Early rehabilitation', period: '1–3个月', frequency: '每3日跟进／每月会诊', status: 'upcoming', owner: '康复团队', items: ['康复训练', '检验复查', '心理与癌痛', '用药依从性'] },
  { id: 'stable', name: '中期稳定期', nameEn: 'Stable monitoring', period: '3个月–1年', frequency: '每月随访／每3月复查', status: 'upcoming', owner: '健康管家＋医生', items: ['复发预警', '影像复查', '营养运动', '远程专家会诊'] },
  { id: 'long', name: '长期随访期', nameEn: 'Long-term care', period: '1年以上', frequency: '每3月随访／年度筛查', status: 'upcoming', owner: '健康管理中心', items: ['终身健康档案', '年度复盘', '生活质量', '安宁疗护预案'] },
])

const scheduleFor = (start = '2026-06-28') => ([
  { id: 'admission', date: start, title: '入院及基线检查', status: 'planned' },
  { id: 'mdt', date: '2026-06-29', title: 'MDT复核与麻醉评估', status: 'planned' },
  { id: 'operation', date: '2026-07-01', title: '胸腔镜手术（拟）', status: 'planned' },
  { id: 'discharge', date: '2026-07-08', title: '出院评估与归国交接', status: 'planned' },
])

const baseReview = (overrides = {}) => ({
  status: 'unassigned', expert: '', specialty: '', summary: '', recommendation: '',
  hospital: '', meetingAt: '', version: 0, revisions: [], signedAt: null, ...overrides,
})

const baseTreatment = (overrides = {}) => ({
  status: 'not_requested', hospital: '', department: '', doctor: '', admissionDate: '',
  bed: '待确认', estimatedCost: '待评估', schedule: [], dischargeReady: false,
  dischargeChecklist: {
    summary: false, imaging: false, medication: false, followup: false, patientSigned: false,
  },
  ...overrides,
})

const baseBilling = (overrides = {}) => ({
  currency: 'CNY', estimateVersion: 1, estimatedMin: 0, estimatedMax: 0, paid: 0,
  patientConfirmed: false, insuranceStatus: 'not_started', payments: [], refunds: [],
  items: [], ...overrides,
})

const baseTravel = (overrides = {}) => ({
  status: 'not_started', visaStatus: 'not_started', flightStatus: 'not_booked',
  patientConfirmed: false, hospitalConfirmed: false, coordinator: 'Aisyah',
  itinerary: [], ...overrides,
})

const baseFollowup = (overrides = {}) => ({
  generated: false, status: 'not_started', stages: followupStages(), encounters: [],
  vitalSigns: [], medicationLogs: [], ...overrides,
})

const baseConsent = (overrides = {}) => ({
  status: 'pending', signedAt: null, revokedAt: null,
  scopes: ['malaysia'], version: 1, ...overrides,
})

const hospitalCandidate = (id, name, score, rank, department, expert, overrides = {}) => ({
  id, name, score, rank, department, expert,
  recommendation: rank === 1 ? '首选' : '备选',
  capability: [], matchReasons: [], constraints: [],
  bedStatus: '待确认', responseHours: 24, costMin: 0, costMax: 0,
  internationalService: '双语协调', status: 'candidate', ...overrides,
})

const cases = {
  'AGH-MY-2026-0018': {
    id: 'AGH-MY-2026-0018',
    review: baseReview({
      status: 'in_review', expert: '张建国 主任', specialty: '胸外科',
      summary: '影像提示右上肺原发灶伴纵隔淋巴结转移，需结合分子检测和肺功能评估确定综合治疗路径。',
      meetingAt: '2026-06-22T15:00:00+08:00', version: 1,
    }),
    treatment: baseTreatment({
      status: 'planning', hospital: '广州医科大学附属第一医院', department: '胸外科',
      doctor: '张建国 主任', admissionDate: '2026-06-28', estimatedCost: '¥180,000–230,000',
      schedule: scheduleFor(),
    }),
    billing: baseBilling({
      estimatedMin: 180000, estimatedMax: 230000,
      items: [
        { id: 'BI-1', name: '检查费用', amountMin: 18500, amountMax: 18500 },
        { id: 'BI-2', name: '手术及住院', amountMin: 148000, amountMax: 188000 },
        { id: 'BI-3', name: '药品及其他', amountMin: 13500, amountMax: 23500 },
      ],
    }),
    travel: baseTravel({
      status: 'planning', visaStatus: 'approved', flightStatus: 'held',
      hospitalConfirmed: false, itinerary: [
        { id: 'FLIGHT', title: '吉隆坡 → 广州', date: '2026-06-27', status: 'held' },
        { id: 'PICKUP', title: '白云机场专车接送', date: '2026-06-27', status: 'planned' },
      ],
    }),
    followup: baseFollowup(),
    consent: baseConsent({ status: 'active', signedAt: '2026-06-19T14:30:00+08:00', scopes: ['malaysia', 'china', 'expert', 'hospital'] }),
    hospitalMatching: {
      status: 'ready', selectedHospitalId: null, requestedAt: null,
      candidates: [
        hospitalCandidate('HOS-GZFAH', '广州医科大学附属第一医院', 94, 1, '胸外科', '张建国 主任', {
          capability: ['国家呼吸医学中心', '胸部肿瘤 MDT', '复杂胸外科手术'],
          matchReasons: ['与专家评审专科一致', '肺癌手术及纵隔分期经验丰富', '可提供国际患者双语协调'],
          constraints: ['需完成 EBUS 与肺功能评估后最终确认手术方案'],
          bedStatus: '预计 3 日内可预留', responseHours: 24, costMin: 180000, costMax: 230000,
        }),
        hospitalCandidate('HOS-SYSUCC', '中山大学肿瘤防治中心', 88, 2, '胸科', '周敏 教授', {
          capability: ['肿瘤专科 MDT', '精准治疗', '放化疗综合治疗'],
          matchReasons: ['适合需要多学科综合治疗的 IIIB 期肺癌', '分子诊断与临床试验资源较强'],
          constraints: ['床位和首次会诊响应预计较慢'],
          bedStatus: '床位待排期', responseHours: 48, costMin: 200000, costMax: 260000,
        }),
        hospitalCandidate('HOS-NFYY', '南方医科大学南方医院', 82, 3, '胸外科', '陈力 主任', {
          capability: ['综合医院多学科资源', '胸部肿瘤放疗', '国际医疗服务'],
          matchReasons: ['检查资源齐全', '可快速组织多学科复核'],
          constraints: ['主评专家与接诊团队并非同一机构'],
          bedStatus: '有床位', responseHours: 24, costMin: 160000, costMax: 220000,
        }),
      ],
    },
    notes: [], attachments: [], messages: [],
  },
  'AGH-MY-2026-0021': {
    id: 'AGH-MY-2026-0021', review: baseReview(), treatment: baseTreatment(),
    billing: baseBilling(), travel: baseTravel(), followup: baseFollowup(),
    consent: baseConsent(),
    hospitalMatching: {
      status: 'waiting_review', selectedHospitalId: null, requestedAt: null,
      candidates: [
        hospitalCandidate('HOS-SYSUCC', '中山大学肿瘤防治中心', 91, 1, '胃外科', '梁寒 教授', {
          capability: ['胃癌规范化诊疗', '腹腔镜胃癌手术', '肿瘤内外科 MDT'],
          matchReasons: ['胃癌专科病例量较高', '适合完成分期后制定综合方案'],
          constraints: ['患者尚未完成分期，评分为初步结果'],
          bedStatus: '需完成分期后确认', responseHours: 48, costMin: 150000, costMax: 210000,
        }),
        hospitalCandidate('HOS-NFYY', '南方医科大学南方医院', 84, 2, '普通外科', '李国新 主任', {
          capability: ['微创胃肠外科', '综合检查能力', '国际医疗中心'],
          matchReasons: ['微创手术能力匹配', '入院前检查安排较灵活'],
          constraints: ['需先明确是否存在远处转移'],
          bedStatus: '预计 5 日内', responseHours: 24, costMin: 130000, costMax: 190000,
        }),
      ],
    },
    notes: [], attachments: [], messages: [],
  },
  'AGH-MY-2026-0012': {
    id: 'AGH-MY-2026-0012',
    review: baseReview({ status: 'completed', expert: '周敏 教授', specialty: '乳腺肿瘤内科', recommendation: '维持内分泌治疗并按期复查。', version: 2, signedAt: '2026-05-20T16:00:00+08:00' }),
    treatment: baseTreatment({ status: 'post_operation', hospital: '中山大学肿瘤防治中心', department: '乳腺科', doctor: '周敏 教授', admissionDate: '2026-05-25', bed: '已出院', estimatedCost: '¥120,000–150,000', schedule: scheduleFor('2026-05-25'), dischargeReady: true, dischargeChecklist: { summary: true, imaging: true, medication: true, followup: true, patientSigned: true } }),
    billing: baseBilling({ estimatedMin: 120000, estimatedMax: 150000, paid: 145000, patientConfirmed: true, insuranceStatus: 'submitted', payments: [{ id: 'PAY-12-1', amount: 145000, method: 'bank_transfer', paidAt: '2026-05-24' }] }),
    travel: baseTravel({ status: 'completed', visaStatus: 'approved', flightStatus: 'completed', patientConfirmed: true, hospitalConfirmed: true }),
    followup: baseFollowup({ generated: true, status: 'active', stages: followupStages().map((stage, index) => ({ ...stage, status: index === 1 ? 'active' : index < 1 ? 'completed' : 'upcoming' })) }),
    consent: baseConsent({ status: 'active', signedAt: '2026-05-10T10:00:00+08:00', scopes: ['malaysia', 'china', 'expert', 'hospital', 'health'] }),
    hospitalMatching: {
      status: 'accepted', selectedHospitalId: 'HOS-SYSUCC', requestedAt: '2026-05-20T17:00:00+08:00',
      candidates: [
        hospitalCandidate('HOS-SYSUCC', '中山大学肿瘤防治中心', 96, 1, '乳腺科', '周敏 教授', {
          recommendation: '已选择', capability: ['乳腺癌专科', '术后辅助治疗', '精准分型'],
          matchReasons: ['专家与医院团队一致', '适合术后系统治疗和长期管理'],
          bedStatus: '已承接', responseHours: 12, costMin: 120000, costMax: 150000, status: 'accepted',
        }),
        hospitalCandidate('HOS-NFYY', '南方医科大学南方医院', 85, 2, '乳腺中心', '叶长生 主任', {
          capability: ['乳腺外科', '整形修复', '综合治疗'],
          matchReasons: ['综合医院支持能力较强'], constraints: ['并非原评审团队'],
          bedStatus: '可协调', responseHours: 24, costMin: 110000, costMax: 145000,
        }),
      ],
    },
    notes: [], attachments: [], messages: [],
  },
  'AGH-MY-2026-0007': {
    id: 'AGH-MY-2026-0007',
    review: baseReview({ status: 'completed', expert: '陈力 主任', specialty: '妇科肿瘤', recommendation: '归国后持续监测 CA-125，异常时复评。', version: 3, signedAt: '2025-12-08T10:00:00+08:00' }),
    treatment: baseTreatment({ status: 'completed', hospital: '南方医科大学南方医院', department: '妇科肿瘤', doctor: '陈力 主任', admissionDate: '2025-12-12', bed: '已出院', estimatedCost: '¥160,000–190,000', dischargeReady: true, dischargeChecklist: { summary: true, imaging: true, medication: true, followup: true, patientSigned: true } }),
    billing: baseBilling({ estimatedMin: 160000, estimatedMax: 190000, paid: 182000, patientConfirmed: true, insuranceStatus: 'approved' }),
    travel: baseTravel({ status: 'completed', visaStatus: 'approved', flightStatus: 'completed', patientConfirmed: true, hospitalConfirmed: true }),
    followup: baseFollowup({ generated: true, status: 'alert', stages: followupStages().map((stage, index) => ({ ...stage, status: index === 2 ? 'active' : index < 2 ? 'completed' : 'upcoming' })) }),
    consent: baseConsent({ status: 'active', signedAt: '2025-11-28T10:00:00+08:00', scopes: ['malaysia', 'china', 'expert', 'hospital', 'health'] }),
    hospitalMatching: {
      status: 'completed', selectedHospitalId: 'HOS-NFYY', requestedAt: '2025-12-08T15:00:00+08:00',
      candidates: [
        hospitalCandidate('HOS-NFYY', '南方医科大学南方医院', 92, 1, '妇科肿瘤', '陈力 主任', {
          recommendation: '已选择', capability: ['妇科肿瘤手术', '复发风险管理', '综合治疗'],
          matchReasons: ['与主评专家团队一致', '适合卵巢癌综合治疗'],
          bedStatus: '已完成治疗', responseHours: 12, costMin: 160000, costMax: 190000, status: 'completed',
        }),
        hospitalCandidate('HOS-SYSUCC', '中山大学肿瘤防治中心', 89, 2, '妇科', '刘继红 教授', {
          capability: ['妇科肿瘤专科', '复发卵巢癌 MDT'], matchReasons: ['专科能力匹配'],
          constraints: ['床位排期较长'], bedStatus: '排期较长', responseHours: 48, costMin: 180000, costMax: 230000,
        }),
      ],
    },
    notes: [], attachments: [], messages: [],
  },
}

export const seedState = {
  schemaVersion: 4,
  language: 'zh',
  activeCaseId: 'AGH-MY-2026-0018',
  currentUsers: {
    patient: { name: '林秀英', role: '患者', organization: 'AGH Patient Services' },
    malaysia: { name: 'Aisyah Rahman', role: '患者服务顾问', organization: 'AGH Malaysia' },
    china: { name: '李雯', role: '跨境诊疗协调员', organization: 'AGH China Operations' },
    expert: { name: '张建国', role: '胸外科主任医师', organization: '广州医科大学附属第一医院' },
    hospital: { name: '刘敏', role: '国际医疗协调员', organization: '国际医疗中心' },
    health: { name: 'Farah Lim', role: '归国健康管家', organization: 'AGH Health Management' },
  },
  permissions: {
    patient: ['view_own_case', 'upload_document', 'confirm_plan', 'confirm_travel', 'send_message'],
    malaysia: ['create_patient', 'edit_patient', 'upload_document', 'submit_case', 'manage_consent', 'export_case'],
    china: ['verify_document', 'publish_summary', 'assign_expert', 'request_hospital', 'manage_handoff', 'export_case'],
    expert: ['view_clinical', 'request_document', 'edit_review', 'sign_review', 'create_mdt'],
    hospital: ['view_authorized_case', 'respond_intake', 'manage_schedule', 'manage_billing', 'complete_discharge'],
    health: ['view_discharge_case', 'manage_followup', 'manage_medication', 'manage_alert', 'close_alert'],
  },
  patients: [
    { id: 'P-0018', caseId: 'AGH-MY-2026-0018', name: '林秀英', englishName: 'Lim Siew Eng', age: 52, gender: 'female', country: 'Malaysia', city: 'Kuala Lumpur', language: 'zh', phone: '+60 12-*** 8861', diagnosis: '肺腺癌 IIIB期', diagnosisEn: 'Stage IIIB lung adenocarcinoma', phase: 'review', phaseLabel: '专家评审', completeness: 86, owner: 'Aisyah', risk: 'high', avatar: '林', source: 'Facebook', updatedAt: '2026-06-21T10:32:00+08:00' },
    { id: 'P-0021', caseId: 'AGH-MY-2026-0021', name: '陈伟强', englishName: 'Tan Wei Keong', age: 61, gender: 'male', country: 'Malaysia', city: 'Penang', language: 'en', phone: '+60 12-*** 1120', diagnosis: '胃癌待分期', diagnosisEn: 'Gastric cancer, staging pending', phase: 'lead', phaseLabel: '新咨询', completeness: 35, owner: 'Nur', risk: 'normal', avatar: '陈', source: 'TikTok', updatedAt: '2026-06-21T09:10:00+08:00' },
    { id: 'P-0012', caseId: 'AGH-MY-2026-0012', name: '王美玲', englishName: 'Ong Mei Ling', age: 47, gender: 'female', country: 'Malaysia', city: 'Johor Bahru', language: 'zh', phone: '+60 17-*** 2291', diagnosis: '乳腺癌术后', diagnosisEn: 'Post-operative breast cancer', phase: 'followup', phaseLabel: '归国随访', completeness: 100, owner: 'Aisyah', risk: 'normal', avatar: '王', source: 'Referral', updatedAt: '2026-06-20T18:22:00+08:00' },
    { id: 'P-0007', caseId: 'AGH-MY-2026-0007', name: '黄丽珍', englishName: 'Wong Lai Zhen', age: 58, gender: 'female', country: 'Malaysia', city: 'Kuching', language: 'zh', phone: '+60 16-*** 8802', diagnosis: '卵巢癌复查异常', diagnosisEn: 'Ovarian cancer, abnormal follow-up', phase: 'followup', phaseLabel: '高危随访', completeness: 100, owner: 'Farah', risk: 'critical', avatar: '黄', source: 'Referral', updatedAt: '2026-06-21T08:45:00+08:00' },
  ],
  leads: [
    { id: 'LEAD-260621-01', name: '陈伟强', source: 'TikTok', disease: '胃癌', phone: '+60 12-*** 1120', status: '待联系', owner: 'Nur', note: '' },
    { id: 'LEAD-260621-04', name: 'Siti Aminah', source: 'Facebook', disease: '乳腺癌', phone: '+60 13-*** 6721', status: '待联系', owner: 'Nur', note: '' },
    { id: 'LEAD-260621-05', name: 'Lee Kok Wai', source: 'WhatsApp', disease: '肺癌', phone: '+60 19-*** 3342', status: '跟进中', owner: 'Aisyah', note: '已完成初次沟通' },
    { id: 'LEAD-260621-02', name: 'Mohd Azlan', source: 'Facebook', disease: '肝癌', phone: '+60 17-*** 2198', status: '已预约', owner: 'Aisyah', note: '已预约视频咨询' },
    { id: 'LEAD-260620-09', name: '黄丽珍', source: '患者转介绍', disease: '卵巢癌', phone: '+60 16-*** 8802', status: '已转患者', owner: 'Farah', note: '' },
  ],
  resources: [
    { id: 'RES-001', name: 'Sunway Medical Centre', type: '医院', city: 'Kuala Lumpur', capability: '肿瘤复查 / 急诊', status: '合作中', contact: 'Dr. Lee' },
    { id: 'RES-008', name: 'BP Healthcare Bangsar', type: '检验中心', city: 'Kuala Lumpur', capability: '血液 / 肿瘤标志物', status: '可预约', contact: 'Ms. Tan' },
    { id: 'RES-011', name: 'Health Lane Pharmacy', type: '药房', city: 'Kuala Lumpur', capability: '处方药 / 冷链配送', status: '合作中', contact: 'Mr. Wong' },
    { id: 'RES-015', name: 'ReGen Rehab Centre', type: '康复机构', city: 'Petaling Jaya', capability: '术后康复 / 营养', status: '合作中', contact: 'Farah' },
    { id: 'RES-022', name: 'AIA Malaysia Medical', type: '保险', city: 'Malaysia', capability: '理赔预审 / 文件协助', status: '合作中', contact: 'Ms. Lim' },
  ],
  appointments: [],
  rehabAssessments: [],
  qualityReports: [],
  cases,
  documents: [
    { id: 'D1', caseId: 'AGH-MY-2026-0018', type: '病理报告', name: '肺穿刺病理报告.pdf', language: 'zh', source: '患者上传', status: 'verified', version: 2, originalId: 'ORIG-D1', translationStatus: 'not_required', medicalVerification: 'verified', authorizationScopes: ['patient', 'malaysia', 'china', 'expert', 'hospital'], downloadCount: 2, voidedAt: null },
    { id: 'D2', caseId: 'AGH-MY-2026-0018', type: '影像资料', name: 'PET-CT影像与报告.zip', language: 'en', source: '马来医院', status: 'verified', version: 1, originalId: 'ORIG-D2', translationStatus: 'completed', medicalVerification: 'verified', authorizationScopes: ['patient', 'malaysia', 'china', 'expert', 'hospital'], downloadCount: 4, voidedAt: null },
    { id: 'D3', caseId: 'AGH-MY-2026-0018', type: '检验报告', name: '血常规与肝肾功能.pdf', language: 'en', source: '患者上传', status: 'translated', version: 1, originalId: 'ORIG-D3', translationStatus: 'completed', medicalVerification: 'pending', authorizationScopes: ['patient', 'malaysia', 'china', 'expert'], downloadCount: 1, voidedAt: null },
    { id: 'D4', caseId: 'AGH-MY-2026-0018', type: '咨询表', name: 'Cancer Consultation Form.pdf', language: 'bilingual', source: '马来服务端', status: 'verified', version: 3, originalId: 'ORIG-D4', translationStatus: 'not_required', medicalVerification: 'verified', authorizationScopes: ['patient', 'malaysia', 'china', 'expert', 'hospital'], downloadCount: 5, voidedAt: null },
    { id: 'D5', caseId: 'AGH-MY-2026-0018', type: '授权书', name: '跨境数据授权书.pdf', language: 'bilingual', source: '患者签署', status: 'verified', version: 1, originalId: 'ORIG-D5', translationStatus: 'not_required', medicalVerification: 'verified', authorizationScopes: ['patient', 'malaysia', 'china', 'expert', 'hospital'], downloadCount: 2, voidedAt: null },
  ],
  tasks: [
    { id: 'T-101', caseId: 'AGH-MY-2026-0018', title: '补充最新肿瘤标志物报告', from: 'china', to: 'malaysia', owner: 'Aisyah', dueAt: '2026-06-21T18:00:00+08:00', status: 'pending', priority: 'high', comments: [], attachments: [], slaPausedAt: null },
    { id: 'T-102', caseId: 'AGH-MY-2026-0018', title: '完成中文病历摘要', from: 'malaysia', to: 'china', owner: '李雯', dueAt: '2026-06-22T10:00:00+08:00', status: 'done', priority: 'normal', comments: [], attachments: [], slaPausedAt: null },
    { id: 'T-103', caseId: 'AGH-MY-2026-0018', title: '提交专家评审意见', from: 'china', to: 'expert', owner: '张主任', dueAt: '2026-06-22T18:00:00+08:00', status: 'pending', priority: 'urgent', comments: [], attachments: [], slaPausedAt: null },
    { id: 'T-104', caseId: 'AGH-MY-2026-0018', title: '预留胸外科床位', from: 'china', to: 'hospital', owner: '刘协调员', dueAt: '2026-06-24T18:00:00+08:00', status: 'blocked', priority: 'normal', comments: [], attachments: [], slaPausedAt: '2026-06-21T11:00:00+08:00' },
  ],
  alerts: [
    { id: 'A-07', caseId: 'AGH-MY-2026-0007', patient: '黄丽珍', type: '复查异常', severity: 'critical', detail: 'CA-125 连续两次升高，需在12小时内发起专家复评', status: 'open', createdAt: '2026-06-21T08:45:00+08:00', resolution: '', assignedTo: 'Farah' },
    { id: 'A-12', caseId: 'AGH-MY-2026-0012', patient: '王美玲', type: '用药提醒', severity: 'medium', detail: '连续2次未确认服药', status: 'open', createdAt: '2026-06-20T20:10:00+08:00', resolution: '', assignedTo: 'Aina' },
  ],
  notifications: [
    { id: 'N-1', to: 'expert', title: '主案例评审即将到期', read: false, createdAt: '2026-06-21T10:30:00+08:00' },
    { id: 'N-2', to: 'health', title: '高危预警待处置', read: false, createdAt: '2026-06-21T08:45:00+08:00' },
  ],
  events: [
    { id: 1, caseId: 'AGH-MY-2026-0018', at: '2026-06-18T09:12:00+08:00', actor: '患者', system: 'patient', title: '提交在线咨询', detail: '完成基础信息及病情描述' },
    { id: 2, caseId: 'AGH-MY-2026-0018', at: '2026-06-18T10:05:00+08:00', actor: 'Aisyah', system: 'malaysia', title: '建立患者档案', detail: '生成 Case AGH-MY-2026-0018' },
    { id: 3, caseId: 'AGH-MY-2026-0018', at: '2026-06-19T14:30:00+08:00', actor: '患者', system: 'patient', title: '签署数据授权', detail: '授权中马团队按角色访问资料' },
    { id: 4, caseId: 'AGH-MY-2026-0018', at: '2026-06-20T11:20:00+08:00', actor: '李雯', system: 'china', title: '完成病历整理', detail: '形成中文结构化摘要 v1' },
    { id: 5, caseId: 'AGH-MY-2026-0018', at: '2026-06-21T10:32:00+08:00', actor: '系统', system: 'expert', title: '进入专家评审', detail: '已分配张建国主任' },
  ],
}
