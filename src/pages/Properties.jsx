import { useEffect, useState, useRef } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { fetchProperties, createProperty, updateProperty, deleteProperty } from '../services/api'

const defaultForm = {
  title: '',
  address: '',
  imageUrl: '',
  type: 'Single Family',
  price: '',
  purchasePrice: '',
  purchaseDate: '',
  zillowEstimate: '',
  yield: '',
  status: 'Available',
  rent: '',
  beds: '',
  baths: '',
  ownerName: '',
  ownerTaxId: '',
}

const statusBadgeClass = (status) =>
  status === 'Leased' ? 'status-paid' : status === 'Available' ? 'status-due' : 'status-overdue'

const isPropertyOccupied = (property) => {
  if (typeof property.currentTenantCount === 'number') {
    return property.currentTenantCount > 0
  }
  return !['Available', 'Vacant'].includes(property.status)
}

export default function Properties() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [formState, setFormState] = useState(defaultForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    let active = true

    fetchProperties()
      .then((data) => {
        if (active) setProperties(data)
      })
      .catch((error) => {
        console.error('Failed to load properties', error)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])
  const formRef = useRef(null)

  useEffect(() => {
    const openPropertyForm = () => {
      setShowForm(true)
      setEditingId(null)
      setFormState(defaultForm)
      setTimeout(() => {
        if (formRef.current) {
          const titleInput = formRef.current.querySelector('input[name="title"]')
          if (titleInput) titleInput.focus()
        }
      }, 80)
    }

    const openEditPropertyForm = (event) => {
      const id = Number(event.detail?.id)
      const property = properties.find((item) => Number(item.id) === id)
      if (property) startEditProperty(property)
    }

    window.addEventListener('open-add-property-form', openPropertyForm)
    window.addEventListener('open-edit-property-form', openEditPropertyForm)
    return () => {
      window.removeEventListener('open-add-property-form', openPropertyForm)
      window.removeEventListener('open-edit-property-form', openEditPropertyForm)
    }
  }, [properties])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const startEditProperty = (property) => {
    setFormState({
      title: property.title,
      address: property.address,
      imageUrl: property.imageUrl,
      type: property.type,
      price: property.price,
      purchasePrice: property.purchasePrice || '',
      purchaseDate: property.purchaseDate || '',
      zillowEstimate: property.zillowEstimate,
      yield: property.yield,
      status: property.status,
      rent: property.rent,
      beds: property.beds,
      baths: property.baths,
      ownerName: property.ownerName || '',
      ownerTaxId: property.ownerTaxId || '',
    })
    setEditingId(property.id)
    setShowForm(true)
    setTimeout(() => {
      if (formRef.current) {
        const titleInput = formRef.current.querySelector('input[name="title"]')
        if (titleInput) titleInput.focus()
      }
    }, 80)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setFormState(defaultForm)
    setShowForm(false)
  }

  const handleAddProperty = async (event) => {
    event.preventDefault()
    const existing = editingId ? properties.find((item) => Number(item.id) === Number(editingId)) : null
    const payload = {
      title: formState.title.trim() || existing?.title || 'New Property',
      address: formState.address.trim() || existing?.address || '',
      imageUrl: formState.imageUrl.trim() || existing?.imageUrl || '',
      type: formState.type || existing?.type || 'Single Family',
      price: Number(formState.price) || existing?.price || 0,
      purchasePrice: Number(formState.purchasePrice) || existing?.purchasePrice || 0,
      purchaseDate: formState.purchaseDate || existing?.purchaseDate || '',
      zillowEstimate: Number(formState.zillowEstimate) || existing?.zillowEstimate || 0,
      currentValue: existing?.currentValue ?? (Number(formState.price) || 0),
      yield: Number(formState.yield) || existing?.yield || 0,
      status: formState.status || 'Available',
      rent: Number(formState.rent) || 0,
      beds: Number(formState.beds) || 0,
      baths: Number(formState.baths) || 0,
      ownerName: formState.ownerName.trim() || existing?.ownerName || '',
      ownerTaxId: formState.ownerTaxId.trim() || existing?.ownerTaxId || '',
    }

    try {
      if (editingId) {
        const updated = await updateProperty(editingId, payload)
        setProperties((prev) =>
          prev.map((prop) => (Number(prop.id) === Number(editingId) ? updated : prop))
        )
        window.dispatchEvent(new CustomEvent('property-updated', { detail: { property: updated } }))
      } else {
        const created = await createProperty(payload)
        setProperties((prev) => [created, ...prev])
      }
      setFormState(defaultForm)
      setEditingId(null)
      setShowForm(false)
    } catch (error) {
      console.error('Failed to save property', error)
    }
  }

  const handleDeleteProperty = async (id) => {
    try {
      await deleteProperty(id)
      setProperties((prev) => prev.filter((property) => property.id !== id))
      if (editingId === id) {
        handleCancelEdit()
      }
    } catch (error) {
      console.error('Failed to delete property', error)
    }
  }

  const sortedProperties = [...properties].sort((a, b) =>
    (a.address || '').localeCompare(b.address || '', undefined, { sensitivity: 'base' })
  )

  const propertyForm = (
    <div className="properties-detail-pane">
      {editingId && (
        <div className="property-detail-header">
          <span className={`status-badge ${statusBadgeClass(formState.status)}`}>
            {formState.status}
          </span>
          <h2>{formState.address}</h2>
        </div>
      )}

      <form ref={formRef} className="property-form property-form-panel card" onSubmit={handleAddProperty}>
        {!editingId && <h3>Add new property</h3>}
        <div className="form-grid property-form-grid">
        <div className="form-group">
          <label>Property name</label>
          <input name="title" value={formState.title} onChange={handleChange} placeholder="e.g. Brooklyn Townhouse" />
        </div>
        {!editingId && (
          <div className="form-group">
            <label>Address</label>
            <input name="address" value={formState.address} onChange={handleChange} placeholder="Street, City, State" />
          </div>
        )}
        <div className="form-group">
          <label>Owner name</label>
          <input name="ownerName" value={formState.ownerName} onChange={handleChange} placeholder="e.g. Robert Chen" />
        </div>
        <div className="form-group">
          <label>SSN / ITIN / EIN</label>
          <input name="ownerTaxId" value={formState.ownerTaxId} onChange={handleChange} placeholder="123-45-6789" />
        </div>
        <div className="form-group">
          <label>Image URL</label>
          <input name="imageUrl" value={formState.imageUrl} onChange={handleChange} placeholder="https://..." />
        </div>
        <div className="form-group">
          <label>Property type</label>
          <select name="type" value={formState.type} onChange={handleChange}>
            <option>Single Family</option>
            <option>Condo</option>
            <option>Townhome</option>
            <option>Duplex</option>
            <option>Multi-family</option>
          </select>
        </div>
        <div className="form-group">
          <label>Market price</label>
          <input name="price" value={formState.price} onChange={handleChange} placeholder="450000" />
        </div>
        <div className="form-group">
          <label>Purchase price</label>
          <input name="purchasePrice" value={formState.purchasePrice} onChange={handleChange} placeholder="420000" />
        </div>
        <div className="form-group">
          <label>Purchase date</label>
          <input name="purchaseDate" value={formState.purchaseDate} onChange={handleChange} placeholder="YYYY-MM-DD" />
        </div>
        <div className="form-group">
          <label>Zillow estimate</label>
          <input name="zillowEstimate" value={formState.zillowEstimate} onChange={handleChange} placeholder="460000" />
        </div>
        <div className="form-group">
          <label>Yield (%)</label>
          <input name="yield" value={formState.yield} onChange={handleChange} placeholder="5.6" />
        </div>
        {!editingId && (
          <div className="form-group">
            <label>Rental status</label>
            <select name="status" value={formState.status} onChange={handleChange}>
              <option>Available</option>
              <option>Leased</option>
              <option>Renewal</option>
              <option>Vacant</option>
            </select>
          </div>
        )}
        <div className="form-group">
          <label>Rent per month</label>
          <input name="rent" value={formState.rent} onChange={handleChange} placeholder="3200" />
        </div>
        <div className="form-group">
          <label>Beds</label>
          <input name="beds" value={formState.beds} onChange={handleChange} placeholder="3" />
        </div>
        <div className="form-group">
          <label>Baths</label>
          <input name="baths" value={formState.baths} onChange={handleChange} placeholder="2" />
        </div>
      </div>

      <div className="form-actions">
        <button className="primary-button" type="submit">
          {editingId ? 'Save changes' : 'Add property'}
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
            <input placeholder="Search properties..." />
          </div>
          <div className="contact-list">
            <div className="contact-group">
              {loading ? (
                <div className="ach-list-empty">Loading properties...</div>
              ) : sortedProperties.length === 0 ? (
                <div className="ach-list-empty">No properties in the database yet.</div>
              ) : (
                sortedProperties.map((property) => (
                <NavLink
                  key={property.id}
                  to={`/properties/${property.id}`}
                  className={({ isActive }) => `contact-row${isActive ? ' active' : ''}`}
                >
                  <span
                    className={`contact-status-dot ${isPropertyOccupied(property) ? 'occupied' : 'vacant'}`}
                    aria-label={isPropertyOccupied(property) ? 'Occupied' : 'Vacant'}
                  />
                  <div className="contact-row-body">
                    <span className="contact-row-title">{property.address}</span>
                  </div>
                </NavLink>
              ))
              )}
            </div>
          </div>
        </aside>

        {showForm ? propertyForm : <Outlet />}
      </div>
    </MainLayout>
  )
}
