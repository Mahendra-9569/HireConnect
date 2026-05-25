export const money = (value) => {
  if (value === undefined || value === null || value === '') return '—'
  const num = Number(value)
  if (Number.isNaN(num)) return String(value)
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(num)
}

export const dateTime = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString()
}

export const dateOnly = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString()
}

export const compact = (text, len = 140) => {
  if (!text) return ''
  const value = String(text)
  return value.length > len ? `${value.slice(0, len)}…` : value
}

export const statusTone = (status) => {
  const s = String(status || '').toLowerCase()
  if (s === 'hired') return 'emerald'
  if (s === 'rejected') return 'rose'
  if (s === 'submitted') return 'amber'
  return 'slate'
}

export const severityTone = (severity) => {
  const s = String(severity || '').toLowerCase()
  if (s === 'high') return 'rose'
  if (s === 'medium') return 'amber'
  return 'emerald'
}

export const asList = (value) => Array.isArray(value) ? value : []

export const safeJson = (value, fallback = {}) => {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}
