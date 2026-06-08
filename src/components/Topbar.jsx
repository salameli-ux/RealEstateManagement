import { useLocation } from 'react-router-dom'

export default function Topbar() {
  const location = useLocation()
  const isProperties = location.pathname.startsWith('/properties')
  const isTenantPortal = location.pathname.startsWith('/tenant-portal')
  const placeholder = isTenantPortal ? 'Search tenants...' : 'Search properties...'
  const selectedPropertyId = location.pathname.match(/^\/properties\/(\d+)/)?.[1]
  const selectedTenantId = location.pathname.match(/^\/tenant-portal\/(\d+)/)?.[1]

  const openAddForm = () => {
    window.dispatchEvent(new CustomEvent(isTenantPortal ? 'open-add-tenant-form' : 'open-add-property-form'))
  }

  const openEditForm = () => {
    if (isTenantPortal) {
      if (!selectedTenantId) return
      window.dispatchEvent(new CustomEvent('open-edit-tenant-form', { detail: { id: Number(selectedTenantId) } }))
      return
    }
    if (!selectedPropertyId) return
    window.dispatchEvent(new CustomEvent('open-edit-property-form', { detail: { id: Number(selectedPropertyId) } }))
  }

  return (
    <div className={`topbar topbar-thin${isProperties || isTenantPortal ? ' topbar-properties' : ''}`}>
      {!isProperties && !isTenantPortal && (
        <div className="topbar-search">
          <input placeholder={placeholder} />
        </div>
      )}
      {isProperties && (
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
      {isTenantPortal && (
        <div className="topbar-actions">
          <button
            type="button"
            className="secondary-button topbar-action-button"
            disabled={!selectedTenantId}
            onClick={openEditForm}
          >
            Edit tenant
          </button>
          <button
            type="button"
            className="secondary-button topbar-action-button"
            onClick={openAddForm}
          >
            Add tenant
          </button>
        </div>
      )}
    </div>
  )
}
