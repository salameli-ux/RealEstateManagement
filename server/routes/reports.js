import express from 'express'
import db from '../db.js'
import {
  buildAnnualFinancials,
  buildMonthlyFinancials,
  buildQuarterSummary,
  formatMoney,
} from '../utils/financeMetrics.js'

const router = express.Router()

router.get('/', (req, res) => {
  const payments = db.prepare('SELECT * FROM payments ORDER BY id').all()
  const monthly = buildMonthlyFinancials(payments)
  const annual = buildAnnualFinancials(payments)
  const quarter = buildQuarterSummary(monthly)

  res.json({
    summaryMetrics: [
      { title: 'Cash flow', value: formatMoney(quarter.cashFlow), detail: 'Last 3 months with payments' },
      { title: 'NOI', value: formatMoney(quarter.noi), detail: 'Net operating income' },
      { title: 'Expenses', value: formatMoney(quarter.expenses), detail: 'Operating costs' },
      { title: 'Revenue', value: formatMoney(quarter.revenue), detail: 'Total collections' },
    ],
    chartData: monthly.map((row) => ({
      month: row.month,
      cashFlow: row.cashFlow,
      revenue: row.revenue,
      expenses: row.expenses,
      noi: row.noi,
    })),
    annualReportRows: annual,
  })
})

export default router
