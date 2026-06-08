import { useState } from 'react'
import MailboxPanel from './MailboxPanel'
import { formatLeaseDate } from '../utils/leaseDates'

function tenantFinancials(payments, tenant) {
  const rows = payments.filter((payment) => Number(payment.tenantId) === Number(tenant.id))
  const deposit = rows
    .filter((payment) => payment.type === 'Deposit')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0)
  const due = rows
    .filter((payment) => ['Due', 'Overdue', 'Pending'].includes(payment.status) && payment.type !== 'Refund')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0)
  const paid = rows
    .filter((payment) => payment.status === 'Paid' && payment.type !== 'Refund')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0)
  const position = paid + deposit - due
  const positionLabel = position >= 0 ? 'Balanced' : `Debt $${Math.abs(position).toLocaleString()}`
  const statusClass = position >= 0 ? 'status-paid' : 'status-overdue'
  return { deposit, due, positionLabel, statusClass }
}

export default function TenantDetailsBlock({ tenant, payments, defaultTab = 'activity', compactHeader = false }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const { deposit, due, positionLabel, statusClass } = tenantFinancials(payments, tenant)

  return (
    <>
      {!compactHeader && (
        <div className="tenant-card-header">
          <div>
            <h4>Tenant details</h4>
            <p className="tenant-name">{tenant.name}</p>
          </div>
          <span className={`status-badge ${tenant.status === 'Paid' ? 'status-paid' : tenant.status === 'Due' ? 'status-due' : 'status-overdue'}`}>
            {tenant.status}
          </span>
        </div>
      )}

      <div className="tenant-tabs" role="tablist">
        <button className={`tenant-tab ${activeTab === 'activity' ? 'active' : ''}`} type="button" role="tab" aria-selected={activeTab === 'activity'} onClick={() => setActiveTab('activity')}>Activity</button>
        <button className={`tenant-tab ${activeTab === 'personal' ? 'active' : ''}`} type="button" role="tab" aria-selected={activeTab === 'personal'} onClick={() => setActiveTab('personal')}>Personal information</button>
        <button className={`tenant-tab ${activeTab === 'financial' ? 'active' : ''}`} type="button" role="tab" aria-selected={activeTab === 'financial'} onClick={() => setActiveTab('financial')}>Financial</button>
        <button className={`tenant-tab ${activeTab === 'documents' ? 'active' : ''}`} type="button" role="tab" aria-selected={activeTab === 'documents'} onClick={() => setActiveTab('documents')}>Documents</button>
        <button className={`tenant-tab ${activeTab === 'mailbox' ? 'active' : ''}`} type="button" role="tab" aria-selected={activeTab === 'mailbox'} onClick={() => setActiveTab('mailbox')}>Mailbox</button>
      </div>

      {activeTab === 'activity' && (
        <div className="tenant-tab-panel tenant-activity">
          <ul>
            {(tenant.activity || []).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'personal' && (
        <div className="tenant-tab-panel tenant-personal-grid property-meta-grid">
          <div>
            <span className="meta-label">Name</span>
            <p>{tenant.name}</p>
          </div>
          <div>
            <span className="meta-label">Email</span>
            <p>{tenant.email}</p>
          </div>
          <div>
            <span className="meta-label">Phone</span>
            <p>{tenant.phone}</p>
          </div>
          <div>
            <span className="meta-label">Unit</span>
            <p>{tenant.unit}</p>
          </div>
          <div>
            <span className="meta-label">SSN / ITIN / EIN</span>
            <p>{tenant.taxId || '—'}</p>
          </div>
        </div>
      )}

      {activeTab === 'financial' && (
        <div className="tenant-tab-panel">
          <div className="tenant-contact-grid">
            <div className="tenant-detail-card">
              <h5>Lease</h5>
              <p><strong>Term:</strong> {tenant.contract}</p>
              <p><strong>Cycle:</strong> {tenant.cycle}</p>
              <p><strong>Period:</strong> {formatLeaseDate(tenant.leaseStart)} — {formatLeaseDate(tenant.leaseEnd)}</p>
              {tenant.contractUrl ? (
                <a className="link-button" href={tenant.contractUrl} target="_blank" rel="noreferrer">View contract</a>
              ) : null}
            </div>
            <div className="tenant-detail-card">
              <h5>Financials</h5>
              <p><strong>Rent:</strong> {tenant.rent}</p>
              <p><strong>Deposit:</strong> ${deposit.toLocaleString()}</p>
              <p><strong>Due amount:</strong> ${due.toLocaleString()}</p>
              <p><strong>Position:</strong> <span className={statusClass}>{positionLabel}</span></p>
              <p><strong>Next due:</strong> {tenant.nextDue || '—'}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="tenant-tab-panel">
          <ul className="tenant-documents-list">
            {(tenant.documents || []).map((doc, idx) => (
              <li key={idx}>{doc}</li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'mailbox' && (
        <div className="tenant-tab-panel mailbox-panel">
          <MailboxPanel messages={tenant.mailbox} />
        </div>
      )}
    </>
  )
}
