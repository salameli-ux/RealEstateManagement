const REVENUE_TYPES = new Set(['Rent', 'Deposit'])
const EXPENSE_TYPES = new Set([
  'HOA',
  'Insurance',
  'Tax',
  'Maintenance',
  'Refund',
  'Management',
  'Monthly',
  'Convenience',
  'Work Order',
  'Leasing',
  'Inspection',
])

export function parsePaymentDate(payment) {
  const dateString = payment.paidDate || payment.dueDate
  if (!dateString) return null
  const date = new Date(dateString)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatMoney(amount) {
  return `$${Math.round(amount || 0).toLocaleString()}`
}

export function buildMonthlyFinancials(payments) {
  const monthIndex = {}

  for (const payment of payments) {
    if (payment.status !== 'Paid') continue
    const date = parsePaymentDate(payment)
    if (!date) continue

    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const month = date.toLocaleString('en-US', { month: 'short' })
    if (!monthIndex[monthKey]) {
      monthIndex[monthKey] = { monthKey, month, revenue: 0, expenses: 0 }
    }

    if (REVENUE_TYPES.has(payment.type)) {
      monthIndex[monthKey].revenue += payment.amount || 0
    } else if (EXPENSE_TYPES.has(payment.type)) {
      monthIndex[monthKey].expenses += payment.amount || 0
    }
  }

  return Object.values(monthIndex)
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
    .map(({ monthKey, month, revenue, expenses }) => {
      const noi = revenue - expenses
      return {
        month,
        monthKey,
        revenue,
        expenses,
        noi,
        cashFlow: noi,
      }
    })
}

export function buildAnnualFinancials(payments) {
  const yearIndex = {}

  for (const payment of payments) {
    if (payment.status !== 'Paid') continue
    const date = parsePaymentDate(payment)
    if (!date) continue

    const year = String(date.getFullYear())
    if (!yearIndex[year]) {
      yearIndex[year] = { year, income: 0, expenses: 0 }
    }

    if (REVENUE_TYPES.has(payment.type)) {
      yearIndex[year].income += payment.amount || 0
    } else if (EXPENSE_TYPES.has(payment.type)) {
      yearIndex[year].expenses += payment.amount || 0
    }
  }

  return Object.values(yearIndex)
    .sort((a, b) => a.year.localeCompare(b.year))
    .map(({ year, income, expenses }) => {
      const noi = income - expenses
      return {
        year,
        income,
        expenses,
        noi,
        cashflow: noi,
        incomeLabel: formatMoney(income),
        expensesLabel: formatMoney(expenses),
        noiLabel: formatMoney(noi),
        cashflowLabel: formatMoney(noi),
      }
    })
}

export function buildQuarterSummary(monthlyRows) {
  const recent = monthlyRows.slice(-3)
  const revenue = recent.reduce((sum, row) => sum + row.revenue, 0)
  const expenses = recent.reduce((sum, row) => sum + row.expenses, 0)
  const noi = revenue - expenses
  return { revenue, expenses, noi, cashFlow: noi }
}

export function buildPortfolioOccupancy(properties) {
  if (!properties.length) return 0
  const occupied = properties.filter((property) => property.hasCurrentTenant).length
  return Math.round((occupied / properties.length) * 100)
}

export function buildAverageYield(properties) {
  const yields = properties.map((property) => Number(property.yield)).filter((value) => !Number.isNaN(value) && value > 0)
  if (!yields.length) return 0
  return Number((yields.reduce((sum, value) => sum + value, 0) / yields.length).toFixed(1))
}

export function buildPortfolioValue(properties) {
  return properties.reduce((sum, property) => sum + (Number(property.currentValue) || Number(property.price) || 0), 0)
}

export function buildMonthlyPerformance(payments, properties, occupancy) {
  const monthly = buildMonthlyFinancials(payments)
  const portfolioValue = buildPortfolioValue(properties)
  return monthly.map((row, index) => ({
    month: row.month,
    occupancy,
    rent: row.revenue,
    value: portfolioValue + index * 1000,
  }))
}

export function buildYieldForecast(properties) {
  const avgYield = buildAverageYield(properties)
  if (!avgYield) return []
  return ['Q3', 'Q4', 'Q1', 'Q2'].map((quarter, index) => ({
    quarter,
    yield: Number((avgYield + index * 0.2).toFixed(1)),
  }))
}

export function buildRecommendations(db) {
  const recommendations = []

  const overdueTenants = db
    .prepare(`
      SELECT t.name, t.unit, p.title AS propertyTitle
      FROM tenants t
      LEFT JOIN properties p ON p.id = t.propertyId
      WHERE t.status = 'Overdue'
      ORDER BY t.name COLLATE NOCASE
    `)
    .all()

  for (const tenant of overdueTenants) {
    recommendations.push({
      title: `Follow up on ${tenant.name}`,
      description: `${tenant.name} at ${tenant.unit || tenant.propertyTitle || 'their unit'} has an overdue balance.`,
    })
  }

  const vacantProperties = db
    .prepare(`
      SELECT title, address, rent
      FROM properties p
      WHERE NOT EXISTS (
        SELECT 1 FROM tenants t WHERE t.propertyId = p.id AND t.isCurrent = 1
      )
      ORDER BY title COLLATE NOCASE
    `)
    .all()

  for (const property of vacantProperties) {
    recommendations.push({
      title: `Lease ${property.title}`,
      description: `${property.address || property.title} is vacant${property.rent ? ` — target rent $${Number(property.rent).toLocaleString()}/mo` : ''}.`,
    })
  }

  const dueTenants = db
    .prepare(`
      SELECT name, unit
      FROM tenants
      WHERE status = 'Due'
      ORDER BY name COLLATE NOCASE
    `)
    .all()

  for (const tenant of dueTenants.slice(0, 2)) {
    recommendations.push({
      title: `Send rent reminder to ${tenant.name}`,
      description: `${tenant.name} at ${tenant.unit || 'their unit'} has rent due soon.`,
    })
  }

  return recommendations.slice(0, 8)
}

export function buildAnomalies(db) {
  const anomalies = []

  const overdueTenants = db
    .prepare(`
      SELECT t.name, p.title AS propertyTitle
      FROM tenants t
      LEFT JOIN properties p ON p.id = t.propertyId
      WHERE t.status = 'Overdue'
    `)
    .all()

  for (const tenant of overdueTenants) {
    anomalies.push({
      title: 'Late rent payment',
      detail: `${tenant.name} at ${tenant.propertyTitle || 'a property'} is overdue.`,
      impact: 'High',
    })
  }

  const vacantCount = db
    .prepare(`
      SELECT COUNT(*) AS count
      FROM properties p
      WHERE NOT EXISTS (
        SELECT 1 FROM tenants t WHERE t.propertyId = p.id AND t.isCurrent = 1
      )
    `)
    .get().count

  if (vacantCount > 0) {
    anomalies.push({
      title: 'Vacant units',
      detail: `${vacantCount} propert${vacantCount === 1 ? 'y is' : 'ies are'} currently without a tenant.`,
      impact: vacantCount > 1 ? 'High' : 'Medium',
    })
  }

  const overduePayments = db
    .prepare(`SELECT COUNT(*) AS count FROM payments WHERE status = 'Overdue'`)
    .get().count

  if (overduePayments > 0) {
    anomalies.push({
      title: 'Open invoices overdue',
      detail: `${overduePayments} invoice${overduePayments === 1 ? '' : 's'} marked overdue in the ledger.`,
      impact: 'Medium',
    })
  }

  return anomalies.slice(0, 8)
}

export function buildForecastSummary(properties, payments, occupancy) {
  const avgYield = buildAverageYield(properties)
  const monthly = buildMonthlyFinancials(payments)
  const recent = monthly.slice(-2)
  const prior = monthly.slice(-4, -2)
  const recentRevenue = recent.reduce((sum, row) => sum + row.revenue, 0)
  const priorRevenue = prior.reduce((sum, row) => sum + row.revenue, 0)
  const rentTrend = priorRevenue === 0 ? 'stable' : recentRevenue >= priorRevenue ? 'up' : 'down'
  const rentGrowth = priorRevenue
    ? `${(((recentRevenue - priorRevenue) / priorRevenue) * 100).toFixed(1)}%`
    : recentRevenue > 0
      ? 'New'
      : '0%'

  const recentNoi = recent.reduce((sum, row) => sum + row.noi, 0)
  const priorNoi = prior.reduce((sum, row) => sum + row.noi, 0)
  const noiTrend = priorNoi === 0 ? 'stable' : recentNoi >= priorNoi ? 'up' : 'down'
  const noiGrowth = priorNoi
    ? `${(((recentNoi - priorNoi) / priorNoi) * 100).toFixed(1)}%`
    : recentNoi > 0
      ? 'New'
      : '0%'

  return [
    { label: 'Rent growth', value: rentGrowth, trend: rentTrend },
    { label: 'NOI growth', value: noiGrowth, trend: noiTrend },
    { label: 'Occupancy', value: `${occupancy}%`, trend: occupancy >= 90 ? 'stable' : 'down' },
    { label: 'Avg yield', value: avgYield ? `${avgYield}%` : '—', trend: avgYield >= 6 ? 'up' : 'stable' },
  ]
}

export function buildPerformanceCards(properties, payments, occupancy) {
  const avgYield = buildAverageYield(properties)
  const overdueCount = payments.filter((payment) => payment.status === 'Overdue').length
  const paidRent = payments.filter((payment) => payment.status === 'Paid' && payment.type === 'Rent').length
  const totalRent = payments.filter((payment) => payment.type === 'Rent').length
  const collectionRate = totalRent ? Math.round((paidRent / totalRent) * 100) : 0

  return [
    {
      title: 'Portfolio occupancy',
      value: `${occupancy}%`,
      detail: `${properties.filter((property) => property.hasCurrentTenant).length} of ${properties.length} units leased`,
    },
    {
      title: 'Average yield',
      value: avgYield ? `${avgYield}%` : '—',
      detail: 'Across active properties',
    },
    {
      title: 'Risk alerts',
      value: String(overdueCount),
      detail: overdueCount === 1 ? 'Overdue invoice' : 'Overdue invoices',
    },
    {
      title: 'Rent collection',
      value: totalRent ? `${collectionRate}%` : '—',
      detail: 'Paid rent invoices vs total rent invoices',
    },
  ]
}
