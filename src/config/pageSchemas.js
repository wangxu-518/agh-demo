const patients = [
  ['AGH-MY-2026-0018', '林秀英', '肺腺癌 IIIB期', '专家评审', 'Aisyah'],
  ['AGH-MY-2026-0021', '陈伟强', '胃癌待分期', '新咨询', 'Nur'],
  ['AGH-MY-2026-0012', '王美玲', '乳腺癌术后', '在华治疗', 'Aisyah'],
  ['AGH-MY-2026-0007', '黄丽珍', '卵巢癌复查异常', '高危随访', 'Farah'],
]

const patientRows = (extra = []) => patients.map((p, i) => ({
  id: p[0], cells: [p[1], p[0], p[2], p[3], p[4], ...(extra[i] || [])],
}))

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
      rows: [
        {id:'LEAD-260621-01',filter:'待联系',cells:['陈伟强','TikTok','胃癌','+60 12-*** 1120','待首次联系','Nur']},
        {id:'LEAD-260621-04',filter:'待联系',cells:['Siti Aminah','Facebook','乳腺癌','+60 13-*** 6721','待首次联系','Nur']},
        {id:'LEAD-260621-05',filter:'跟进中',cells:['Lee Kok Wai','WhatsApp','肺癌','+60 19-*** 3342','已完成初次沟通','Aisyah']},
        {id:'LEAD-260621-02',filter:'已预约',cells:['Mohd Azlan','Facebook','肝癌','+60 17-*** 2198','已预约视频咨询','Aisyah']},
        {id:'LEAD-260620-09',filter:'已转患者',cells:['黄丽珍','患者转介绍','卵巢癌','+60 16-*** 8802','已转患者','Farah']},
      ],
    },
    cases: {
      eyebrow: 'PATIENT & CASE', title: '患者与 Case', description: '管理患者主档、服务阶段、责任人和跨境 Case',
      type: 'table', primary: ['提交主案例', 'submitCase'],
      metrics: [['服务中患者','46'],['待提交 Case','7'],['中国评审中','12'],['本月赴华','9']],
      filters: ['全部患者','新咨询','专家评审','在华治疗','归国随访'],
      columns: ['患者','Case ID','诊断','当前阶段','服务负责人'],
      rows: patientRows(),
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
      rows: [
        {id:'RES-001',filter:'医院',cells:['Sunway Medical Centre','医院','Kuala Lumpur','肿瘤复查 / 急诊','合作中','Dr. Lee']},
        {id:'RES-008',filter:'检验中心',cells:['BP Healthcare Bangsar','检验中心','Kuala Lumpur','血液 / 肿瘤标志物','可预约','Ms. Tan']},
        {id:'RES-011',filter:'药房',cells:['Health Lane Pharmacy','药房','Kuala Lumpur','处方药 / 冷链配送','合作中','Mr. Wong']},
        {id:'RES-015',filter:'康复机构',cells:['ReGen Rehab Centre','康复机构','Petaling Jaya','术后康复 / 营养','合作中','Farah']},
        {id:'RES-022',filter:'保险',cells:['AIA Malaysia Medical','保险','Malaysia','理赔预审 / 文件协助','合作中','Ms. Lim']},
      ],
    },
  },
  china: {
    intake: {
      eyebrow: 'CASE INTAKE', title: '病例接收', description: '核验授权、资料版本和中国诊疗服务准入条件',
      type: 'table', primary: ['确认接收病例', 'acceptChinaCase'],
      metrics: [['今日新病例','6'],['待核验','9'],['资料退回','3'],['平均接收时长','3.2h']],
      filters: ['待接收','核验中','已退回','已接收'],
      columns: ['患者','Case ID','来源国家','资料完整度','授权状态','优先级'],
      rows: patientRows([[ '86%'],['35%'],['100%'],['100%']]).map((r, i) => ({...r, cells:[r.cells[0],r.cells[1],'马来西亚',r.cells[5],i===1?'待签署':'已授权',i===0?'高优先':'普通']})),
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
        {id:'EXP-014',cells:['周敏 教授','中山大学肿瘤医院 · 内科','肺癌精准治疗','5例','6月24日','接近满载']},
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
      type: 'checklist', primary: ['完成赴华交接', 'completeHandoff'],
      metrics: [['交接完成度','78%'],['待确认事项','4'],['距离入院','7天'],['参与角色','6']],
    },
  },
  expert: {
    queue: {
      eyebrow: 'REVIEW QUEUE', title: '待评审病例', description: '按紧急度、病种、资料完整度和截止时间处理评审',
      type: 'table', primary: ['接收主案例', 'claimReview'],
      metrics: [['待评审','7'],['今日到期','2'],['高优先级','3'],['平均完成时间','18h']],
      filters: ['全部','待接收','评审中','资料待补','即将超时'],
      columns: ['患者','Case ID','诊断','资料完整度','截止时间','优先级'],
      rows: patientRows().slice(0,3).map((r,i)=>({...r,cells:[r.cells[0],r.cells[1],r.cells[2],['86%','72%','100%'][i],['明天 18:00','今天 20:00','6月24日'][i],['紧急','高','普通'][i]]})),
    },
    case: {
      eyebrow: 'CASE REVIEW', title: '病例详情', description: '结构化病历、原始资料、关键影像、检查缺口和评审意见',
      type: 'review', primary: ['提交评审意见', 'finishReview'],
    },
    mdt: {
      eyebrow: 'MULTIDISCIPLINARY TEAM', title: 'MDT 会诊', description: '管理议题、参会专家、会议记录和多学科结论',
      type: 'meeting', primary: ['完成 MDT', 'finishMdt'],
      metrics: [['今日会议','3'],['待确认专家','2'],['待出具纪要','1'],['本月MDT','22']],
    },
    history: {
      eyebrow: 'REVIEW HISTORY', title: '历史评审', description: '检索意见版本、复查解读、修改记录和引用历史',
      type: 'table', primary: ['复制为新评审', 'copyReview'],
      filters: ['全部评审','初诊评审','MDT结论','复查解读'],
      columns: ['患者','评审类型','诊断','完成时间','意见版本','结论'],
      rows: [
        {id:'REV-2026-081',cells:['刘佳明','初诊评审','肺鳞癌','2026-06-18','v1','建议先行新辅助治疗']},
        {id:'REV-2026-076',cells:['王美玲','复查解读','乳腺癌术后','2026-06-16','v2','未见明确复发证据']},
        {id:'REV-2026-069',cells:['黄丽珍','MDT结论','卵巢癌','2026-06-12','v1','建议补充PET-CT后复评']},
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
      rows: patientRows().slice(0,3).map((r,i)=>({...r,cells:[r.cells[0],r.cells[1],r.cells[2],['胸外科','胃外科','乳腺外科'][i],['6月28日','7月2日','在院'][i],['待审核','资料核验中','已承接'][i]]})),
    },
    schedule: {
      eyebrow: 'BED & SCHEDULE', title: '床位与日程', description: '协调病区床位、检查、手术、会诊和出院日程',
      type: 'calendar', primary: ['确认日程', 'confirmSchedule'],
      metrics: [['国际床位','12'],['已占用','8'],['本周入院','6'],['手术排期','9']],
    },
    inpatient: {
      eyebrow: 'INPATIENT MANAGEMENT', title: '在院管理', description: '追踪检查、治疗节点、病情沟通和家属同步',
      type: 'timeline', primary: ['推进至术后恢复', 'advanceTreatment'],
      metrics: [['在院国际患者','8'],['今日检查','12'],['今日手术','3'],['待沟通事项','5']],
    },
    billing: {
      eyebrow: 'BILLING MANAGEMENT', title: '费用管理', description: '管理预估、预付款、账单、发票与保险材料',
      type: 'billing', primary: ['登记预付款', 'recordPayment'],
      metrics: [['费用预估','¥180k–230k'],['已收预付款','¥0'],['待确认账单','3'],['保险材料','待准备']],
    },
    discharge: {
      eyebrow: 'DISCHARGE HANDOVER', title: '出院交接', description: '交付双语出院资料、带药、复查计划和归国任务',
      type: 'checklist', primary: ['完成出院交接', 'completeDischarge'],
      metrics: [['预计出院','7月8日'],['资料完成度','62%'],['待签字文件','3'],['归国任务','未创建']],
    },
  },
  health: {
    followups: {
      eyebrow: 'FOLLOW-UP PLANS', title: '随访计划', description: '按五阶段生成频次、项目、责任角色和提醒',
      type: 'stages', primary: ['生成五阶段计划', 'generateFollowup'],
      metrics: [['管理中患者','126'],['今日随访','18'],['待制定计划','7'],['完成率','93%']],
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
      rows: patientRows().slice(0,3).map((r,i)=>({...r,cells:[r.cells[0],['术后早期','功能恢复','长期体能'][i],['呼吸训练','上肢活动度','步行耐力'][i],['6月20日','6月19日','6月18日'][i],['Physio Lim','Nurse Aina','Farah'][i],['进行中','待复评','正常'][i]]})),
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

export function schemaFor(system, page) {
  return pageSchemas[system]?.[page]
}
