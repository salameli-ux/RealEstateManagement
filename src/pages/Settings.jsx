import { useEffect, useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import { fetchSettings, updateIntegration, updateSettings } from '../services/api'

export default function Settings() {
  const [currency, setCurrency] = useState('USD')
  const [taxRate, setTaxRate] = useState('8.5')
  const [teamMembers, setTeamMembers] = useState([])
  const [permissions, setPermissions] = useState([])
  const [integrations, setIntegrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [savedMessage, setSavedMessage] = useState('')

  useEffect(() => {
    fetchSettings()
      .then((data) => {
        setCurrency(data.currency || 'USD')
        setTaxRate(data.taxRate || '8.5')
        setTeamMembers(data.teamMembers || [])
        setPermissions(data.permissions || [])
        setIntegrations(data.integrations || [])
      })
      .catch((err) => {
        console.error('Failed to load settings', err)
        setError('Unable to load settings from the database.')
      })
      .finally(() => setLoading(false))
  }, [])

  const toggleIntegration = async (integration) => {
    try {
      const updated = await updateIntegration(integration.id, { enabled: !integration.enabled })
      setIntegrations((current) => current.map((item) => (item.id === updated.id ? updated : item)))
    } catch (err) {
      console.error('Failed to update integration', err)
      setError('Unable to update integration.')
    }
  }

  const handleSaveTaxSettings = async () => {
    setSaving(true)
    setSavedMessage('')
    setError('')
    try {
      const saved = await updateSettings({ currency, taxRate })
      setCurrency(saved.currency)
      setTaxRate(saved.taxRate)
      setSavedMessage('Tax settings saved.')
    } catch (err) {
      console.error('Failed to save settings', err)
      setError('Unable to save tax settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="properties-detail-empty"><p>Loading settings...</p></div>
      </MainLayout>
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

      {error ? <p className="form-error">{error}</p> : null}
      {savedMessage ? <p className="muted-text">{savedMessage}</p> : null}

      <div className="settings-grid">
        <div className="card">
          <h3>Users</h3>
          <p className="card-copy">Invite teammates, assign roles, and lock down access for your portfolio.</p>

          {teamMembers.map((member) => (
            <div key={member.id} className="setting-item">
              <div>
                <strong>{member.name}</strong>
                <p>{member.role}</p>
                <p className="muted-text">{member.status}</p>
              </div>
              <button className="pill" type="button">Edit</button>
            </div>
          ))}

          <button className="secondary-button" type="button">Invite new user</button>
        </div>

        <div className="card">
          <h3>Permissions</h3>
          <p className="card-copy">Set role-based permissions for operations, reporting and asset control.</p>

          {permissions.map((permission) => (
            <div key={permission.id} className="setting-item">
              <div>
                <strong>{permission.title}</strong>
                <p>{permission.description}</p>
              </div>
              <button className="pill" type="button">{permission.status}</button>
            </div>
          ))}

          <button className="secondary-button" type="button">Review roles</button>
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

          <button className="secondary-button" type="button" onClick={handleSaveTaxSettings} disabled={saving}>
            {saving ? 'Saving...' : 'Save tax settings'}
          </button>
        </div>

        <div className="card">
          <h3>Integrations</h3>
          <p className="card-copy">Connect tools and data feeds for payments, accounting and market intelligence.</p>

          {integrations.map((integration) => (
            <div key={integration.id} className="setting-item">
              <div>
                <strong>{integration.name}</strong>
                <p>{integration.description}</p>
              </div>
              <button
                className={`pill ${integration.enabled ? 'pill-positive' : 'pill-negative'}`}
                type="button"
                onClick={() => toggleIntegration(integration)}
              >
                {integration.enabled ? 'Connected' : 'Disabled'}
              </button>
            </div>
          ))}

          <button className="secondary-button" type="button">Manage integrations</button>
        </div>
      </div>
    </MainLayout>
  )
}
