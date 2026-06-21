export const systems = {
  patient: {
    name: '患者服务门户', en: 'Patient Care Portal', short: '患者端', icon: 'P',
    color: '#2264e5', home: '/patient/home', account: 'patient@agh.demo', password: '123456',
    nav: [
      ['home', '首页', 'Home'], ['records', '医疗资料', 'Medical Records'],
      ['plan', '治疗方案', 'Treatment Plan'], ['travel', '赴华行程', 'Travel'],
      ['followup', '归国随访', 'Follow-up'],
    ],
  },
  malaysia: {
    name: '马来西亚患者服务系统', en: 'Malaysia Patient Service', short: '马来服务端', icon: 'MY',
    color: '#7554c7', home: '/malaysia/dashboard', account: 'malaysia@agh.demo', password: '123456',
    nav: [
      ['dashboard', '工作台', 'Dashboard'], ['leads', '线索管理', 'Leads'],
      ['cases', '患者与Case', 'Patients & Cases'], ['documents', '资料与签约', 'Documents'],
      ['tasks', '跨国协同', 'Collaboration'], ['resources', '本地资源', 'Local Resources'],
    ],
  },
  china: {
    name: '中国诊疗运营系统', en: 'China Medical Operations', short: '中国运营端', icon: 'CN',
    color: '#e18332', home: '/china-ops/dashboard', account: 'china@agh.demo', password: '123456',
    nav: [
      ['dashboard', '工作台', 'Dashboard'], ['intake', '病例接收', 'Case Intake'],
      ['records', '诊疗资料中心', 'Medical Records'], ['experts', '专家协调', 'Expert Coordination'],
      ['hospitals', '医院匹配', 'Hospital Matching'], ['handoff', '跨国交接', 'Handover'],
    ],
  },
  expert: {
    name: '肿瘤专家评审系统', en: 'Oncology Expert Review', short: '专家端', icon: 'MD',
    color: '#d94c5b', home: '/expert/dashboard', account: 'expert@agh.demo', password: '123456',
    nav: [
      ['dashboard', '评审工作台', 'Dashboard'], ['queue', '待评审病例', 'Review Queue'],
      ['case', '病例详情', 'Case Detail'], ['mdt', 'MDT会诊', 'MDT'],
      ['history', '历史评审', 'Review History'],
    ],
  },
  hospital: {
    name: '国际患者医院承接系统', en: 'International Patient Intake', short: '医院承接端', icon: 'H',
    color: '#1493a3', home: '/hospital/dashboard', account: 'hospital@agh.demo', password: '123456',
    nav: [
      ['dashboard', '承接工作台', 'Dashboard'], ['intake', '接诊申请', 'Intake Requests'],
      ['schedule', '床位与日程', 'Beds & Schedule'], ['inpatient', '在院管理', 'Inpatient'],
      ['billing', '费用管理', 'Billing'], ['discharge', '出院交接', 'Discharge'],
    ],
  },
  health: {
    name: '归国全周期健康管理系统', en: 'Post-return Health Management', short: '健康管理端', icon: '♥',
    color: '#1b9873', home: '/health-management/dashboard', account: 'health@agh.demo', password: '123456',
    nav: [
      ['dashboard', '健康管理工作台', 'Dashboard'], ['followups', '随访计划', 'Follow-up Plans'],
      ['medication', '用药管理', 'Medication'], ['rehab', '康复与护理', 'Rehabilitation'],
      ['alerts', '预警与应急', 'Alerts'], ['quality', '服务质控', 'Quality'],
    ],
  },
}

export const systemFromPath = (path) => {
  if (path.startsWith('/china-ops')) return 'china'
  if (path.startsWith('/health-management')) return 'health'
  return Object.keys(systems).find((key) => path.startsWith(`/${key}`))
}
