import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { fetchTenants, createTenant, updateTenant } from '../services/api'

const defaultForm = {
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
}

export default function TenantPortal() {
  const location = useLocation()
  const [tenants, setTenants] = useState([])
  const [search, setSearch] = useState('')
  const [formState, setFormState] = useState(defaultForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [activeTenantId, setActiveTenantId] = useState('')
  const formRef = useRef(null)
  const listRef = useRef(null)

  const selectedTenantId = location.pathname.match(/^\/tenant-portal\/(\d+)/)?.[1]

  useEffect(() => {
    if (selectedTenantId) setActiveTenantId(String(selectedTenantId))
  }, [selectedTenantId])

  useEffect(() => {
    if (!activeTenantId || !listRef.current) return
    const row = listRef.current.querySelector(`[data-tenant-id="${activeTenantId}"]`)
    row?.scrollIntoView({ block: 'nearest' })
  }, [activeTenantId, tenants.length])

  useEffect(() => {
    let active = true
    fetchTenants()
      .then((data) => {
        if (active) setTenants(data)
      })
      .catch((error) => {
        console.error('Failed to load tenants', error)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const openTenantForm = () => {
      setShowForm(true)
      setEditingId(null)
      setFormState(defaultForm)
      setTimeout(() => {
        if (formRef.current) {
          const nameInput = formRef.current.querySelector('input[name="name"]')
          if (nameInput) nameInput.focus()
        }
      }, 80)
    }

    const openEditTenantForm = (event) => {
      const id = Number(event.detail?.id)
      const tenant = tenants.find((item) => Number(item.id) === id)
      if (tenant) startEditTenant(tenant)
    }

    window.addEventListener('open-add-tenant-form', openTenantForm)
    window.addEventListener('open-edit-tenant-form', openEditTenantForm)
    return () => {
      window.removeEventListener('open-add-tenant-form', openTenantForm)
      window.removeEventListener('open-edit-tenant-form', openEditTenantForm)
    }
  }, [tenants])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const startEditTenant = (tenant) => {
    setFormState({
      name: tenant.name || '',
      unit: tenant.unit || '',
      email: tenant.email || '',
      phone: tenant.phone || '',
      taxId: tenant.taxId || '',
      leaseStart: tenant.leaseStart || '',
      leaseEnd: tenant.leaseEnd || '',
      rent: tenant.rent || '',
      status: tenant.status || 'Due',
      nextDue: tenant.nextDue || '',
      contract: tenant.contract || '12 month lease',
      cycle: tenant.cycle || 'Monthly',
    })
    setEditingId(tenant.id)
    setShowForm(true)
    setTimeout(() => {
      if (formRef.current) {
        const nameInput = formRef.current.querySelector('input[name="name"]')
        if (nameInput) nameInput.focus()
      }
    }, 80)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setFormState(defaultForm)
    setShowForm(false)
  }

  const handleSaveTenant = async (event) => {
    event.preventDefault()
    const payload = {
      ...formState,
      documents: editingId ? undefined : [],
      activity: editingId ? undefined : [],
    }

    try {
      if (editingId) {
        const existing = tenants.find((item) => Number(item.id) === Number(editingId))
        const updated = await updateTenant(editingId, {
          ...existing,
          ...payload,
          documents: existing?.documents || [],
          activity: existing?.activity || [],
        })
        setTenants((prev) => prev.map((tenant) => (Number(tenant.id) === Number(editingId) ? updated : tenant)))
        window.dispatchEvent(new CustomEvent('tenant-updated', { detail: { tenant: updated } }))
      } else {
        const created = await createTenant(payload)
        setTenants((prev) => [created, ...prev])
      }
      setFormState(defaultForm)
      setEditingId(null)
      setShowForm(false)
    } catch (error) {
      console.error('Failed to save tenant', error)
    }
  }

  const sortedTenants = useMemo(
    () => [...tenants].sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })),
    [tenants]
  )

  const handleSelectTenant = (tenantId) => {
    setActiveTenantId(String(tenantId))
    setSearch('')
    setShowForm(false)
    setEditingId(null)
    setFormState(defaultForm)
  }

  const tenantForm = (
    <div className="properties-detail-pane">
      {editingId && (
        <div className="property-detail-header">
          <h2>{formState.name || 'Tenant'}</h2>
        </div>
      )}

      <form ref={formRef} className="property-form property-form-panel card" onSubmit={handleSaveTenant}>
        {!editingId && <h3>Add new tenant</h3>}
        <div className="form-grid property-form-grid">
          <div className="form-group">
            <label>Name</label>
            <input name="name" value={formState.name} onChange={handleChange} placeholder="Kelly Rivera" required />
          </div>
          <div className="form-group">
            <label>Unit</label>
            <input name="unit" value={formState.unit} onChange={handleChange} placeholder="Unit 12B — 18 Ocean Drive" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" value={formState.email} onChange={handleChange} placeholder="tenant@example.com" />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input name="phone" value={formState.phone} onChange={handleChange} placeholder="(305) 555-0231" />
          </div>
          <div className="form-group">
            <label>SSN / ITIN / EIN</label>
            <input name="taxId" value={formState.taxId} onChange={handleChange} placeholder="123-45-6789" />
          </div>
          <div className="form-group">
            <label>Lease start</label>
            <input name="leaseStart" value={formState.leaseStart} onChange={handleChange} placeholder="2025-03-15" />
          </div>
          <div className="form-group">
            <label>Lease end</label>
            <input name="leaseEnd" value={formState.leaseEnd} onChange={handleChange} placeholder="2026-03-14" />
          </div>
          <div className="form-group">
            <label>Rent</label>
            <input name="rent" value={formState.rent} onChange={handleChange} placeholder="2850" />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formState.status} onChange={handleChange}>
              <option>Paid</option>
              <option>Due</option>
              <option>Overdue</option>
            </select>
          </div>
          <div className="form-group">
            <label>Next due</label>
            <input name="nextDue" value={formState.nextDue} onChange={handleChange} placeholder="Jun 1" />
          </div>
          <div className="form-group">
            <label>Contract</label>
            <input name="contract" value={formState.contract} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Cycle</label>
            <select name="cycle" value={formState.cycle} onChange={handleChange}>
              <option>Monthly</option>
              <option>Weekly</option>
              <option>Quarterly</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button className="primary-button" type="submit">
            {editingId ? 'Save changes' : 'Add tenant'}
          </button>
          <button className="secondary-button" type="button" onClick={handleCancelEdit}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )

  return (
    <MainLayout>
      <div className="properties-split">
        <aside className="properties-list-pane">
          <div className="properties-list-search">
            <input
              placeholder="Search tenants..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="contact-list" ref={listRef}>
            <div className="contact-group">
              {sortedTenants.length === 0 ? (
                <div className="ach-list-empty">No tenants found.</div>
              ) : (
                sortedTenants.map((tenant) => {
                  const query = search.trim().toLowerCase()
                  const matchesSearch = !query || [tenant.name, tenant.unit, tenant.email, tenant.phone]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(query))
                  const isActive = String(tenant.id) === String(activeTenantId || selectedTenantId)
                  return (
                    <Link
                      key={tenant.id}
                      to={`/tenant-portal/${tenant.id}`}
                      data-tenant-id={tenant.id}
                      className={`contact-row tenant-list-row${isActive ? ' active' : ''}${matchesSearch ? '' : ' tenant-list-row-filtered'}`}
                      onClick={() => handleSelectTenant(tenant.id)}
                    >
                      <div className="contact-row-body">
                        <span className="contact-row-title">{tenant.name}</span>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </div>
        </aside>

        {showForm ? tenantForm : <Outlet />}
      </div>
    </MainLayout>
  )
}
