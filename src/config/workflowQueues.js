const MAIN_DEMO_CASE = 'AGH-MY-2026-0012'

const consultationLabels = {
  not_scheduled: '待协调',
  time_confirmed: '待创建会议',
  scheduled: '面诊已安排',
  transcript_ready: '纪要待审核',
  minutes_archived: '纪要已归档',
  completed: '已完成',
}

const reviewLabels = {
  unassigned: '待分配',
  assigned: '待接收',
  in_review: '评审中',
  changes_requested: '待补资料',
  completed: '已完成',
}

const toneFor = (patient, status) => {
  if (patient.risk === 'critical' || status === '高危') return 'critical'
  if (patient.risk === 'high' || ['待补资料', '纪要待审核', '待审核'].includes(status)) return 'attention'
  if (['已完成', '资料齐备', '资料可用', '患者已确认', '已推送', '术后恢复'].includes(status)) return 'done'
  return 'pending'
}

const compactDateTime = (value) => String(value || '待安排').replace('T', ' ').slice(0, 16)

function baseRow(state, patient, status, fields = {}) {
  return {
    caseId: patient.caseId,
    name: patient.name,
    englishName: patient.englishName,
    avatar: patient.avatar,
    portrait: patient.portrait,
    diagnosis: patient.diagnosis,
    phaseLabel: patient.phaseLabel,
    owner: patient.owner,
    risk: patient.risk,
    status,
    tone: toneFor(patient, status),
    featured: patient.caseId === MAIN_DEMO_CASE,
    updatedAt: patient.updatedAt,
    ...fields,
  }
}

function malaysiaRows(page, state) {
  return state.patients.map((patient) => {
    const currentCase = state.cases[patient.caseId]
    const documents = state.documents.filter((item) => item.caseId === patient.caseId && !item.voidedAt)
    const missing = currentCase.aiStructuring.missingItems || []
    const confirmation = currentCase.aiStructuring.patientConfirmation.status

    if (page === 'documents') {
      const status = missing.length ? '待补资料' : '资料齐备'
      return baseRow(state, patient, status, {
        primaryLabel: '有效资料',
        primaryValue: `${documents.length} 份`,
        secondaryLabel: '资料缺口',
        secondaryValue: missing.join('、') || '无',
        nextAction: missing.length ? '补充并核验缺失资料' : '复核版本与授权范围',
      })
    }

    if (page === 'tasks') {
      const status = confirmation === 'confirmed' ? '患者已确认' : confirmation === 'pending' ? '等待患者确认' : currentCase.aiStructuring.status === 'draft' ? 'AI整理中' : '待发送患者'
      return baseRow(state, patient, status, {
        primaryLabel: '报告版本',
        primaryValue: `v${currentCase.aiStructuring.reportVersion}`,
        secondaryLabel: 'AI置信度',
        secondaryValue: `${currentCase.aiStructuring.confidence}%`,
        nextAction: confirmation === 'confirmed' ? '进入面诊与专家协调' : missing.length ? '校对报告并确认资料缺口' : '发送患者核对',
      })
    }

    if (page === 'resources') {
      const status = consultationLabels[currentCase.consultation.status] || '待协调'
      return baseRow(state, patient, status, {
        primaryLabel: 'AGH牵头专家',
        primaryValue: currentCase.consultation.expert || currentCase.review.expert || '待安排',
        secondaryLabel: '接诊团队决策',
        secondaryValue: currentCase.review.receivingTeamDecision?.status === 'confirmed' ? '专家已确认' : '待评审/会审',
        nextAction: currentCase.consultation.status === 'not_scheduled' ? '协调患者与专家时间' : '查看面诊和会议资料',
      })
    }

    if (page === 'leads') {
      const travelStatus = {
        not_started: '待规划',
        planning: '行程协调中',
        confirmed: '待出发',
        completed: '已完成',
      }[currentCase.travel.status] || '待规划'
      return baseRow(state, patient, travelStatus, {
        primaryLabel: '治疗医院',
        primaryValue: currentCase.treatment.hospital || '待确认',
        secondaryLabel: '行程节点',
        secondaryValue: `${currentCase.travel.itinerary.length + currentCase.treatment.schedule.length} 项`,
        nextAction: currentCase.travel.status === 'completed' ? '查看跨境交接记录' : '确认患者、医院与交通节点',
      })
    }

    return baseRow(state, patient, patient.phaseLabel, {
      primaryLabel: '档案完整度',
      primaryValue: `${patient.completeness}%`,
      secondaryLabel: '有效资料',
      secondaryValue: `${documents.length} 份`,
      nextAction: missing.length ? `待补：${missing[0]}` : '查看患者全景档案',
    })
  })
}

function expertRows(page, state) {
  return state.patients
    .filter((patient) => page !== 'mdt' || state.cases[patient.caseId].review.version > 0)
    .map((patient) => {
      const currentCase = state.cases[patient.caseId]
      const review = currentCase.review
      const status = page === 'mdt'
        ? (review.mdtCompletedAt ? '已完成' : review.meetingAt ? '待召开' : '待安排')
        : (reviewLabels[review.status] || '评审中')
      return baseRow(state, patient, status, {
        primaryLabel: page === 'mdt' ? '会议时间' : '资料完整度',
        primaryValue: page === 'mdt' ? (review.meetingAt || '待安排') : `${patient.completeness}%`,
        secondaryLabel: page === 'mdt' ? 'AGH牵头专家' : '意见版本',
        secondaryValue: review.expert || (page === 'mdt' ? '待确定' : `v${review.version}`),
        nextAction: page === 'mdt' ? '查看议程、共享病案与会诊结论' : '查看结构化病案并形成专家意见',
      })
    })
}

