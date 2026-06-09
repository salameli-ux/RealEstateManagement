import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export default function Topbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { session, logout } = useAuth()
  const isPm = !session?.role || session.role === 'pm'
  const displayName = session?.displayName?.trim() || 'User'
  const roleLabel = session?.role === 'tenant' ? 'Tenant' : session?.role === 'owner' ? 'Owner' : 'Property manager'
  const isProperties = isPm && location.pathname.startsWith('/properties')
  const isTenantPortal = isPm && location.pathname.startsWith('/tenant-portal')
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

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className={`topbar topbar-thin${isProperties || isTenantPortal ? ' topbar-properties' : ''}`}>
      <div className="topbar-user">
        <span className="topbar-user-name">{displayName}</span>
        <span className="topbar-user-role">{roleLabel}</span>
      </div>

      {isProperties && (
        <div className="topbar-actions">
          <button type="button" className="secondary-button topbar-action-button" disabled={!selectedPropertyId} onClick={openEditForm}>
            Edit property
          </button>
          <button type="button" className="secondary-button topbar-action-button" onClick={openAddForm}>
            Add property
          </button>
        </div>
      )}

      {isTenantPortal && (
        <div className="topbar-actions">
          <button type="button" className="secondary-button topbar-action-button" disabled={!selectedTenantId} onClick={openEditForm}>
            Edit tenant
          </button>
          <button type="button" className="secondary-button topbar-action-button" onClick={openAddForm}>
            Add tenant
          </button>
        </div>
      )}

      <button type="button" className="secondary-button topbar-sign-out" onClick={handleLogout}>
        Sign out
      </button>
    </div>
  )
}
