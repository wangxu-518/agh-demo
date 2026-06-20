import { computed } from 'vue'
import { useDemoStore } from './stores/demo'

const dictionary = {
  zh: {
    demo: '演示中心', patient: '患者端', malaysia: '马来服务端', china: '中国运营端',
    expert: '专家端', hospital: '医院承接端', health: '归国健康管理端',
    reset: '重置演示数据', language: 'EN', back: '返回演示中心',
    mainCase: '主线案例', tasks: '待办任务', timeline: '协同时间线', documents: '医疗资料',
    complete: '完成', pending: '待处理', details: '查看详情',
  },
  en: {
    demo: 'Demo Center', patient: 'Patient Portal', malaysia: 'Malaysia Service',
    china: 'China Operations', expert: 'Expert Review', hospital: 'Hospital Intake',
    health: 'Post-return Care', reset: 'Reset demo data', language: '中文', back: 'Back to Demo Center',
    mainCase: 'Main Case', tasks: 'Tasks', timeline: 'Collaboration Timeline',
    documents: 'Medical Records', complete: 'Complete', pending: 'Pending', details: 'View details',
  },
}

export function useI18n() {
  const store = useDemoStore()
  const lang = computed(() => store.state.language)
  const t = (key) => dictionary[lang.value]?.[key] || dictionary.zh[key] || key
  return { lang, t }
}
