import { useEffect, useState, useRef } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { fetchProperties, createProperty, updateProperty, deleteProperty } from '../services/api'

const initialProperties = [
  {
    id: 1,
    title: 'Atlanta Duplex',
    address: '245 Peachtree St, Atlanta, GA',
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
    type: 'Duplex',
    price: 540000,
    purchasePrice: 495000,
    purchaseDate: '2018-03-22',
    currentValue: 610000,
    zillowEstimate: 560000,
    yield: 5.7,
    status: 'Leased',
    rent: 3250,
    beds: 4,
    baths: 2,
    ownerName: 'Robert Chen',
    ownerTaxId: '123-45-6789',
  },
  {
    id: 2,
    title: 'Miami Condo',
    address: '18 Ocean Drive, Miami, FL',
    imageUrl: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80',
    type: 'Condo',
    price: 420000,
    purchasePrice: 385000,
    purchaseDate: '2020-05-10',
    currentValue: 455000,
    zillowEstimate: 430000,
    yield: 6.0,
    status: 'Available',
    rent: 2100,
    beds: 2,
    baths: 2,
    ownerName: 'Sunrise Holdings LLC',
    ownerTaxId: '87-6543210',
  },
  {
    id: 3,
    title: 'Chicago Townhome',
    address: '790 Lakeview Ave, Chicago, IL',
    imageUrl: 'https://images.unsplash.com/photo-1494527494455-0f29a669841a?auto=format&fit=crop&w=800&q=80',
    type: 'Townhome',
    price: 470000,
    purchasePrice: 430000,
    purchaseDate: '2019-09-15',
    currentValue: 505000,
    zillowEstimate: 485000,
    yield: 5.8,
    status: 'Renewal',
    rent: 2880,
    beds: 3,
    baths: 2,
    ownerName: 'Patricia Williams',
    ownerTaxId: '912-34-5678',
  },
]

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

const zillowImagePool = [
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=640&q=80',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=640&q=80',
  'https://images.unsplash.com/photo-1560184897-a045d7ebb20d?auto=format&fit=crop&w=640&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=640&q=80',
]

const mockZillowLookup = ({ title, address, price = 450000 }) => {
  const key = `${title}`.toLowerCase() + ` ${address}`.toLowerCase()
  const sampleData = [
    {
      match: 'atlanta duplex 245 peachtree st, atlanta, ga',
      type: 'Duplex',
      purchaseDate: '2018-05-12',
      currentValue: 610000,
      imageUrl: zillowImagePool[0],
      zillowEstimate: 615000,
      yield: 5.5,
    },
    {
      match: 'miami condo 18 ocean drive, miami, fl',
      type: 'Condo',
      purchaseDate: '2020-11-03',
      currentValue: 455000,
      imageUrl: zillowImagePool[1],
      zillowEstimate: 462000,
      yield: 6.1,
    },
    {
      match: 'chicago townhome 790 lakeview ave, chicago, il',
      type: 'Townhome',
      purchaseDate: '2019-02-20',
      currentValue: 505000,
      imageUrl: zillowImagePool[2],
      zillowEstimate: 512000,
      yield: 5.9,
    },
  ]

  const found = sampleData.find((item) => key.includes(item.match))
  if (found) return found

  return {
    type: title.toLowerCase().includes('condo') ? 'Condo' : 'Single Family',
    purchaseDate: `${2020 + Math.floor(Math.random() * 4)}-${String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')}-${String(1 + Math.floor(Math.random() * 27)).padStart(2, '0')}`,
    currentValue: Number((price * (1 + Math.random() * 0.15)).toFixed(0)),
    purchasePrice: Number((price * (0.8 + Math.random() * 0.15)).toFixed(0)),
    imageUrl: zillowImagePool[Math.floor(Math.random() * zillowImagePool.length)],
    zillowEstimate: Number((price * (1 + Math.random() * 0.1)).toFixed(0)),
    yield: Number((4.5 + Math.random() * 1.5).toFixed(1)),
  }
}

export default function Properties() {
  const [properties, setProperties] = useState(initialProperties)
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
    const priceValue = Number(formState.price) || existing?.price || 450000
    const zillowData = existing
      ? null
      : mockZillowLookup({ title: formState.title, address: formState.address, price: priceValue })
    const payload = {
      title: formState.title.trim() || existing?.title || 'New Property',
      address: formState.address.trim() || existing?.address || 'Unknown address',
      imageUrl: formState.imageUrl.trim() || existing?.imageUrl || zillowData?.imageUrl,
      type: formState.type || existing?.type || zillowData?.type,
      price: priceValue,
      purchasePrice: Number(formState.purchasePrice) || existing?.purchasePrice || zillowData?.purchasePrice,
      purchaseDate: formState.purchaseDate || existing?.purchaseDate || zillowData?.purchaseDate,
      zillowEstimate: Number(formState.zillowEstimate) || existing?.zillowEstimate || zillowData?.zillowEstimate,
      currentValue: existing?.currentValue ?? zillowData?.currentValue,
      yield: Number(formState.yield) || existing?.yield || zillowData?.yield,
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

  const refreshZillow = async (title) => {
    const current = properties.find((property) => property.title === title)
    if (!current) return
    const adjustment = 1 + (Math.random() * 0.08 - 0.02)
    const updatedEstimate = Math.round((current.price || 0) * adjustment / 1000) * 1000
    const updatedImage = zillowImagePool[Math.floor(Math.random() * zillowImagePool.length)]
    const updatedProperty = {
      ...current,
      zillowEstimate: updatedEstimate,
      yield: Number((current.yield + (Math.random() * 0.6 - 0.2)).toFixed(1)),
      imageUrl: updatedImage,
    }

    try {
      const saved = await updateProperty(current.id, updatedProperty)
      setProperties((prev) => prev.map((property) => (property.id === current.id ? saved : property)))
    } catch (error) {
      console.error('Failed to refresh Zillow data', error)
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

  const importFromZillow = async () => {
    const placeholderProperty = {
      title: 'Zillow Imported Home',
      address: '765 Market St, San Francisco, CA',
      imageUrl: zillowImagePool[Math.floor(Math.random() * zillowImagePool.length)],
      type: 'Single Family',
      price: 975000,
      purchasePrice: 860000,
      currentValue: 1015000,
      zillowEstimate: 990000,
      purchaseDate: '2021-08-10',
      yield: 4.8,
      status: 'Available',
      rent: 4200,
      beds: 4,
      baths: 3,
    }

    try {
      const created = await createProperty(placeholderProperty)
      setProperties((prev) => [created, ...prev])
    } catch (error) {
      console.error('Failed to import Zillow property', error)
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
              {sortedProperties.map((property) => (
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
              ))}
            </div>
          </div>
        </aside>

        {showForm ? propertyForm : <Outlet />}
      </div>
    </MainLayout>
  )
}
