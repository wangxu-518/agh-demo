export function formatDateTime(value, locale = 'zh-CN') {
  if (!value) return '待确认'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(date)
}

export function formatDate(value, locale = 'zh-CN') {
  if (!value) return '待确认'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

export function formatMoney(value, currency = 'CNY', locale = 'zh-CN') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(value) || 0)
}

export function relativeDue(value, now = new Date()) {
  if (!value) return '未设置截止时间'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const diffHours = Math.round((date.getTime() - now.getTime()) / 3600000)
  if (diffHours < 0) return `已逾期 ${Math.abs(diffHours)} 小时`
  if (diffHours < 24) return `${diffHours} 小时内`
  return `${Math.ceil(diffHours / 24)} 天内`
}
