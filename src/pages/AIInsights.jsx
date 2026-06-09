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
  LineChart,
  Line,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import { fetchInsights } from '../services/api'

export default function AIInsights() {
  const [performanceCards, setPerformanceCards] = useState([])
  const [performanceData, setPerformanceData] = useState([])
  const [forecastData, setForecastData] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [anomalies, setAnomalies] = useState([])
  const [forecasts, setForecasts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchInsights()
      .then((data) => {
        setPerformanceCards(data.performanceCards || [])
        setPerformanceData(data.performanceData || [])
        setForecastData(data.forecastData || [])
        setRecommendations(data.recommendations || [])
        setAnomalies(data.anomalies || [])
        setForecasts(data.forecasts || [])
      })
      .catch((err) => {
        console.error('Failed to load insights', err)
        setError('Unable to load AI insights from the database.')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <h2>AI Insights</h2>
          <p>Portfolio analysis, recommendations, anomaly detection, and forecasts based on your live data.</p>
        </div>
        <div className="status-pill">From DB</div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      {loading ? (
        <div className="properties-detail-empty"><p>Loading insights...</p></div>
      ) : (
        <>
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
                  <p>Occupancy and rent collections from payment history.</p>
                </div>
                <span className="pill">{performanceData.length ? `${performanceData.length} months` : 'No data'}</span>
              </div>
              {performanceData.length ? (
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
              ) : (
                <div className="properties-detail-empty"><p>No payment history yet.</p></div>
              )}
            </div>

            <div className="card report-chart-card">
              <div className="card-header">
                <div>
                  <h3>Yield forecast</h3>
                  <p>Projected yield based on average property performance.</p>
                </div>
                <span className="pill">Forecast</span>
              </div>
              {forecastData.length ? (
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
              ) : (
                <div className="properties-detail-empty"><p>Add property yield data to see forecasts.</p></div>
              )}
            </div>
          </div>

          <div className="analytics-grid">
            <div className="card report-card">
              <div className="card-header">
                <div>
                  <h3>Recommendations</h3>
                  <p>Actions based on tenant status and vacant units.</p>
                </div>
                <span className="pill">{recommendations.length}</span>
              </div>
              <div className="recommendation-list">
                {recommendations.length ? (
                  recommendations.map((item) => (
                    <div key={item.title} className="recommendation-item">
                      <strong>{item.title}</strong>
                      <p>{item.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="muted-text">No recommendations right now.</p>
                )}
              </div>
            </div>

            <div className="card report-card">
              <div className="card-header">
                <div>
                  <h3>Anomaly detection</h3>
                  <p>Overdue balances and vacancy alerts from live records.</p>
                </div>
                <span className="pill">{anomalies.length}</span>
              </div>
              <div className="anomaly-list">
                {anomalies.length ? (
                  anomalies.map((item) => (
                    <div key={`${item.title}-${item.detail}`} className="anomaly-item">
                      <strong>{item.title}</strong>
                      <p>{item.detail}</p>
                      <span className={`status-badge ${item.impact === 'High' ? 'status-overdue' : item.impact === 'Medium' ? 'status-due' : 'status-paid'}`}>
                        {item.impact}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="muted-text">No anomalies detected.</p>
                )}
              </div>
            </div>
          </div>

          <div className="card report-card">
            <div className="card-header">
              <h3>Forecast summary</h3>
              <span className="pill">From recent payments</span>
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
        </>
      )}
    </MainLayout>
  )
}
