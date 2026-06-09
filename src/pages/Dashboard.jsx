import { useEffect, useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { fetchPayments, fetchProperties } from '../services/api'

const formatCurrency = (amount) => `$${amount.toLocaleString()}`

const buildPortfolioOccupancy = (properties) => {
  if (!properties.length) return 0
  const occupied = properties.filter((property) => property.hasCurrentTenant).length
  return Math.round((occupied / properties.length) * 100)
}

const buildRevenueChartData = (payments, occupancy) => {
  const monthIndex = {}
  payments.forEach((payment) => {
    const dateString = payment.paidDate || payment.dueDate
    if (!dateString) return

    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label = date.toLocaleString('en-US', { month: 'short' })
    if (!monthIndex[key]) {
      monthIndex[key] = { name: label, revenue: 0, occupancy }
    }
    if (payment.status === 'Paid') {
      monthIndex[key].revenue += payment.amount || 0
    }
  })

  return Object.entries(monthIndex)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([_, value]) => value)
}

const buildPaymentSummary = (payments) => {
  const revenue = payments
    .filter((payment) => payment.status === 'Paid' && payment.type !== 'Refund')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0)
  const expenses = payments
    .filter((payment) => payment.type === 'Refund')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0)
  const pendingInvoices = payments.filter((payment) => ['Pending', 'Due'].includes(payment.status)).length
  const latePayments = payments.filter((payment) => payment.status === 'Overdue').length

  return {
    revenue,
    expenses,
    pendingInvoices,
    latePayments,
  }
}

export default function Dashboard() {
  const [summary, setSummary] = useState({
    revenue: 0,
    expenses: 0,
    pendingInvoices: 0,
    latePayments: 0,
  })
  const [chartData, setChartData] = useState([])
  const [occupancy, setOccupancy] = useState(0)

  useEffect(() => {
    Promise.all([fetchPayments(), fetchProperties()])
      .then(([payments, properties]) => {
        const portfolioOccupancy = buildPortfolioOccupancy(properties)
        setOccupancy(portfolioOccupancy)
        setSummary(buildPaymentSummary(payments))
        setChartData(buildRevenueChartData(payments, portfolioOccupancy))
      })
      .catch((error) => {
        console.error('Dashboard fetch failed', error)
      })
  }, [])

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Track portfolio revenue, occupancy, and operational momentum from one place.</p>
        </div>
        <div className="status-pill">Live insights</div>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card card">
          <p className="stat-title">Total revenue</p>
          <h3>{formatCurrency(summary.revenue)}</h3>
          <p className="stat-subtitle">From paid invoices</p>
        </div>
        <div className="stat-card card">
          <p className="stat-title">Total refunds</p>
          <h3>{formatCurrency(summary.expenses)}</h3>
          <p className="stat-subtitle">Refunds and payouts</p>
        </div>
        <div className="stat-card card">
          <p className="stat-title">Pending invoices</p>
          <h3>{summary.pendingInvoices}</h3>
          <p className="stat-subtitle">Awaiting payment</p>
        </div>
        <div className="stat-card card">
          <p className="stat-title">Late payments</p>
          <h3>{summary.latePayments}</h3>
          <p className="stat-subtitle">Current overdue balances</p>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="card chart-card">
          <div className="card-header">
            <div>
              <h3>Revenue performance</h3>
              <p>Monthly rent and billing summaries.</p>
            </div>
            <span className="pill">Based on payments</span>
          </div>

          {chartData.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#64748b" />
                <YAxis axisLine={false} tickLine={false} stroke="#64748b" />
                <CartesianGrid stroke="#e2e8f0" vertical={false} strokeDasharray="3 3" />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="url(#revenueGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="properties-detail-empty"><p>No payment history yet.</p></div>
          )}
        </div>

        <div className="card chart-card">
          <div className="card-header">
            <div>
              <h3>Occupancy trend</h3>
              <p>Current portfolio utilization.</p>
            </div>
            <span className="pill">{occupancy}% occupied</span>
          </div>

          {chartData.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#64748b" />
                <YAxis axisLine={false} tickLine={false} stroke="#64748b" />
                <CartesianGrid stroke="#e2e8f0" vertical={false} strokeDasharray="3 3" />
                <Tooltip />
                <Area type="monotone" dataKey="occupancy" stroke="#14b8a6" fill="url(#occupancyGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="properties-detail-empty"><p>No payment history yet.</p></div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
