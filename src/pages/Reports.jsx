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

const summaryMetrics = [
  { title: 'Cash flow', value: '$51,200', detail: 'This quarter' },
  { title: 'NOI', value: '$43,800', detail: 'Net operating income' },
  { title: 'Expenses', value: '$38,400', detail: 'Operating costs' },
  { title: 'Revenue', value: '$89,600', detail: 'Total collections' },
]

const chartData = [
  { month: 'Jan', cashFlow: 9800, revenue: 28400, expenses: 12200, noi: 16200 },
  { month: 'Feb', cashFlow: 10200, revenue: 29700, expenses: 12700, noi: 17000 },
  { month: 'Mar', cashFlow: 11300, revenue: 31500, expenses: 13500, noi: 18000 },
  { month: 'Apr', cashFlow: 11000, revenue: 32700, expenses: 13800, noi: 18900 },
  { month: 'May', cashFlow: 11800, revenue: 34000, expenses: 14200, noi: 19800 },
]

const annualReportRows = [
  { year: '2023', income: '$328,400', expenses: '$142,000', noi: '$186,400', cashflow: '$128,900' },
  { year: '2024', income: '$348,700', expenses: '$150,200', noi: '$198,500', cashflow: '$138,600' },
  { year: '2025', income: '$372,100', expenses: '$159,500', noi: '$212,600', cashflow: '$148,300' },
]

export default function Reports() {
  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <h2>Reports</h2>
          <p>View cash flow, NOI, expense breakdowns, revenue trends, and annual financial statements.</p>
        </div>
        <div className="report-actions">
          <button className="secondary-button">Export PDF</button>
          <button className="secondary-button">Export CSV</button>
        </div>
      </div>

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
            <span className="pill">5 months</span>
          </div>

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
        </div>

        <div className="card report-chart-card">
          <div className="card-header">
            <div>
              <h3>Revenue vs Expenses</h3>
              <p>Compare income and spend across recent months.</p>
            </div>
            <span className="pill">Trend view</span>
          </div>

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
              {annualReportRows.map((row) => (
                <tr key={row.year}>
                  <td>{row.year}</td>
                  <td>{row.income}</td>
                  <td>{row.expenses}</td>
                  <td>{row.noi}</td>
                  <td>{row.cashflow}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  )
}