function hospitalRows(state) {
  return state.patients
    .filter((patient) => state.cases[patient.caseId].treatment.hospital)
    .map((patient) => {
      const treatment = state.cases[patient.caseId].treatment
      const status = {
        planning: '待入院',
        requested: '待审核',
        accepted: '治疗中',
        in_treatment: '治疗中',
        post_operation: '术后恢复',
        completed: '待归档',
      }[treatment.status] || '协调中'
      const uploaded = state.chinaDomain.medicalRecords.filter((item) => item.caseId === patient.caseId).length
      return baseRow(state, patient, status, {
        primaryLabel: '科室 / 医生',
        primaryValue: `${treatment.department || '待确认'} · ${treatment.doctor || '待确认'}`,
        secondaryLabel: '境内资料',
        secondaryValue: `${uploaded} 份`,
        nextAction: status === '术后恢复' ? '上传手术、病理和康复资料' : '更新治疗节点与住院资料',
      })
    })
}

function chinaRows(state) {
  return state.patients
    .filter((patient) => state.cases[patient.caseId].domesticRecordReference.chinaCaseId)
    .map((patient) => {
      const reference = state.cases[patient.caseId].domesticRecordReference
      const records = state.chinaDomain.medicalRecords.filter((item) => item.caseId === patient.caseId)
      const latest = [...records].sort((a, b) => String(b.uploadedAt).localeCompare(String(a.uploadedAt)))[0]
      return baseRow(state, patient, reference.status === 'available' ? '资料可用' : '待上传', {
        primaryLabel: '境内病例号',
        primaryValue: reference.chinaCaseId,
        secondaryLabel: '资料数量',
        secondaryValue: `${records.length} 份`,
        nextAction: latest ? `最近更新：${latest.title}` : '等待医院上传治疗资料',
      })
    })
}

function healthRows(page, state) {
  return state.patients
    .filter((patient) => page === 'home-visits'
      ? state.cases[patient.caseId].homeVisits.length > 0
      : state.cases[patient.caseId].followup.generated)
    .map((patient) => {
      const currentCase = state.cases[patient.caseId]
      const followup = currentCase.followup
      const stage = followup.stages.find((item) => item.status === 'active')
      const openAlerts = state.alerts.filter((item) => item.caseId === patient.caseId && item.status !== 'closed').length
      if (page === 'home-visits') {
        const visit = currentCase.homeVisits[0]
        const completed = visit.checklist.filter((item) => item.done).length
        const status = visit.status === 'completed' ? '已完成' : completed ? '执行中' : patient.risk === 'critical' ? '高危' : '待执行'
        return baseRow(state, patient, status, {
          primaryLabel: '预约时间',
          primaryValue: compactDateTime(visit.scheduledAt),
          secondaryLabel: '采集进度',
          secondaryValue: `${completed}/${visit.checklist.length}`,
          nextAction: patient.risk === 'critical' ? '先复核预警，再执行现场采集' : '执行生命体征、伤口、用药与康复采集',
        })
      }
      const status = patient.risk === 'critical' && openAlerts ? '高危' : currentCase.healthPlan.monthlyPlan.status === 'published' ? '已推送' : '方案待审核'
      return baseRow(state, patient, status, {
        primaryLabel: '当前阶段',
        primaryValue: stage?.name || '待制定',
        secondaryLabel: '方案版本',
        secondaryValue: `v${currentCase.healthPlan.monthlyPlan.version}`,
        nextAction: openAlerts ? `${openAlerts} 项开放预警需关注` : '审核月度饮食、运动与监测方案',
      })
    })
}

export function workflowQueueFor(system, page, state) {
  let rows = []
  if (system === 'malaysia') rows = malaysiaRows(page, state)
  if (system === 'expert') rows = expertRows(page, state)
  if (system === 'hospital') rows = hospitalRows(state)
  if (system === 'china') rows = chinaRows(state)
  if (system === 'health') rows = healthRows(page, state)

  const statuses = [...new Set(rows.map((row) => row.status))]
  const pending = rows.filter((row) => ['pending', 'attention', 'critical'].includes(row.tone)).length
  const highRisk = rows.filter((row) => ['high', 'critical'].includes(row.risk)).length
  return {
    filters: ['全部', ...statuses],
    rows,
    metrics: [
      { label: '当前队列', value: String(rows.length), note: '按本节点业务范围统计' },
      { label: '待处理', value: String(pending), note: '含待确认与需关注事项' },
      { label: '高风险', value: String(highRisk), note: highRisk ? '优先检查风险与时限' : '当前无高风险患者' },
      { label: '演示主案例', value: rows.some((row) => row.featured) ? '王美玲' : '未进入', note: '主案例不替代其他患者' },
    ],
  }
}
