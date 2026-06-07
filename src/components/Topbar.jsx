import { useLocation } from 'react-router-dom'

export default function Topbar() {
  const location = useLocation()
  const isProperties = location.pathname.startsWith('/properties')
  const isTenants = location.pathname.startsWith('/tenants')
  const showPropertyActions = isProperties
  const showTenantActions = isTenants
  const placeholder = isTenants ? 'Search tenants...' : 'Search properties...'
  const selectedPropertyId = location.pathname.match(/^\/properties\/(\d+)/)?.[1]

  const openAddForm = () => {
    window.dispatchEvent(new CustomEvent(isTenants ? 'open-add-tenant-form' : 'open-add-property-form'))
  }

  const openEditForm = () => {
    if (!selectedPropertyId) return
    window.dispatchEvent(new CustomEvent('open-edit-property-form', { detail: { id: Number(selectedPropertyId) } }))
  }

  return (
    <div className={`topbar topbar-thin${isProperties ? ' topbar-properties' : ''}`}>
      {!isProperties && (
        <div className="topbar-search">
          <input placeholder={placeholder} />
        </div>
      )}
      {showPropertyActions && (
        <div className="topbar-actions">
          <button
            type="button"
            className="secondary-button topbar-action-button"
            disabled={!selectedPropertyId}
            onClick={openEditForm}
          >
            Edit property
          </button>
          <button
            type="button"
            className="secondary-button topbar-action-button"
            onClick={openAddForm}
          >
            Add property
          </button>
        </div>
      )}
      {showTenantActions && (
        <button
          type="button"
          className="secondary-button topbar-action-button"
          onClick={openAddForm}
        >
          Add tenant
        </button>
      )}
    </div>
  )
}
