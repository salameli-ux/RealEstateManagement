import MainLayout from '../layouts/MainLayout'
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Legend,
} from 'recharts'

const performanceCards = [
  { title: 'Asset performance', value: 'A-', detail: 'Core portfolio strength' },
  { title: 'Yield opportunity', value: '6.8%', detail: 'High growth markets' },
  { title: 'Risk alert', value: '3 assets', detail: 'Watch renewals & vacancies' },
  { title: 'Forecast accuracy', value: '92%', detail: 'AI reliability score' },
]

const performanceData = [
  { month: 'Jan', occupancy: 88, rent: 12800, value: 540000 },
  { month: 'Feb', occupancy: 91, rent: 13700, value: 546000 },
  { month: 'Mar', occupancy: 93, rent: 14550, value: 552000 },
  { month: 'Apr', occupancy: 95, rent: 15300, value: 560000 },
  { month: 'May', occupancy: 96, rent: 16400, value: 567000 },
]

const forecastData = [
  { quarter: 'Q3', yield: 6.2 },
  { quarter: 'Q4', yield: 6.4 },
  { quarter: 'Q1', yield: 6.6 },
  { quarter: 'Q2', yield: 6.8 },
]

const recommendations = [
  {
    title: 'Raise rent for Miami Condo',
    description: 'Market demand supports a 4% increase on the next renewal term.',
  },
  {
    title: 'Renew Atlanta lease early',
    description: 'Lock in current occupancy and reduce vacancy risk next quarter.',
  },
  {
    title: 'Reduce maintenance cost',
    description: 'Optimize service contracts for Chicago portfolio to preserve NOI.',
  },
  {
    title: 'Improve tenant retention',
    description: 'Offer loyalty incentives for long-term leases in high-value assets.',
  },
]

const anomalies = [
  {
    title: 'Late rent payment',
    detail: 'Atlanta Duplex is 6 days overdue and at risk of churn.',
    impact: 'Medium',
  },
  {
    title: 'Rising vacancy',
    detail: 'Miami Condo vacancy duration is 18% above target.',
    impact: 'High',
  },
  {
    title: 'Utility cost spike',
    detail: 'Chicago Townhome utilities jumped 12% in the last month.',
    impact: 'Low',
  },
]

const forecasts = [
  { label: 'Rent growth', value: '7.1%', trend: 'up' },
  { label: 'NOI growth', value: '8.3%', trend: 'up' },
  { label: 'Occupancy', value: '97%', trend: 'stable' },
]

export default function AIInsights() {
  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <h2>AI Insights</h2>
          <p>Automated asset performance analysis, yield recommendations, anomaly detection, and forecasts.</p>
        </div>
        <div className="status-pill">AI-driven</div>
      </div>

      <div className="insights-grid">
        {performanceCards.map((card) => (
          <div key={card.title} className="insight-card card">
            <h3>{card.title}</h3>
            <p className="insight-value">{card.value}</p>
            <p>{card.detail}</p>
          </div>
        ))}
      </div>

      <div className="analytics-grid">
        <div className="card report-chart-card">
          <div className="card-header">
            <div>
              <h3>Asset performance trend</h3>
              <p>Occupancy and rent growth measured against portfolio value.</p>
            </div>
            <span className="pill">5 months</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={performanceData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="rentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="occGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e2e8f0" vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#64748b" />
              <YAxis axisLine={false} tickLine={false} stroke="#64748b" />
              <Tooltip />
              <Area type="monotone" dataKey="rent" name="Rent" stroke="#2563eb" fill="url(#rentGradient)" strokeWidth={2} />
              <Area type="monotone" dataKey="occupancy" name="Occupancy" stroke="#14b8a6" fill="url(#occGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card report-chart-card">
          <div className="card-header">
            <div>
              <h3>Yield forecast</h3>
              <p>Projected portfolio yield across the next four quarters.</p>
            </div>
            <span className="pill">Forecast</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={forecastData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="quarter" axisLine={false} tickLine={false} stroke="#64748b" />
              <YAxis axisLine={false} tickLine={false} stroke="#64748b" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="yield" name="Yield" stroke="#f59e0b" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="card report-card">
          <div className="card-header">
            <div>
              <h3>AI recommendations</h3>
              <p>Step-by-step actions to improve portfolio yield and operational resilience.</p>
            </div>
            <span className="pill">Top 4</span>
          </div>
          <div className="recommendation-list">
            {recommendations.map((item) => (
              <div key={item.title} className="recommendation-item">
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card report-card">
          <div className="card-header">
            <div>
              <h3>Anomaly detection</h3>
              <p>Critical portfolio risks flagged by AI for immediate review.</p>
            </div>
            <span className="pill">Alerts</span>
          </div>
          <div className="anomaly-list">
            {anomalies.map((item) => (
              <div key={item.title} className="anomaly-item">
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
                <span className={`status-badge ${item.impact === 'High' ? 'status-overdue' : item.impact === 'Medium' ? 'status-due' : 'status-paid'}`}>
                  {item.impact}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card report-card">
        <div className="card-header">
          <h3>Forecast summary</h3>
          <span className="pill">8-week outlook</span>
        </div>
        <div className="forecast-grid">
          {forecasts.map((item) => (
            <div key={item.label} className="forecast-card">
              <h4>{item.label}</h4>
              <p className="insight-value">{item.value}</p>
              <p className="forecast-trend">Trend: {item.trend}</p>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}
