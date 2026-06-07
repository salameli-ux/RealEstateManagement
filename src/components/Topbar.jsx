import { useLocation } from 'react-router-dom'

export default function Topbar() {
  const location = useLocation()
  const isProperties = location.pathname.startsWith('/properties')
  const isTenants = location.pathname.startsWith('/tenants')
  const showAddButton = isProperties || isTenants
  const placeholder = isTenants ? 'Search tenants...' : 'Search properties...'
  const buttonLabel = isTenants ? 'Add tenant' : 'Add property'
  const eventName = isTenants ? 'open-add-tenant-form' : 'open-add-property-form'

  return (
    <div className="topbar topbar-thin">
      <div className="topbar-search">
        <input placeholder={placeholder} />
      </div>
      {showAddButton && (
        <button
          type="button"
          className="secondary-button topbar-action-button"
          onClick={() => window.dispatchEvent(new CustomEvent(eventName))}
        >
          {buttonLabel}
        </button>
      )}
    </div>
  )
}
