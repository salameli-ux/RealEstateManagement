import { useState } from 'react'
import MainLayout from '../layouts/MainLayout'

const teamMembers = [
  { name: 'Emma Franklin', role: 'Owner access', status: 'Active' },
  { name: 'Liam Johnson', role: 'Property manager', status: 'Active' },
  { name: 'Sophia Lee', role: 'Accountant', status: 'Pending approval' },
]

const permissions = [
  { title: 'Full access', description: 'Owner and admin permissions for the platform.', status: 'Enabled' },
  { title: 'Property manager', description: 'Manage listings, tenants, and workflows.', status: 'Managed' },
  { title: 'Accounting', description: 'Report viewing and export rights.', status: 'Partial' },
]

const initialIntegrations = [
  { name: 'Zillow sync', description: 'Listing sync and pricing feed.', enabled: true },
  { name: 'Stripe payments', description: 'Collect rent and vendor payments.', enabled: true },
  { name: 'QuickBooks', description: 'Accounting sync for tax reporting.', enabled: false },
]

export default function Settings() {
  const [currency, setCurrency] = useState('USD')
  const [taxRate, setTaxRate] = useState('8.5')
  const [integrations, setIntegrations] = useState(initialIntegrations)

  const toggleIntegration = (index) => {
    setIntegrations((current) =>
      current.map((integration, idx) =>
        idx === index ? { ...integration, enabled: !integration.enabled } : integration
      )
    )
  }

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <h2>Settings</h2>
          <p>Manage users, permissions, tax and currency defaults, and third-party integrations.</p>
        </div>
        <span className="status-pill">Admin</span>
      </div>

      <div className="settings-grid">
        <div className="card">
          <h3>Users</h3>
          <p className="card-copy">Invite teammates, assign roles, and lock down access for your portfolio.</p>

          {teamMembers.map((member) => (
            <div key={member.name} className="setting-item">
              <div>
                <strong>{member.name}</strong>
                <p>{member.role}</p>
                <p className="muted-text">{member.status}</p>
              </div>
              <button className="pill">Edit</button>
            </div>
          ))}

          <button className="secondary-button">Invite new user</button>
        </div>

        <div className="card">
          <h3>Permissions</h3>
          <p className="card-copy">Set role-based permissions for operations, reporting and asset control.</p>

          {permissions.map((permission) => (
            <div key={permission.title} className="setting-item">
              <div>
                <strong>{permission.title}</strong>
                <p>{permission.description}</p>
              </div>
              <button className="pill">{permission.status}</button>
            </div>
          ))}

          <button className="secondary-button">Review roles</button>
        </div>

        <div className="card">
          <h3>Tax & Currency</h3>
          <p className="card-copy">Configure the global currency and default tax rate used throughout the platform.</p>

          <div className="form-group">
            <label htmlFor="currency-select">Default currency</label>
            <select
              id="currency-select"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="ILS">ILS - Israeli Shekel</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tax-rate">Default tax rate</label>
            <input
              id="tax-rate"
              value={taxRate}
              onChange={(event) => setTaxRate(event.target.value)}
              placeholder="8.5"
            />
            <span className="muted-text">Applied to rental income and service fees.</span>
          </div>

          <button className="secondary-button">Save tax settings</button>
        </div>

        <div className="card">
          <h3>Integrations</h3>
          <p className="card-copy">Connect tools and data feeds for payments, accounting and market intelligence.</p>

          {integrations.map((integration, index) => (
            <div key={integration.name} className="setting-item">
              <div>
                <strong>{integration.name}</strong>
                <p>{integration.description}</p>
              </div>
              <button
                className={`pill ${integration.enabled ? 'pill-positive' : 'pill-negative'}`}
                type="button"
                onClick={() => toggleIntegration(index)}
              >
                {integration.enabled ? 'Connected' : 'Disabled'}
              </button>
            </div>
          ))}

          <button className="secondary-button">Manage integrations</button>
        </div>
      </div>
    </MainLayout>
  )
}
