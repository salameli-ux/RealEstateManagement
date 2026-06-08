import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/properties', label: 'Properties' },
  { to: '/tenant-portal', label: 'Tenants' },
  { to: '/ach-credit', label: 'ACH / Credit' },
  { to: '/payments', label: 'Payments' },
  { to: '/reports', label: 'Reports' },
  { to: '/ai', label: 'AI Insights' },
  { to: '/settings', label: 'Settings' },
]

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="logo-mark">RE</div>
        <div>
          <h2>RealEstate Pulse</h2>
          <p className="sidebar-copy">Manage properties, tenants and growth from one dashboard.</p>
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
        <p>Optimized for modern property teams and portfolio growth.</p>
      </div>
    </div>
  )
}
