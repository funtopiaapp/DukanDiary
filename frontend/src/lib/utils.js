export const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const formatDateDisplay = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }
  return d.toLocaleDateString('en-IN', options)
}

export const formatTime = (time) => {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours)
  const m = parseInt(minutes)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const displayHours = h % 12 || 12
  return `${String(displayHours).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`
}

export const getTodayDate = () => {
  const today = new Date()
  return formatDate(today)
}

export const getStartOfMonth = () => {
  const today = new Date()
  const first = new Date(today.getFullYear(), today.getMonth(), 1)
  return formatDate(first)
}

export const getEndOfMonth = () => {
  const today = new Date()
  const last = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  return formatDate(last)
}

export const getDaysUntil = (date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)
  const diffTime = targetDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export const isToday = (date) => {
  return formatDate(date) === getTodayDate()
}

export const isTomorrow = (date) => {
  return getDaysUntil(date) === 1
}

export const isOverdue = (date) => {
  return getDaysUntil(date) < 0
}

export const capitalizeFirst = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
