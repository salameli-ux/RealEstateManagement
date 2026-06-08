export function formatLeaseDate(value) {
  if (!value) return '—'
  const parsed = new Date(value.includes('-') && !value.includes(',') ? `${value}T12:00:00` : value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatLeaseDuration(start, end) {
  const startDate = new Date(start.includes('-') && !start.includes(',') ? `${start}T12:00:00` : start)
  const endDate = new Date(end.includes('-') && !end.includes(',') ? `${end}T12:00:00` : end)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return '—'

  let months =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth())
  if (endDate.getDate() < startDate.getDate()) months -= 1
  if (months < 0) return '—'

  const years = Math.floor(months / 12)
  const remMonths = months % 12
  const parts = []
  if (years) parts.push(`${years} yr${years !== 1 ? 's' : ''}`)
  if (remMonths) parts.push(`${remMonths} mo`)
  return parts.join(' ') || '0 mo'
}
