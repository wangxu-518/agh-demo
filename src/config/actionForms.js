const field = (name, label, type = 'text', extra = {}) => ({ name, label, type, ...extra })

export const actionForms = {
  uploadDocument: {
    title: '上传医疗资料',
    fields: [
      field('name', '文件名称', 'text', { required: true, placeholder: '例如：最新肿瘤标志物报告.pdf' }),
      field('type', '资料类型', 'select', { required: true, options: ['病理报告', '影像资料', '检验报告', '治疗记录', '授权文件'] }),
      field('language', '文件语言', 'select', { options: ['zh', 'en', 'bilingual'] }),
      field('source', '文件来源', 'select', { options: ['患者上传', '马来医院', '马来服务端', '国内医院'] }),
    ],
  },
  revokeConsent: {
    title: '撤回跨境数据授权',
    fields: [field('reason', '撤回原因', 'textarea', { required: true, placeholder: '说明撤回范围和后续沟通要求' })],
  },
  submitCase: {
    title: '提交中国运营审核',
    fields: [
      field('owner', '中国运营负责人', 'select', { options: ['李雯', '王晨', '国际病例组'] }),
      field('priority', '优先级', 'select', { options: ['normal', 'high', 'urgent'] }),
      field('dueAt', '要求完成时间', 'datetime-local'),
      field('note', '交接说明', 'textarea', { required: true, placeholder: '说明诊疗诉求、资料缺口与患者时间要求' }),
    ],
  },
  acceptChinaCase: {
    title: '接收跨境病例',
    fields: [
      field('note', '接收意见', 'textarea', { required: true, placeholder: '记录授权、资料版本和准入核验结果' }),
    ],
  },
  publishSummary: {
    title: '发布中文结构化摘要',
    fields: [field('summary', '病例摘要', 'textarea', { required: true, placeholder: '主诉、现病史、病理、影像、分期和待解决问题' })],
  },
  assignExpert: {
    title: '分配评审专家',
    fields: [
      field('expert', '评审专家', 'select', { required: true, options: ['张建国 主任', '周敏 教授', '陈力 主任'] }),
      field('specialty', '评审专科', 'select', { options: ['胸外科', '肿瘤内科', '放疗科', '妇科肿瘤'] }),
      field('meetingAt', '计划评审时间', 'datetime-local'),
      field('dueAt', '任务截止时间', 'datetime-local'),
      field('priority', '优先级', 'select', { options: ['normal', 'high', 'urgent'] }),
    ],
  },
  requestHospital: {
    title: '发送医院承接申请',
    fields: [
      field('caseId', '患者 Case ID', 'text', { required: true, readonly: true }),
      field('hospitalId', '医院 ID', 'text', { required: true, readonly: true }),
      field('hospital', '申请医院', 'text', { required: true, readonly: true }),
      field('department', '接诊科室', 'text', { required: true, readonly: true }),
      field('doctor', '拟接诊医生', 'text', { readonly: true }),
      field('admissionDate', '期望入院日期', 'date'),
      field('note', '承接要求', 'textarea', { placeholder: '患者病情、床位要求、费用沟通和特殊需求' }),
    ],
  },
  completeHandoff: {
    title: '完成赴华交接',
    fields: [field('note', '交接确认', 'textarea', { required: true, placeholder: '确认资料、费用、医院、签证、航班和接送均已落实' })],
  },
  claimReview: {
    title: '接收评审病例',
    fields: [field('note', '接收说明', 'textarea', { placeholder: '记录预计完成时间或需优先关注的问题' })],
  },
  finishReview: {
    title: '提交并签署评审意见',
    fields: [
      field('recommendation', '正式评审意见', 'textarea', { required: true, placeholder: '检查建议、分期判断、治疗路径、风险和复评条件' }),
      field('hospital', '建议医院'),
    ],
  },
  requestMoreDocuments: {
    title: '要求补充资料',
    fields: [
      field('items', '缺失或需更新资料', 'textarea', { required: true, placeholder: '列明检查项目、日期范围和格式要求' }),
      field('owner', '资料负责人', 'select', { options: ['Aisyah', 'Nur', '马来资料组'] }),
      field('dueAt', '补充期限', 'datetime-local'),
    ],
  },
  rejectReview: {
    title: '拒绝评审任务',
    fields: [field('reason', '拒接原因', 'textarea', { required: true, placeholder: '专业不匹配、档期冲突或资料不足' })],
  },
  finishMdt: {
    title: '确认 MDT 结论',
    fields: [field('conclusion', '多学科结论', 'textarea', { required: true, placeholder: '记录各学科意见、争议点和最终治疗建议' })],
  },
  acceptHospital: {
    title: '确认医院承接',
    fields: [
      field('bed', '床位或协调说明', 'text', { required: true, placeholder: '例如：胸外科 8F-12（预留）' }),
      field('admissionDate', '确认入院日期', 'date'),
      field('note', '承接说明', 'textarea', { placeholder: '入院要求、检查安排、押金和联系人' }),
    ],
  },
  rejectHospital: {
    title: '拒绝医院承接',
    fields: [field('reason', '无法承接原因', 'textarea', { required: true, placeholder: '床位、专科能力、费用或时间原因' })],
  },
  confirmSchedule: {
    title: '确认床位与诊疗日程',
    fields: [field('note', '日程说明', 'textarea', { placeholder: '记录患者、医生和床位协调结果' })],
  },
  advanceTreatment: {
    title: '更新治疗进度',
    fields: [
      field('status', '治疗状态', 'select', { options: ['in_treatment', 'post_operation', 'completed'] }),
      field('scheduleId', '完成节点', 'select', { options: ['admission', 'mdt', 'operation', 'discharge'] }),
      field('note', '医疗团队记录', 'textarea', { required: true }),
    ],
  },
  recordPayment: {
    title: '登记付款',
    fields: [
      field('amount', '付款金额', 'number', { required: true, min: 1 }),
      field('method', '付款方式', 'select', { options: ['bank_transfer', 'card', 'cash', 'insurance'] }),
      field('reference', '交易参考号'),
      field('paidAt', '付款时间', 'datetime-local'),
    ],
  },
  recordRefund: {
    title: '登记退款',
    fields: [
      field('amount', '退款金额', 'number', { required: true, min: 1 }),
      field('reason', '退款原因', 'textarea', { required: true }),
    ],
  },
  completeDischarge: {
    title: '完成出院交接',
    fields: [
      field('summary', '双语出院小结', 'checkbox'),
      field('imaging', '影像与病理资料', 'checkbox'),
      field('medication', '带药和用药告知', 'checkbox'),
      field('followup', '归国复查计划', 'checkbox'),
      field('patientSigned', '患者签收确认', 'checkbox'),
      field('note', '交接说明', 'textarea'),
    ],
    checklist: true,
  },
  generateFollowup: {
    title: '生成五阶段归国计划',
    fields: [
      field('owner', '健康管家', 'select', { options: ['Farah', 'Aina', '健康管理中心'] }),
      field('note', '计划说明', 'textarea', { placeholder: '患者风险、阶段频次和重点关注事项' }),
    ],
  },
  confirmMedication: {
    title: '确认用药记录',
    fields: [field('note', '服药与不良反应', 'textarea', { required: true, placeholder: '记录服药时间、漏服和不适情况' })],
  },
  completeRehab: {
    title: '完成康复评估',
    fields: [field('note', '评估结论', 'textarea', { required: true, placeholder: '体能、伤口、营养、疼痛及下阶段目标' })],
  },
  escalateAlert: {
    title: '升级高危预警',
    fields: [
      field('alertId', '预警编号', 'text', { required: true }),
      field('assessment', '风险评估', 'textarea', { required: true }),
      field('expert', '复评负责人', 'select', { options: ['肿瘤质控组', '张建国 主任', '周敏 教授'] }),
      field('dueAt', '响应期限', 'datetime-local'),
    ],
  },
  closeAlert: {
    title: '关闭预警',
    fields: [
      field('alertId', '预警编号', 'text', { required: true }),
      field('resolution', '处置结论', 'textarea', { required: true, placeholder: '记录专家意见、患者反馈和后续监测安排' }),
    ],
  },
  createLead: {
    title: '新建咨询线索',
    fields: [
      field('patientName', '咨询人姓名', 'text', { required: true }),
      field('source', '线索来源', 'select', { options: ['WhatsApp', 'Facebook', 'TikTok', '患者转介绍'] }),
      field('phone', '联系电话', 'text', { required: true }),
      field('note', '病情与诉求', 'textarea', { required: true }),
    ],
  },
  lockDocuments: {
    title: '锁定资料版本',
    fields: [field('note', '核验说明', 'textarea', { required: true, placeholder: '确认必需资料、授权和版本完整性' })],
  },
  bookLocalResource: {
    title: '预约本地资源',
    fields: [
      field('resource', '合作机构', 'select', { options: ['BP Healthcare Bangsar', 'Sunway Medical Centre', 'ReGen Rehab Centre'] }),
      field('appointmentAt', '预约时间', 'datetime-local'),
      field('note', '预约项目与注意事项', 'textarea'),
    ],
  },
  generateQuality: {
    title: '生成质控报告',
    fields: [field('note', '报告说明', 'textarea', { placeholder: '重点问题、整改责任人与截止时间' })],
  },
}

export function formFor(action) {
  return actionForms[action] || {
    title: '完成业务操作',
    fields: [field('note', '处理说明', 'textarea', { required: true })],
  }
}
