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
    name: '马来西亚患者运营系统', en: 'Malaysia Patient Operations', short: '马来运营端', icon: 'MY',
    color: '#7554c7', home: '/malaysia/dashboard', account: 'malaysia@agh.demo', password: '123456',
    nav: [
      ['dashboard', '运营工作台', 'Dashboard'], ['cases', '患者档案', 'Patient Records'],
      ['documents', '资料采集', 'Collection'], ['tasks', 'AI病案整理', 'AI Structuring'],
      ['resources', '初筛与协同', 'Coordination'], ['leads', '治疗行程', 'Treatment Journey'],
    ],
  },
  china: {
    name: '中国诊疗资料中心', en: 'China Medical Records', short: '中国资料端', icon: 'CN',
    color: '#e18332', home: '/china-ops/dashboard', account: 'china@agh.demo', password: '123456',
    nav: [
      ['dashboard', '资料总览', 'Overview'], ['records', '国内诊疗资料', 'Medical Records'],
      ['intake', '治疗时间轴', 'Treatment Timeline'], ['handoff', '访问审计', 'Access Audit'],
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
      ['medication', '用药管理', 'Medication'], ['home-visits', '家访执行', 'Home Visits'],
      ['alerts', '预警与应急', 'Alerts'],
      ['quality', '服务质控', 'Quality'],
    ],
  },
}

export const systemFromPath = (path) => {
  if (path.startsWith('/china-ops')) return 'china'
  if (path.startsWith('/health-management')) return 'health'
  return Object.keys(systems).find((key) => path.startsWith(`/${key}`))
}
