import express from 'express'
import db from '../db.js'
import {
  buildAnomalies,
  buildAverageYield,
  buildForecastSummary,
  buildMonthlyPerformance,
  buildPerformanceCards,
  buildPortfolioOccupancy,
  buildRecommendations,
  buildYieldForecast,
} from '../utils/financeMetrics.js'

const router = express.Router()

function loadProperties() {
  return db
    .prepare(`
      SELECT p.*,
        (SELECT COUNT(*) FROM tenants t WHERE t.propertyId = p.id AND t.isCurrent = 1) AS currentTenantCount
      FROM properties p
      ORDER BY p.id
    `)
    .all()
    .map(({ currentTenantCount, ...property }) => ({
      ...property,
      currentTenantCount,
      hasCurrentTenant: currentTenantCount > 0,
    }))
}

router.get('/', (req, res) => {
  const payments = db.prepare('SELECT * FROM payments ORDER BY id').all()
  const properties = loadProperties()
  const occupancy = buildPortfolioOccupancy(properties)

  res.json({
    performanceCards: buildPerformanceCards(properties, payments, occupancy),
    performanceData: buildMonthlyPerformance(payments, properties, occupancy),
    forecastData: buildYieldForecast(properties),
    recommendations: buildRecommendations(db),
    anomalies: buildAnomalies(db),
    forecasts: buildForecastSummary(properties, payments, occupancy),
    averageYield: buildAverageYield(properties),
    occupancy,
  })
})

export default router
