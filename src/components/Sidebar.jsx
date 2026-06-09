import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

const pmLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/properties', label: 'Properties' },
  { to: '/tenant-portal', label: 'Tenants' },
  { to: '/ach-credit', label: 'ACH / Credit' },
  { to: '/payments', label: 'Payments' },
  { to: '/reports', label: 'Reports' },
  { to: '/ai', label: 'AI Insights' },
  { to: '/settings', label: 'Settings' },
]

const tenantLinks = [
  { to: '/my/tenant', label: 'My portal' },
  { to: '/my/tenant/payments', label: 'Payments' },
]
const ownerLinks = [{ to: '/my/owner', label: 'My property' }]

export default function Sidebar() {
  const { session } = useAuth()
  const links = session?.role === 'tenant' ? tenantLinks : session?.role === 'owner' ? ownerLinks : pmLinks

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="logo-mark">RE</div>
        <div>
          <h2>RealEstate Pulse</h2>
          <p className="sidebar-copy">
            {session?.role === 'tenant' ? 'Tenant portal' : session?.role === 'owner' ? 'Owner portal' : 'Property management'}
          </p>
        </div>
      </div>

      <nav>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="status-pill">PRO</span>
        <p>Demo sign-in — select role on login page.</p>
      </div>
    </div>
  )
}
