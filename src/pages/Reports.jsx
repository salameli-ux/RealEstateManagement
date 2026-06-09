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
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import { fetchReports } from '../services/api'

const formatMoney = (value) => {
  if (typeof value === 'string') return value
  return `$${Math.round(value || 0).toLocaleString()}`
}

export default function Reports() {
  const [summaryMetrics, setSummaryMetrics] = useState([])
  const [chartData, setChartData] = useState([])
  const [annualReportRows, setAnnualReportRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReports()
      .then((data) => {
        setSummaryMetrics(data.summaryMetrics || [])
        setChartData(data.chartData || [])
        setAnnualReportRows(data.annualReportRows || [])
      })
      .catch((err) => {
        console.error('Failed to load reports', err)
        setError('Unable to load reports from the database.')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <h2>Reports</h2>
          <p>View cash flow, NOI, expense breakdowns, revenue trends, and annual financial statements.</p>
        </div>
        <div className="report-actions">
          <button className="secondary-button" type="button">Export PDF</button>
          <button className="secondary-button" type="button">Export CSV</button>
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      {loading ? (
        <div className="properties-detail-empty"><p>Loading reports...</p></div>
      ) : (
        <>
          <div className="dashboard-grid">
            {summaryMetrics.map((metric) => (
              <div key={metric.title} className="report-summary-card card">
                <h3>{metric.title}</h3>
                <p className="summary-value">{metric.value}</p>
                <p className="summary-detail">{metric.detail}</p>
              </div>
            ))}
          </div>

          <div className="analytics-grid">
            <div className="card report-chart-card">
              <div className="card-header">
                <div>
                  <h3>Cash flow vs NOI</h3>
                  <p>Monthly operating performance and profitability</p>
                </div>
                <span className="pill">{chartData.length ? `${chartData.length} months` : 'No data'}</span>
              </div>

              {chartData.length ? (
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="cashflowGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="noiGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e2e8f0" vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#64748b" />
                    <YAxis axisLine={false} tickLine={false} stroke="#64748b" />
                    <Tooltip />
                    <Area type="monotone" dataKey="cashFlow" name="Cash flow" stroke="#16a34a" fill="url(#cashflowGradient)" strokeWidth={2} />
                    <Area type="monotone" dataKey="noi" name="NOI" stroke="#2563eb" fill="url(#noiGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="properties-detail-empty"><p>No paid transactions yet.</p></div>
              )}
            </div>

            <div className="card report-chart-card">
              <div className="card-header">
                <div>
                  <h3>Revenue vs Expenses</h3>
                  <p>Compare income and spend across recent months.</p>
                </div>
                <span className="pill">From payments</span>
              </div>

              {chartData.length ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#e2e8f0" vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#64748b" />
                    <YAxis axisLine={false} tickLine={false} stroke="#64748b" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="expenses" name="Expenses" fill="#f97316" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="properties-detail-empty"><p>No paid transactions yet.</p></div>
              )}
            </div>
          </div>

          <div className="card report-table-card">
            <div className="card-header">
              <h3>Annual financial reports</h3>
              <span className="pill">Year-over-year</span>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Income</th>
                    <th>Expenses</th>
                    <th>NOI</th>
                    <th>Cash flow</th>
                  </tr>
                </thead>
                <tbody>
                  {annualReportRows.length ? (
                    annualReportRows.map((row) => (
                      <tr key={row.year}>
                        <td>{row.year}</td>
                        <td>{formatMoney(row.income)}</td>
                        <td>{formatMoney(row.expenses)}</td>
                        <td>{formatMoney(row.noi)}</td>
                        <td>{formatMoney(row.cashflow)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5}>No annual payment history yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </MainLayout>
  )
}
