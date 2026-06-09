import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { fetchSignInOptions } from '../services/api'
import { formatOwnerSignInLabel, formatPmSignInLabel, formatTenantSignInLabel } from '../data/signInDemo'

function applySignInOptions(data, setters) {
  const options = {
    tenants: data.tenants ?? [],
    owners: data.owners ?? [],
    pms: data.pms ?? [],
  }
  setters.setOptions(options)
  setters.setSelectedTenantId(options.tenants[0] ? String(options.tenants[0].id) : '')
  setters.setSelectedOwnerId(options.owners[0] ? String(options.owners[0].id) : '')
  setters.setSelectedPmId(options.pms[0] ? String(options.pms[0].id) : '')
}

const roleHome = {
  pm: '/dashboard',
  tenant: '/my/tenant',
  owner: '/my/owner',
}

function SignInColumn({ title, items, selectedId, onSelect, buttonLabel, onSignIn, loading, optionsLoading }) {
  return (
    <div className="sign-in-column">
      <div className="sign-in-list-heading">{title}</div>
      <div className="sign-in-list-scroll">
        <div className="sign-in-list-group">
          {optionsLoading ? (
            <div className="sign-in-list-empty">Loading...</div>
          ) : items.length === 0 ? (
            <div className="sign-in-list-empty">None available</div>
          ) : (
            items.map((item) => (
              <button
                key={`${title}-${item.id}`}
                type="button"
                className={`sign-in-list-row${String(selectedId) === String(item.id) ? ' active' : ''}`}
                onClick={() => onSelect(String(item.id))}
              >
                {item.label}
              </button>
            ))
          )}
        </div>
      </div>
      <button
        type="button"
        className="primary-button sign-in-role-button"
        disabled={!selectedId || loading || optionsLoading}
        onClick={onSignIn}
      >
        {loading ? 'Signing in...' : buttonLabel}
      </button>
    </div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const { session, signInAs } = useAuth()
  const [options, setOptions] = useState({ tenants: [], owners: [], pms: [] })
  const [selectedTenantId, setSelectedTenantId] = useState('')
  const [selectedOwnerId, setSelectedOwnerId] = useState('')
  const [selectedPmId, setSelectedPmId] = useState('')
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [optionsError, setOptionsError] = useState('')
  const [loadingRole, setLoadingRole] = useState('')
  const [error, setError] = useState('')

  const loadOptions = useCallback(() => {
    setOptionsLoading(true)
    setOptionsError('')
    fetchSignInOptions()
      .then((data) => {
        applySignInOptions(data, { setOptions, setSelectedTenantId, setSelectedOwnerId, setSelectedPmId })
      })
      .catch((err) => {
        console.error('Failed to load sign-in options', err)
        setOptions({ tenants: [], owners: [], pms: [] })
        setSelectedTenantId('')
        setSelectedOwnerId('')
        setSelectedPmId('')
        setOptionsError('Could not load lists from the server. Run npm run server on port 4000, then retry.')
      })
      .finally(() => setOptionsLoading(false))
  }, [])

  useEffect(() => {
    if (session?.role) {
      navigate(roleHome[session.role] || '/dashboard', { replace: true })
    }
  }, [session, navigate])

  useEffect(() => {
    loadOptions()
  }, [loadOptions])

  const tenantItems = options.tenants.map((t) => ({ id: t.id, label: formatTenantSignInLabel(t) }))
  const ownerItems = options.owners.map((o) => ({ id: o.id, label: formatOwnerSignInLabel(o) }))
  const pmItems = options.pms.map((p) => ({ id: p.id, label: formatPmSignInLabel(p) }))

  const handleSignIn = async (role) => {
    setError('')
    setLoadingRole(role)
    try {
      if (role === 'tenant') {
        const tenant = options.tenants.find((t) => String(t.id) === String(selectedTenantId))
        if (!tenant) return
        await signInAs({ role: 'tenant', entityId: tenant.id, displayName: tenant.name })
        navigate('/my/tenant')
      } else if (role === 'owner') {
        const owner = options.owners.find((o) => String(o.id) === String(selectedOwnerId))
        if (!owner) return
        await signInAs({ role: 'owner', entityId: owner.id, displayName: owner.ownerName })
        navigate('/my/owner')
      } else {
        const pm = options.pms.find((p) => String(p.id) === String(selectedPmId))
        if (!pm) return
        await signInAs({ role: 'pm', entityId: pm.id, displayName: pm.name })
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Sign in failed.')
    } finally {
      setLoadingRole('')
    }
  }

  return (
    <div className="sign-in-page">
      <div className="sign-in-shell">
        <header className="sign-in-header">
          <div className="logo-mark">RE</div>
          <div>
            <h1>RealEstate Pulse</h1>
            <p>Choose your role and sign in</p>
          </div>
        </header>

        {optionsError ? (
          <div className="sign-in-error-row">
            <p className="form-error sign-in-error">{optionsError}</p>
            <button type="button" className="secondary-button" onClick={loadOptions}>
              Retry
            </button>
          </div>
        ) : null}

        {error ? <p className="form-error sign-in-error">{error}</p> : null}

        <div className="sign-in-columns">
          <SignInColumn
            title="Tenants"
            items={tenantItems}
            selectedId={selectedTenantId}
            onSelect={setSelectedTenantId}
            buttonLabel="Sign in as tenant"
            loading={loadingRole === 'tenant'}
            optionsLoading={optionsLoading}
            onSignIn={() => handleSignIn('tenant')}
          />
          <SignInColumn
            title="Owners"
            items={ownerItems}
            selectedId={selectedOwnerId}
            onSelect={setSelectedOwnerId}
            buttonLabel="Sign in as owner"
            loading={loadingRole === 'owner'}
            optionsLoading={optionsLoading}
            onSignIn={() => handleSignIn('owner')}
          />
          <SignInColumn
            title="Property managers"
            items={pmItems}
            selectedId={selectedPmId}
            onSelect={setSelectedPmId}
            buttonLabel="Sign in as PM"
            loading={loadingRole === 'pm'}
            optionsLoading={optionsLoading}
            onSignIn={() => handleSignIn('pm')}
          />
        </div>
      </div>
    </div>
  )
}
