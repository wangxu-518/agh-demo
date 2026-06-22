export const pageSchemas = {
  patient: {
    records: {
      eyebrow: 'PATIENT MEDICAL RECORDS', title: '我的医疗资料', description: '按资料类型查看上传、翻译、核验和授权状态',
      type: 'files', primary: ['上传新资料', 'uploadDocument'],
      filters: ['全部资料', '病理报告', '影像资料', '检验报告', '授权文件'],
    },
    plan: {
      eyebrow: 'TREATMENT PLAN', title: '治疗方案', description: '查看专家意见、推荐医院、治疗路径和费用预估',
      type: 'plan', primary: ['确认已阅读方案', 'confirmPlan'],
    },
    travel: {
      eyebrow: 'TRAVEL TO CHINA', title: '赴华行程', description: '签证、航班、接送、入院及陪同安排',
      type: 'journey', primary: ['确认全部行程', 'confirmTravel'],
    },
    followup: {
      eyebrow: 'RETURN FOLLOW-UP', title: '归国随访', description: '五阶段健康管理、用药提醒、复查与应急服务',
      type: 'stages', primary: ['确认本周随访', 'completeFollowup'],
    },
  },
  malaysia: {
    leads: {
      eyebrow: 'LEAD CRM', title: '咨询线索管理', description: '管理广告、WhatsApp、转介绍等渠道的患者咨询',
      type: 'table', primary: ['新建咨询线索', 'createLead'],
      metrics: [['今日新增','12'],['待首次联系','5'],['已预约咨询','8'],['本月转化率','31.6%']],
      filters: ['全部线索','待联系','跟进中','已预约','已转患者'],
      columns: ['姓名','来源','意向病种','联系电话','跟进状态','负责人'],
      rowSource: 'leads',
    },
    cases: {
      eyebrow: 'PATIENT & CASE', title: '患者与 Case', description: '管理患者主档、服务阶段、责任人和跨境 Case',
      type: 'table', primary: ['提交主案例', 'submitCase'],
      metrics: [['服务中患者','46'],['待提交 Case','7'],['中国评审中','12'],['本月赴华','9']],
      filters: ['全部患者','新咨询','专家评审','在华治疗','归国随访'],
      columns: ['患者','Case ID','诊断','当前阶段','服务负责人'],
      rowSource: 'patientCases',
    },
    documents: {
      eyebrow: 'DOCUMENT & CONTRACT', title: '资料与签约', description: '咨询表、合同、授权书和医疗资料的完整性管理',
      type: 'documents', primary: ['补齐并锁定资料', 'lockDocuments'],
      metrics: [['待补资料','7'],['待签合同','4'],['授权待确认','2'],['今日新增文件','18']],
    },
    tasks: {
      eyebrow: 'CROSS-BORDER COLLABORATION', title: '跨国协同', description: '查看中方退回项、跨团队任务、SLA和交接记录',
      type: 'tasks', primary: ['完成首个待办', 'completeMalaysiaTask'],
      metrics: [['我的待办','9'],['今日到期','3'],['等待中方','6'],['SLA达成率','96%']],
    },
    resources: {
      eyebrow: 'LOCAL RESOURCE NETWORK', title: '本地资源', description: '马来西亚医院、检验、药房、康复和保险资源',
      type: 'table', primary: ['预约首次复查', 'bookLocalResource'],
      metrics: [['合作机构','38'],['覆盖城市','8'],['可预约检验','26'],['本月服务','42']],
      filters: ['全部资源','医院','检验中心','药房','康复机构','保险'],
      columns: ['机构名称','类型','城市','服务能力','合作状态','联系人'],
      rowSource: 'resources',
    },
  },
  china: {
    intake: {
      eyebrow: 'CASE INTAKE', title: '病例接收', description: '核验授权、资料版本和中国诊疗服务准入条件',
      type: 'table', primary: ['确认接收病例', 'acceptChinaCase'],
      metrics: [['今日新病例','6'],['待核验','9'],['资料退回','3'],['平均接收时长','3.2h']],
      filters: ['待接收','核验中','已退回','已接收'],
      columns: ['患者','Case ID','来源国家','资料完整度','授权状态','优先级'],
      rowSource: 'chinaIntake',
    },
    records: {
      eyebrow: 'MEDICAL RECORD CENTER', title: '诊疗资料中心', description: '原始文件、翻译件、结构化摘要与版本留痕',
      type: 'documents', primary: ['发布中文摘要', 'publishSummary'],
      metrics: [['原始文件','15'],['待翻译','3'],['待医学核验','2'],['摘要版本','v2']],
    },
    experts: {
      eyebrow: 'EXPERT COORDINATION', title: '专家协调', description: '根据病种、职称、档期和 SLA 分配评审专家',
      type: 'table', primary: ['分配专家', 'assignExpert'],
      metrics: [['待分配病例','8'],['24h内到期','3'],['可用专家','26'],['本月完成评审','51']],
      filters: ['待分配','评审中','待MDT','已完成'],
      columns: ['专家','医院 / 科室','擅长领域','当前负载','最近可约','状态'],
      rows: [
        {id:'EXP-001',cells:['张建国 主任','广州医科大学附一院 · 胸外科','肺癌 / 胸腔镜','3例','明天 15:00','可分配']},
        {id:'EXP-014',cells:['周敏 教授','中山大学肿瘤医院 · 内科','肺癌精准治疗','5例','后天','接近满载']},
        {id:'EXP-021',cells:['陈力 主任','南方医院 · 放疗科','胸部肿瘤放疗','2例','明天 17:00','可分配']},
      ],
    },
    hospitals: {
      eyebrow: 'HOSPITAL MATCHING', title: '医院匹配', description: '比较诊疗能力、专家、床位、费用和国际服务能力',
      type: 'comparison', primary: ['发送承接申请', 'requestHospital'],
      metrics: [['候选医院','4'],['可承接','3'],['床位待确认','1'],['预计响应','24h']],
    },
    handoff: {
      eyebrow: 'CROSS-BORDER HANDOVER', title: '跨国交接', description: '完成患者赴华前的人员、资料、行程和医院交接',
      type: 'case-list', primary: ['完成赴华交接', 'completeHandoff'],
      metrics: [['交接完成度','78%'],['待确认事项','4'],['距离入院','7天'],['参与角色','6']],
      filters: ['全部病例', '待交接', '交接中', '已完成'],
      columns: ['患者', 'Case ID', '诊断', '医院状态', '费用确认', '行程确认', '交接状态'],
      rowSource: 'handoffCases',
    },
  },
  expert: {
    queue: {
      eyebrow: 'REVIEW QUEUE', title: '待评审病例', description: '按紧急度、病种、资料完整度和截止时间处理评审',
      type: 'table', primary: ['接收主案例', 'claimReview'],
      metrics: [['待评审','7'],['今日到期','2'],['高优先级','3'],['平均完成时间','18h']],
      filters: ['全部','待接收','评审中','资料待补','即将超时'],
      columns: ['患者','Case ID','诊断','资料完整度','截止时间','优先级'],
      rowSource: 'expertQueue',
    },
    case: {
      eyebrow: 'CASE REVIEW', title: '病例详情', description: '结构化病历、原始资料、关键影像、检查缺口和评审意见',
      type: 'case-list', primary: ['提交评审意见', 'finishReview'],
      filters: ['全部病例', '待接收', '评审中', '待补资料', '已完成'],
      columns: ['患者', 'Case ID', '诊断', '资料完整度', '评审专家', '评审状态', '意见版本'],
      rowSource: 'expertCases',
    },
    mdt: {
      eyebrow: 'MULTIDISCIPLINARY TEAM', title: 'MDT 会诊', description: '管理议题、参会专家、会议记录和多学科结论',
      type: 'case-list', primary: ['完成 MDT', 'finishMdt'],
      metrics: [['今日会议','3'],['待确认专家','2'],['待出具纪要','1'],['本月MDT','22']],
      filters: ['全部会议', '待安排', '待召开', '已完成'],
      columns: ['患者', 'Case ID', '诊断', '会议时间', '牵头专家', '参会科室', '会议状态'],
      rowSource: 'mdtCases',
    },
    history: {
      eyebrow: 'REVIEW HISTORY', title: '历史评审', description: '检索意见版本、复查解读、修改记录和引用历史',
      type: 'table', primary: ['复制为新评审', 'copyReview'],
      filters: ['全部评审','初诊评审','MDT结论','复查解读'],
      columns: ['患者','评审类型','诊断','完成时间','意见版本','结论'],
      rows: [
        {id:'REV-2026-081',cells:['刘佳明','初诊评审','肺鳞癌','近一周','v1','建议先行新辅助治疗']},
        {id:'REV-2026-076',cells:['王美玲','复查解读','乳腺癌术后','上周','v2','未见明确复发证据']},
        {id:'REV-2026-069',cells:['黄丽珍','MDT结论','卵巢癌','近期历史','v1','建议补充PET-CT后复评']},
      ],
    },
  },
  hospital: {
    intake: {
      eyebrow: 'INTAKE REQUESTS', title: '接诊申请', description: '审核患者信息、专家意见、预计入院日期与费用',
      type: 'table', primary: ['确认承接', 'acceptHospital'],
      metrics: [['待审核申请','5'],['今日新增','2'],['床位待协调','3'],['已确认赴院','8']],
      filters: ['待审核','协调中','已承接','已拒绝'],
      columns: ['患者','Case ID','诊断','推荐科室','拟入院日期','申请状态'],
      rowSource: 'hospitalIntake',
    },
    schedule: {
      eyebrow: 'BED & SCHEDULE', title: '床位与日程', description: '协调病区床位、检查、手术、会诊和出院日程',
      type: 'case-list', primary: ['确认日程', 'confirmSchedule'],
      metrics: [['国际床位','12'],['已占用','8'],['本周入院','6'],['手术排期','9']],
      filters: ['全部患者', '待排期', '已确认', '进行中', '已结束'],
      columns: ['患者', 'Case ID', '科室', '床位', '入院日期', '已确认节点', '日程状态'],
      rowSource: 'scheduleCases',
    },
    inpatient: {
      eyebrow: 'INPATIENT MANAGEMENT', title: '在院管理', description: '追踪检查、治疗节点、病情沟通和家属同步',
      type: 'case-list', primary: ['推进至术后恢复', 'advanceTreatment'],
      metrics: [['在院国际患者','8'],['今日检查','12'],['今日手术','3'],['待沟通事项','5']],
      filters: ['全部患者', '待入院', '治疗中', '术后恢复', '待出院'],
      columns: ['患者', 'Case ID', '诊断', '科室/医生', '当前治疗状态', '最近节点', '风险'],
      rowSource: 'inpatientCases',
    },
    billing: {
      eyebrow: 'BILLING MANAGEMENT', title: '费用管理', description: '管理预估、预付款、账单、发票与保险材料',
      type: 'case-list', primary: ['登记预付款', 'recordPayment'],
      metrics: [['费用预估','¥180k–230k'],['已收预付款','¥0'],['待确认账单','3'],['保险材料','待准备']],
      filters: ['全部患者', '待确认预估', '待付款', '部分付款', '已结清', '退款中'],
      columns: ['患者', 'Case ID', '费用预估', '已付款', '付款状态', '保险状态', '账单版本'],
      rowSource: 'billingCases',
    },
    discharge: {
      eyebrow: 'DISCHARGE HANDOVER', title: '出院交接', description: '交付双语出院资料、带药、复查计划和归国任务',
      type: 'case-list', primary: ['完成出院交接', 'completeDischarge'],
      metrics: [['预计出院','计划日程内'],['资料完成度','62%'],['待签字文件','3'],['归国任务','未创建']],
      filters: ['全部患者', '待准备', '待签收', '已交接'],
      columns: ['患者', 'Case ID', '治疗状态', '资料完成度', '患者签收', '健康任务', '交接状态'],
      rowSource: 'dischargeCases',
    },
  },
  health: {
    followups: {
      eyebrow: 'FOLLOW-UP PLANS', title: '随访计划', description: '按五阶段生成频次、项目、责任角色和提醒',
      type: 'case-list', primary: ['生成五阶段计划', 'generateFollowup'],
      metrics: [['管理中患者','126'],['今日随访','18'],['待制定计划','7'],['完成率','93%']],
      filters: ['全部患者', '待制定', '进行中', '高危', '已结束'],
      columns: ['患者', 'Case ID', '诊断', '当前阶段', '健康管家', '开放预警', '计划状态'],
      rowSource: 'followupCases',
    },
    medication: {
      eyebrow: 'MEDICATION MANAGEMENT', title: '用药管理', description: '管理用药方案、提醒、依从性、副作用和续药',
      type: 'table', primary: ['确认今日用药', 'confirmMedication'],
      metrics: [['用药中患者','84'],['今日未确认','6'],['副作用上报','3'],['待续方','5']],
      filters: ['全部患者','未确认','副作用','待续方'],
      columns: ['患者','药品 / 剂量','用法','今日确认','依从率','异常'],
      rows: [
        {id:'MED-001',cells:['林秀英','奥希替尼 80mg','每日一次','已确认','96%','无']},
        {id:'MED-012',cells:['王美玲','来曲唑 2.5mg','每日一次','未确认','82%','连续2次漏服']},
        {id:'MED-007',cells:['黄丽珍','奥拉帕利 300mg','每日两次','已确认','91%','轻度恶心']},
      ],
    },
    rehab: {
      eyebrow: 'REHABILITATION & NURSING', title: '康复与护理', description: '康复评估、训练、营养、伤口和生命体征管理',
      type: 'table', primary: ['完成康复评估', 'completeRehab'],
      metrics: [['康复计划','39'],['今日训练','16'],['护理上门','5'],['待评估','4']],
      columns: ['患者','康复阶段','本周目标','最近评估','执行人员','状态'],
      rowSource: 'rehabCases',
    },
    alerts: {
      eyebrow: 'ALERTS & EMERGENCY', title: '预警与应急', description: '分级处理复查异常、用药风险、急症和服务事件',
      type: 'alerts', primary: ['升级首个预警', 'escalateAlert'],
      metrics: [['开放预警','8'],['高危','2'],['12h内到期','3'],['本月闭环率','97%']],
    },
    quality: {
      eyebrow: 'SERVICE QUALITY', title: '服务质控', description: '随访、归档、满意度、应急响应和跨端 SLA 指标',
      type: 'quality', primary: ['生成质控报告', 'generateQuality'],
      metrics: [['随访完成率','93%'],['资料归档率','98%'],['平均响应','8min'],['患者满意度','4.8/5']],
    },
  },
}

