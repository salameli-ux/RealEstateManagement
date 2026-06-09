import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { fetchTenants, createTenant } from '../services/api'

export default function Tenants() {
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '',
    unit: '',
    email: '',
    phone: '',
    taxId: '',
    leaseStart: '',
    leaseEnd: '',
    rent: '',
    status: 'Due',
    nextDue: '',
    contract: '12 month lease',
    cycle: 'Monthly',
  })

  useEffect(() => {
    fetchTenants()
      .then(setTenants)
      .catch((error) => {
        console.error('Failed to load tenants', error)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const openTenantForm = () => setShowForm(true)
    window.addEventListener('open-add-tenant-form', openTenantForm)
    return () => window.removeEventListener('open-add-tenant-form', openTenantForm)
  }, [])

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  const handleAdd = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      documents: [],
      activity: [],
    }

    try {
      const created = await createTenant(payload)
      setTenants((t) => [created, ...t])
      setForm({
        name: '', unit: '', email: '', phone: '', taxId: '', leaseStart: '', leaseEnd: '', rent: '', status: 'Due', nextDue: '', contract: '12 month lease', cycle: 'Monthly'
      })
      setShowForm(false)
    } catch (error) {
      console.error('Failed to add tenant', error)
    }
  }

  const handleShowForm = () => setShowForm(true)
  const handleCancel = () => setShowForm(false)

  return (
    <MainLayout>
      <div className="page-header">
        <div>
          <h2>Tenants</h2>
          <p>Review contact details, lease contracts, payments, documents and activity history.</p>
        </div>
      </div>

      {showForm && (
        <form className="card tenant-form" onSubmit={handleAdd}>
          <div className="form-grid">
            <div className="form-group">
              <label>Name</label>
              <input name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Unit</label>
              <input name="unit" value={form.unit} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>SSN / ITIN / EIN</label>
              <input name="taxId" value={form.taxId} onChange={handleChange} placeholder="123-45-6789" />
            </div>
            <div className="form-group">
              <label>Lease start</label>
              <input name="leaseStart" value={form.leaseStart} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Lease end</label>
              <input name="leaseEnd" value={form.leaseEnd} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Rent</label>
              <input name="rent" value={form.rent} onChange={handleChange} />
            </div>
            <div className="form-actions">
              <button className="primary-button" type="submit">Add tenant</button>
              <button className="secondary-button" type="button" onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        </form>
      )}

      <div className="tenant-list">
        {loading ? (
          <p className="muted-text">Loading tenants...</p>
        ) : tenants.length === 0 ? (
          <p className="muted-text">No tenants in the database yet.</p>
        ) : (
          tenants.map((tenant) => (
          <NavLink key={tenant.id} to={`/ach-credit?tenantId=${tenant.id}`} className="tenant-item tenant-item-link">
            <div className="property-item-summary">
              <div>
                <p className="property-item-line"><strong>{tenant.name}</strong> — {tenant.unit}</p>
                <p className="ach-tenant-subline">Pay rent via ACH / Credit →</p>
              </div>
              <span className={`status-badge ${tenant.status === 'Paid' ? 'status-paid' : tenant.status === 'Due' ? 'status-due' : 'status-overdue'}`}>
                {tenant.status}
              </span>
            </div>
          </NavLink>
          ))
        )}
      </div>
    </MainLayout>
  )
}
