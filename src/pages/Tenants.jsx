import { useEffect, useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import { fetchTenants, createTenant } from '../services/api'

const initialTenants = [
  {
    name: 'John Smith',
    unit: 'Atlanta Duplex',
    email: 'john.smith@example.com',
    phone: '(404) 555-0178',
    taxId: '456-78-9012',
    leaseStart: 'Jan 5, 2025',
    leaseEnd: 'Jan 4, 2026',
    rent: '$3,250',
    status: 'Paid',
    nextDue: 'Jun 1',
    contract: '12 month lease',
    cycle: 'Monthly',
    documents: ['Lease agreement', 'ID copy', 'Move-in checklist'],
    activity: ['May 1 - Rent received', 'Apr 27 - Maintenance request completed', 'Apr 15 - Lease reminder sent'],
  },
  {
    name: 'Kelly Rivera',
    unit: 'Miami Condo',
    email: 'kelly.rivera@example.com',
    phone: '(305) 555-0231',
    taxId: '789-01-2345',
    leaseStart: 'Mar 15, 2025',
    leaseEnd: 'Mar 14, 2026',
    rent: '$2,100',
    status: 'Due',
    nextDue: 'May 29',
    contract: '12 month lease',
    cycle: 'Monthly',
    documents: ['Lease agreement', 'Security deposit receipt', 'Pet addendum'],
    activity: ['Apr 20 - Payment reminder sent', 'Apr 10 - Lease signed', 'Mar 18 - Welcome email sent'],
  },
  {
    name: 'Marcus Lee',
    unit: 'Chicago Townhome',
    email: 'marcus.lee@example.com',
    phone: '(312) 555-0450',
    taxId: '321-54-6789',
    leaseStart: 'Feb 1, 2025',
    leaseEnd: 'Jan 31, 2026',
    rent: '$2,880',
    status: 'Overdue',
    nextDue: 'May 16',
    contract: '11 month lease',
    cycle: 'Monthly',
    documents: ['Lease agreement', 'Insurance proof', 'Payment authorization'],
    activity: ['May 16 - Payment overdue', 'May 5 - Maintenance follow-up', 'Apr 22 - Rent partial payment'],
  },
]

export default function Tenants() {
  const [tenants, setTenants] = useState(initialTenants)
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
        {tenants.map((tenant, idx) => (
          <div key={`${tenant.name}-${idx}`} className="tenant-item tenant-item-link">
            <div className="property-item-summary">
              <div>
                <p className="property-item-line"><strong>{tenant.name}</strong> — {tenant.unit}</p>
              </div>
              <span className={`status-badge ${tenant.status === 'Paid' ? 'status-paid' : tenant.status === 'Due' ? 'status-due' : 'status-overdue'}`}>
                {tenant.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  )
}