function rowsFromState(source, state) {
  if (!state) return []
  const patientRows = state.patients.map((patient) => ({
    id: patient.caseId,
    filter: patient.phaseLabel,
    cells: [patient.name, patient.caseId, patient.diagnosis, patient.phaseLabel, patient.owner],
  }))
  if (source === 'leads') return state.leads.map((lead) => ({
    id: lead.id, filter: lead.status,
    cells: [lead.name, lead.source, lead.disease, lead.phone, lead.note || lead.status, lead.owner],
  }))
  if (source === 'resources') return state.resources.map((resource) => ({
    id: resource.id, filter: resource.type,
    cells: [resource.name, resource.type, resource.city, resource.capability, resource.status, resource.contact],
  }))
  if (source === 'patientCases') return patientRows
  if (source === 'chinaIntake') return state.patients.map((patient) => {
    const currentCase = state.cases[patient.caseId]
    return {
      id: patient.caseId,
      filter: patient.phase === 'intake' ? '待接收' : patient.phase === 'review' ? '已接收' : '核验中',
      cells: [patient.name, patient.caseId, patient.country, `${patient.completeness}%`, currentCase.consent.status, patient.risk === 'high' || patient.risk === 'critical' ? '高优先' : '普通'],
    }
  })
  if (source === 'expertQueue') return state.patients
    .filter((patient) => ['review', 'planning'].includes(patient.phase))
    .map((patient) => {
      const review = state.cases[patient.caseId].review
      const task = state.tasks.find((item) => item.caseId === patient.caseId && item.to === 'expert' && item.status !== 'done')
      return {
        id: patient.caseId,
        filter: review.status === 'assigned' ? '待接收' : review.status === 'changes_requested' ? '资料待补' : '评审中',
        cells: [patient.name, patient.caseId, patient.diagnosis, `${patient.completeness}%`, task?.dueAt || '待安排', task?.priority || '普通'],
      }
    })
  if (source === 'hospitalIntake') return state.patients
    .filter((patient) => ['planning', 'travel', 'treatment', 'discharge'].includes(patient.phase))
    .map((patient) => {
      const treatment = state.cases[patient.caseId].treatment
      return {
        id: patient.caseId,
        filter: treatment.status === 'requested' ? '待审核' : treatment.status === 'accepted' ? '已承接' : treatment.status === 'rejected' ? '已拒绝' : '协调中',
        cells: [patient.name, patient.caseId, patient.diagnosis, treatment.department || '待匹配', treatment.admissionDate || '待确认', treatment.status],
      }
    })
  if (source === 'rehabCases') return state.patients
    .filter((patient) => state.cases[patient.caseId].followup.generated)
    .map((patient) => {
      const followup = state.cases[patient.caseId].followup
      const activeStage = followup.stages.find((stage) => stage.status === 'active')
      return { id: patient.caseId, cells: [patient.name, activeStage?.name || '待制定', activeStage?.items?.[0] || '待评估', patient.updatedAt, patient.owner, followup.status] }
    })
  if (source === 'expertCases') return state.patients.map((patient) => {
    const review = state.cases[patient.caseId].review
    const status = review.status === 'assigned' ? '待接收' : review.status === 'changes_requested' ? '待补资料' : review.status === 'completed' ? '已完成' : '评审中'
    return {
      id: patient.caseId, filter: status,
      cells: [patient.name, patient.caseId, patient.diagnosis, `${patient.completeness}%`, review.expert || '待分配', status, `v${review.version}`],
    }
  })
  if (source === 'mdtCases') return state.patients
    .filter((patient) => state.cases[patient.caseId].review.version > 0)
    .map((patient) => {
      const review = state.cases[patient.caseId].review
      const status = review.mdtCompletedAt ? '已完成' : review.meetingAt ? '待召开' : '待安排'
      return {
        id: patient.caseId, filter: status,
        cells: [patient.name, patient.caseId, patient.diagnosis, review.meetingAt || '待安排', review.expert || '待分配', review.specialty || '待确定', status],
      }
    })
  if (source === 'handoffCases') return state.patients
    .filter((patient) => {
      const currentCase = state.cases[patient.caseId]
      return currentCase.review.status === 'completed' || ['requested', 'accepted', 'completed'].includes(currentCase.treatment.status)
    })
    .map((patient) => {
      const currentCase = state.cases[patient.caseId]
      const completed = currentCase.travel.status === 'confirmed'
      const status = completed ? '已完成' : currentCase.treatment.status === 'accepted' ? '交接中' : '待交接'
      return {
        id: patient.caseId, filter: status,
        cells: [patient.name, patient.caseId, patient.diagnosis, currentCase.treatment.status, currentCase.billing.patientConfirmed ? '已确认' : '待确认', currentCase.travel.patientConfirmed ? '患者已确认' : '待确认', status],
      }
    })
  if (source === 'scheduleCases') return state.patients
    .filter((patient) => state.cases[patient.caseId].treatment.hospital)
    .map((patient) => {
      const treatment = state.cases[patient.caseId].treatment
      const confirmed = treatment.schedule.filter((item) => ['confirmed', 'done'].includes(item.status)).length
      const status = treatment.status === 'completed' ? '已结束' : treatment.status === 'accepted' ? (confirmed ? '已确认' : '待排期') : '进行中'
      return { id: patient.caseId, filter: status, cells: [patient.name, patient.caseId, treatment.department || '待确认', treatment.bed, treatment.admissionDate || '待确认', `${confirmed}/${treatment.schedule.length}`, status] }
    })
  if (source === 'inpatientCases') return state.patients
    .filter((patient) => ['planning', 'travel', 'treatment', 'discharge', 'followup'].includes(patient.phase))
    .map((patient) => {
      const treatment = state.cases[patient.caseId].treatment
      const status = treatment.status === 'post_operation' ? '术后恢复' : treatment.status === 'in_treatment' ? '治疗中' : treatment.status === 'completed' ? '待出院' : '待入院'
      const lastNode = [...treatment.schedule].reverse().find((item) => item.status === 'done')?.title || '尚未开始'
      return { id: patient.caseId, filter: status, cells: [patient.name, patient.caseId, patient.diagnosis, `${treatment.department || '待确认'} / ${treatment.doctor || '待确认'}`, status, lastNode, patient.risk] }
    })
  if (source === 'billingCases') return state.patients
    .filter((patient) => state.cases[patient.caseId].billing.estimatedMax > 0)
    .map((patient) => {
      const billing = state.cases[patient.caseId].billing
      const status = billing.paid <= 0 ? (billing.patientConfirmed ? '待付款' : '待确认预估') : billing.paid < billing.estimatedMin ? '部分付款' : '已结清'
      return { id: patient.caseId, filter: status, cells: [patient.name, patient.caseId, `${billing.currency} ${billing.estimatedMin.toLocaleString()}–${billing.estimatedMax.toLocaleString()}`, `${billing.currency} ${billing.paid.toLocaleString()}`, status, billing.insuranceStatus, `v${billing.estimateVersion}`] }
    })
  if (source === 'dischargeCases') return state.patients
    .filter((patient) => ['treatment', 'discharge', 'followup'].includes(patient.phase))
    .map((patient) => {
      const currentCase = state.cases[patient.caseId]
      const checklist = currentCase.treatment.dischargeChecklist
      const completed = Object.values(checklist).filter(Boolean).length
      const status = currentCase.treatment.dischargeReady ? '已交接' : checklist.patientSigned ? '待签收' : '待准备'
      const healthTask = state.tasks.some((task) => task.caseId === patient.caseId && task.to === 'health')
      return { id: patient.caseId, filter: status, cells: [patient.name, patient.caseId, currentCase.treatment.status, `${completed}/5`, checklist.patientSigned ? '已签收' : '待签收', healthTask ? '已创建' : '未创建', status] }
    })
  if (source === 'followupCases') return state.patients
    .filter((patient) => ['discharge', 'followup'].includes(patient.phase) || state.cases[patient.caseId].followup.generated)
    .map((patient) => {
      const followup = state.cases[patient.caseId].followup
      const stage = followup.stages.find((item) => item.status === 'active')
      const openAlerts = state.alerts.filter((alert) => alert.caseId === patient.caseId && alert.status !== 'closed').length
      const status = openAlerts && patient.risk === 'critical' ? '高危' : followup.generated ? '进行中' : '待制定'
      return { id: patient.caseId, filter: status, cells: [patient.name, patient.caseId, patient.diagnosis, stage?.name || '待制定', patient.owner, String(openAlerts), status] }
    })
  return []
}

const count = (items, predicate = () => true) => items.filter(predicate).length
const percent = (part, total) => `${Math.round((part / Math.max(total, 1)) * 100)}%`
const dueWithinHours = (task, hours) => {
  const due = new Date(task.dueAt).getTime()
  if (Number.isNaN(due)) return false
  const diff = due - Date.now()
  return diff >= 0 && diff <= hours * 3600000
}

function metricsFromState(system, page, state, fallback) {
  if (!state) return fallback
  const patients = state.patients || []
  const cases = Object.values(state.cases || {})
  const tasks = state.tasks || []
  const documents = state.documents || []
  const alerts = state.alerts || []
  const openTasks = tasks.filter((task) => task.status !== 'done')
  const activePatients = patients.filter((patient) => patient.phase !== 'closed')

  if (system === 'malaysia' && page === 'leads') {
    const leads = state.leads || []
    return [
      ['线索总数', String(leads.length)],
      ['待首次联系', String(count(leads, (lead) => lead.status === '待联系'))],
      ['已预约咨询', String(count(leads, (lead) => lead.status === '已预约'))],
      ['转患者率', percent(count(leads, (lead) => lead.status === '已转患者'), leads.length)],
    ]
  }
  if (system === 'malaysia' && page === 'cases') {
    return [
      ['服务中患者', String(activePatients.length)],
      ['待提交 Case', String(count(patients, (patient) => patient.phase === 'lead'))],
      ['中国评审中', String(count(patients, (patient) => patient.phase === 'review'))],
      ['赴华/治疗中', String(count(patients, (patient) => ['travel', 'treatment'].includes(patient.phase)))],
    ]
  }
  if (system === 'malaysia' && page === 'documents') {
    return [
      ['待补资料', String(count(patients, (patient) => patient.completeness < 100))],
      ['授权待确认', String(count(cases, (item) => item.consent?.status !== 'active'))],
      ['文件总数', String(documents.length)],
      ['待医学核验', String(count(documents, (doc) => doc.medicalVerification === 'pending'))],
    ]
  }
  if (system === 'malaysia' && page === 'tasks') {
    const malaysiaTasks = tasks.filter((task) => task.to === 'malaysia')
    return [
      ['我的待办', String(count(malaysiaTasks, (task) => task.status !== 'done'))],
      ['24h内到期', String(count(malaysiaTasks, (task) => task.status !== 'done' && dueWithinHours(task, 24)))],
      ['等待中方', String(count(tasks, (task) => task.from === 'china' && task.to === 'malaysia' && task.status !== 'done'))],
      ['已完成', String(count(malaysiaTasks, (task) => task.status === 'done'))],
    ]
  }
  if (system === 'malaysia' && page === 'resources') {
    const resources = state.resources || []
    return [
      ['合作机构', String(resources.length)],
      ['覆盖城市', String(new Set(resources.map((item) => item.city)).size)],
      ['可预约检验', String(count(resources, (item) => item.type === '检验中心'))],
      ['预约记录', String((state.appointments || []).length)],
    ]
  }
  if (system === 'china' && page === 'intake') {
    return [
      ['待接收病例', String(count(patients, (patient) => patient.phase === 'intake'))],
      ['待核验文件', String(count(documents, (doc) => doc.medicalVerification === 'pending'))],
      ['资料退回', String(count(tasks, (task) => task.to === 'malaysia' && task.status !== 'done'))],
      ['高优先级', String(count(patients, (patient) => ['high', 'critical'].includes(patient.risk)))],
    ]
  }
  if (system === 'china' && page === 'records') {
    return [
      ['原始文件', String(documents.length)],
      ['待翻译', String(count(documents, (doc) => doc.translationStatus === 'pending'))],
      ['待医学核验', String(count(documents, (doc) => doc.medicalVerification === 'pending'))],
      ['访问记录', String(documents.reduce((sum, doc) => sum + (doc.downloadCount || 0), 0))],
    ]
  }
  if (system === 'china' && page === 'experts') {
    return [
      ['待分配病例', String(count(cases, (item) => item.review?.status === 'unassigned'))],
      ['24h内到期', String(count(tasks, (task) => task.to === 'expert' && task.status !== 'done' && dueWithinHours(task, 24)))],
      ['评审中', String(count(cases, (item) => ['assigned', 'in_review', 'changes_requested'].includes(item.review?.status)))],
      ['已完成评审', String(count(cases, (item) => item.review?.status === 'completed'))],
    ]
  }
  if (system === 'health' && page === 'alerts') {
    return [
      ['开放预警', String(state.alerts.filter((alert) => alert.status !== 'closed').length)],
      ['高危', String(state.alerts.filter((alert) => alert.severity === 'critical' && alert.status !== 'closed').length)],
      ['已升级', String(state.alerts.filter((alert) => alert.status === 'escalated').length)],
      ['闭环率', `${Math.round((state.alerts.filter((alert) => alert.status === 'closed').length / Math.max(state.alerts.length, 1)) * 100)}%`],
    ]
  }
  if (system === 'china' && page === 'hospitals') {
    return [
      ['当前患者候选', String(state.cases[state.activeCaseId]?.hospitalMatching?.candidates.length || 0)],
      ['待匹配患者', String(cases.filter((item) => ['ready', 'waiting_review'].includes(item.hospitalMatching?.status)).length)],
      ['已发送申请', String(cases.filter((item) => item.hospitalMatching?.status === 'requested').length)],
      ['已确认承接', String(cases.filter((item) => ['accepted', 'completed'].includes(item.hospitalMatching?.status)).length)],
    ]
  }
  if (system === 'china' && page === 'handoff') {
    return [
      ['可交接病例', String(count(cases, (item) => item.review?.status === 'completed' || ['requested', 'accepted', 'completed'].includes(item.treatment?.status)))],
      ['待确认事项', String(cases.reduce((sum, item) => sum + [item.billing?.patientConfirmed, item.travel?.patientConfirmed, item.travel?.hospitalConfirmed].filter((value) => !value).length, 0))],
      ['已完成交接', String(count(cases, (item) => item.travel?.status === 'confirmed'))],
      ['参与角色', '6'],
    ]
  }
  if (system === 'expert' && page === 'queue') {
    const expertTasks = tasks.filter((task) => task.to === 'expert' && task.status !== 'done')
    return [
      ['待评审', String(expertTasks.length)],
      ['24h内到期', String(count(expertTasks, (task) => dueWithinHours(task, 24)))],
      ['高优先级', String(count(expertTasks, (task) => ['high', 'urgent'].includes(task.priority)))],
      ['资料待补', String(count(cases, (item) => item.review?.status === 'changes_requested'))],
    ]
  }
  if (system === 'expert' && page === 'mdt') {
    return [
      ['待安排', String(count(cases, (item) => item.review?.version > 0 && !item.review?.meetingAt))],
      ['待召开', String(count(cases, (item) => item.review?.meetingAt && !item.review?.mdtCompletedAt))],
      ['已完成', String(count(cases, (item) => item.review?.mdtCompletedAt))],
      ['评审病例', String(count(cases, (item) => item.review?.version > 0))],
    ]
  }
  if (system === 'hospital' && page === 'intake') {
    return [
      ['待审核申请', String(count(cases, (item) => item.treatment?.status === 'requested'))],
      ['协调中', String(count(cases, (item) => item.treatment?.status === 'planning'))],
      ['已承接', String(count(cases, (item) => item.treatment?.status === 'accepted'))],
      ['已拒绝', String(count(cases, (item) => item.treatment?.status === 'rejected'))],
    ]
  }
  if (system === 'hospital' && page === 'schedule') {
    const scheduledCases = cases.filter((item) => item.treatment?.schedule?.length)
    return [
      ['有日程病例', String(scheduledCases.length)],
      ['已确认节点', String(scheduledCases.reduce((sum, item) => sum + count(item.treatment.schedule, (node) => ['confirmed', 'done'].includes(node.status)), 0))],
      ['待确认节点', String(scheduledCases.reduce((sum, item) => sum + count(item.treatment.schedule, (node) => node.status === 'planned'), 0))],
      ['已承接病例', String(count(cases, (item) => ['accepted', 'post_operation', 'completed'].includes(item.treatment?.status)))],
    ]
  }
  if (system === 'hospital' && page === 'inpatient') {
    return [
      ['在院/治疗中', String(count(patients, (patient) => ['travel', 'treatment'].includes(patient.phase)))],
      ['待入院', String(count(cases, (item) => ['requested', 'accepted'].includes(item.treatment?.status)))],
      ['术后恢复', String(count(cases, (item) => item.treatment?.status === 'post_operation'))],
      ['高风险患者', String(count(patients, (patient) => ['high', 'critical'].includes(patient.risk)))],
    ]
  }
  if (system === 'hospital' && page === 'billing') {
    const estimated = cases.filter((item) => item.billing?.estimatedMax > 0)
    const paid = estimated.reduce((sum, item) => sum + (item.billing.paid || 0), 0)
    return [
      ['费用病例', String(estimated.length)],
      ['已收预付款', `¥${Math.round(paid / 10000)}万`],
      ['待确认预估', String(count(estimated, (item) => !item.billing.patientConfirmed))],
      ['付款笔数', String(estimated.reduce((sum, item) => sum + item.billing.payments.length, 0))],
    ]
  }
  if (system === 'hospital' && page === 'discharge') {
    return [
      ['待出院交接', String(count(cases, (item) => ['post_operation', 'completed'].includes(item.treatment?.status) && !item.treatment?.dischargeReady))],
      ['已交接', String(count(cases, (item) => item.treatment?.dischargeReady))],
      ['待签字文件', String(cases.reduce((sum, item) => sum + (item.treatment?.dischargeChecklist?.patientSigned ? 0 : 1), 0))],
      ['健康任务', String(count(tasks, (task) => task.to === 'health'))],
    ]
  }
  if (system === 'health' && page === 'followups') {
    return [
      ['管理中患者', String(count(cases, (item) => item.followup?.generated))],
      ['待制定计划', String(count(cases, (item) => item.treatment?.dischargeReady && !item.followup?.generated))],
      ['开放预警', String(count(alerts, (alert) => alert.status !== 'closed'))],
      ['随访记录', String(cases.reduce((sum, item) => sum + (item.followup?.encounters?.length || 0), 0))],
    ]
  }
  if (system === 'health' && page === 'medication') {
    return [
      ['用药日志', String(cases.reduce((sum, item) => sum + (item.followup?.medicationLogs?.length || 0), 0))],
      ['用药预警', String(count(alerts, (alert) => alert.type === '用药提醒' && alert.status !== 'closed'))],
      ['随访中', String(count(cases, (item) => item.followup?.status === 'active'))],
      ['待处理预警', String(count(alerts, (alert) => alert.status === 'open'))],
    ]
  }
  if (system === 'health' && page === 'rehab') {
    return [
      ['康复病例', String(count(cases, (item) => item.followup?.generated))],
      ['评估记录', String((state.rehabAssessments || []).length)],
      ['待评估', String(count(cases, (item) => item.followup?.generated && !(state.rehabAssessments || []).some((record) => record.caseId === item.id)))],
      ['高危随访', String(count(patients, (patient) => patient.risk === 'critical'))],
    ]
  }
  if (system === 'health' && page === 'quality') {
    const closedAlerts = count(alerts, (alert) => alert.status === 'closed')
    return [
      ['随访完成率', percent(cases.reduce((sum, item) => sum + (item.followup?.encounters?.length || 0), 0), Math.max(count(cases, (item) => item.followup?.generated), 1))],
      ['资料归档率', percent(count(documents, (doc) => doc.status === 'verified'), documents.length)],
      ['预警闭环率', percent(closedAlerts, alerts.length)],
      ['质控报告', String((state.qualityReports || []).length)],
    ]
  }
  return fallback
}

export function schemaFor(system, page, state) {
  const template = pageSchemas[system]?.[page]
  if (!template) return template
  return {
    ...template,
    rows: template.rowSource ? rowsFromState(template.rowSource, state) : template.rows,
    metrics: metricsFromState(system, page, state, template.metrics),
  }
}
