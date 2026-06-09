import { useEffect, useState } from 'react'
import MailboxPanel from './MailboxPanel'
import LedgerRowActions from './LedgerRowActions'
import LedgerInvoiceModal from './LedgerInvoiceModal'
import LedgerDocumentsModal from './LedgerDocumentsModal'
import { buildPropertyLedger, formatLedgerDate, formatLedgerSum, getLedgerOperationCode, getLedgerSumDirection } from '../utils/ledgerBalance'
import { buildManagementFeeSummary, formatManagementFeeSum, formatManagementFeePercent } from '../utils/managementFees'

export default function OwnerDetailsBlock({ property, payments }) {
  const ownerDocuments = property.ownerDocuments || []
  const ownerMailbox = property.ownerMailbox || []
  const [ownerActiveTab, setOwnerActiveTab] = useState('personal')
  const [invoicePayment, setInvoicePayment] = useState(null)
  const [documentsPayment, setDocumentsPayment] = useState(null)

  useEffect(() => {
    setOwnerActiveTab('personal')
    setInvoicePayment(null)
    setDocumentsPayment(null)
  }, [property.id])

  const ownerPayments = payments.filter((payment) => Number(payment.propertyId) === Number(property.id))
  const ledger = buildPropertyLedger(property.openingBalance, ownerPayments)
  const managementFees = buildManagementFeeSummary(ownerPayments)
  const contractFeeLabel = formatManagementFeePercent(property.managementFeePercent)

  return (
    <>
      <div className="property-list">
        <div className="property-card card owner-details-panel">
          <div className="owner-card-header">
            <div>
              <h4>Owner details</h4>
              <p className="owner-name">{property.ownerName || '—'}</p>
            </div>
            <span className="owner-contract-fee-pill" title="Management Fee rate from owner contract">
              Management Fee: {contractFeeLabel}
            </span>
          </div>

          <div className="tenant-tabs" role="tablist">
            <button className={`tenant-tab ${ownerActiveTab === 'personal' ? 'active' : ''}`} type="button" role="tab" aria-selected={ownerActiveTab === 'personal'} onClick={() => setOwnerActiveTab('personal')}>Personal information</button>
            <button className={`tenant-tab ${ownerActiveTab === 'financial' ? 'active' : ''}`} type="button" role="tab" aria-selected={ownerActiveTab === 'financial'} onClick={() => setOwnerActiveTab('financial')}>Financial</button>
            <button className={`tenant-tab ${ownerActiveTab === 'documents' ? 'active' : ''}`} type="button" role="tab" aria-selected={ownerActiveTab === 'documents'} onClick={() => setOwnerActiveTab('documents')}>Documents</button>
            <button className={`tenant-tab ${ownerActiveTab === 'mailbox' ? 'active' : ''}`} type="button" role="tab" aria-selected={ownerActiveTab === 'mailbox'} onClick={() => setOwnerActiveTab('mailbox')}>Mailbox</button>
            <button className={`tenant-tab ${ownerActiveTab === 'ledger' ? 'active' : ''}`} type="button" role="tab" aria-selected={ownerActiveTab === 'ledger'} onClick={() => setOwnerActiveTab('ledger')}>Ledger</button>
            <button className={`tenant-tab ${ownerActiveTab === 'management' ? 'active' : ''}`} type="button" role="tab" aria-selected={ownerActiveTab === 'management'} onClick={() => setOwnerActiveTab('management')}>Management Fee</button>
          </div>

          {ownerActiveTab === 'personal' && (
            <div className="tenant-tab-panel">
              <div className="property-card-body">
                <div className="property-media">
                  {property.imageUrl ? <img src={property.imageUrl} alt={property.address} /> : <div className="property-image-placeholder">{property.type}</div>}
                </div>
                <div className="property-info">
                  <div className="property-meta-grid">
                    <div>
                      <span className="meta-label">Address</span>
                      <p>{property.address}</p>
                    </div>
                    <div>
                      <span className="meta-label">SSN / ITIN / EIN</span>
                      <p>{property.ownerTaxId || '—'}</p>
                    </div>
                    <div>
                      <span className="meta-label">Type</span>
                      <p>{property.type}</p>
                    </div>
                    <div>
                      <span className="meta-label">Beds</span>
                      <p>{property.beds}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {ownerActiveTab === 'financial' && (
            <div className="tenant-tab-panel">
              <div className="property-card-body">
                <div className="property-media">
                  {property.imageUrl ? <img src={property.imageUrl} alt={property.address} /> : <div className="property-image-placeholder">{property.type}</div>}
                </div>
                <div className="property-info">
                  <div className="property-meta-grid">
                    <div>
                      <span className="meta-label">Price</span>
                      <p>${property.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="meta-label">Rent</span>
                      <p>${property.rent.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="meta-label">Purchase date</span>
                      <p>{property.purchaseDate || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="meta-label">Appraised value</span>
                      <p>${property.currentValue ? property.currentValue.toLocaleString() : '—'}</p>
                    </div>
                    <div>
                      <span className="meta-label">Zillow estimate</span>
                      <p>${property.zillowEstimate.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="meta-label">Management Fee</span>
                      <p>{contractFeeLabel} of rent collected</p>
                    </div>
                    <div>
                      <span className="meta-label">Cash ROI</span>
                      <p>{property.purchasePrice ? `${(((property.rent || 0) * 12) / property.purchasePrice * 100).toFixed(1)}%` : '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {ownerActiveTab === 'documents' && (
            <div className="tenant-tab-panel">
              {ownerDocuments.length ? (
                <ul className="tenant-documents-list">
                  {ownerDocuments.map((doc, idx) => (
                    <li key={idx}>{doc}</li>
                  ))}
                </ul>
              ) : (
                <p className="muted-text">No documents on file.</p>
              )}
            </div>
          )}

          {ownerActiveTab === 'mailbox' && (
            <div className="tenant-tab-panel mailbox-panel">
              <MailboxPanel messages={ownerMailbox} />
            </div>
          )}

          {ownerActiveTab === 'management' && (
            <div className="tenant-tab-panel owner-mgmt-panel">
              <div className="owner-contract-fee-banner">
                <span className="meta-label">Management Fee</span>
                <p><strong>{contractFeeLabel}</strong> of each rent deposit is transferred to the property manager.</p>
              </div>
              {managementFees.entries.length ? (
                <>
                  <div className="owner-ledger-summary">
                    <span className="owner-ledger-summary-label">PM revenue from this owner</span>
                    <span className="owner-ledger-summary-value">
                      ${managementFees.paidRevenue.toLocaleString()} collected
                      {managementFees.pendingRevenue > 0 ? ` · $${managementFees.pendingRevenue.toLocaleString()} pending` : ''}
                    </span>
                  </div>
                  <div className="owner-ledger-table">
                    <div className="owner-ledger-header">
                      <span>Date</span>
                      <span>Operation</span>
                      <span>Comment</span>
                      <span aria-hidden="true" />
                      <span>Sum</span>
                      <span>Status</span>
                    </div>
                    <div className="owner-ledger-group">
                      {managementFees.entries.map((payment) => (
                        <div key={payment.id} className="owner-ledger-row">
                          <span className="owner-ledger-col owner-ledger-date">{formatLedgerDate(payment.paidDate || payment.dueDate)}</span>
                          <span className="owner-ledger-col owner-ledger-code">{getLedgerOperationCode(payment)}</span>
                          <span className="owner-ledger-col owner-ledger-comment">{payment.description || 'Management Fee'}</span>
                          <LedgerRowActions
                            payment={payment}
                            onOpenInvoice={setInvoicePayment}
                            onOpenDocuments={setDocumentsPayment}
                          />
                          <span className="owner-ledger-col owner-ledger-sum credit">{formatManagementFeeSum(payment)}</span>
                          <span className="owner-ledger-col owner-ledger-status">{payment.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <p className="muted-text">No Management Fee entries recorded for this property yet.</p>
              )}
            </div>
          )}

          {ownerActiveTab === 'ledger' && (
            <div className="tenant-tab-panel owner-ledger-panel">
              {ownerPayments.length || ledger.openingBalance ? (
                <>
                  <div className="owner-ledger-summary">
                    <span className="owner-ledger-summary-label">Current balance</span>
                    <span className="owner-ledger-summary-value">${ledger.currentBalance.toLocaleString()}</span>
                  </div>
                  <div className="owner-ledger-table">
                    <div className="owner-ledger-header">
                      <span>Date</span>
                      <span>Operation</span>
                      <span>Comment</span>
                      <span aria-hidden="true" />
                      <span>Sum</span>
                      <span>Balance</span>
                    </div>
                    <div className="owner-ledger-group">
                      {ledger.entries.map(({ payment, delta, balance }) => (
                        <div key={payment.id} className="owner-ledger-row">
                          <span className="owner-ledger-col owner-ledger-date">{formatLedgerDate(payment.paidDate || payment.dueDate)}</span>
                          <span className="owner-ledger-col owner-ledger-code">{getLedgerOperationCode(payment)}</span>
                          <span className="owner-ledger-col owner-ledger-comment">{payment.description || '—'}</span>
                          <LedgerRowActions
                            payment={payment}
                            onOpenInvoice={setInvoicePayment}
                            onOpenDocuments={setDocumentsPayment}
                          />
                          <span className={`owner-ledger-col owner-ledger-sum ${getLedgerSumDirection(payment)}`}>{formatLedgerSum(payment)}</span>
                          <span className="owner-ledger-col owner-ledger-balance">${balance.toLocaleString()}</span>
                        </div>
                      ))}
                      {ledger.openingBalance > 0 ? (
                        <div className="owner-ledger-row owner-ledger-opening">
                          <span className="owner-ledger-col owner-ledger-date">—</span>
                          <span className="owner-ledger-col owner-ledger-code">Owner reserve deposit</span>
                          <span className="owner-ledger-col owner-ledger-comment">Initial owner fund</span>
                          <span className="owner-ledger-actions owner-ledger-actions-empty" aria-hidden="true" />
                          <span className="owner-ledger-col owner-ledger-sum credit">+${ledger.openingBalance.toLocaleString()}</span>
                          <span className="owner-ledger-col owner-ledger-balance">${ledger.openingBalance.toLocaleString()}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </>
              ) : (
                <p className="muted-text">No transactions recorded for this property yet.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <LedgerInvoiceModal payment={invoicePayment} property={property} onClose={() => setInvoicePayment(null)} />
      <LedgerDocumentsModal payment={documentsPayment} onClose={() => setDocumentsPayment(null)} />
    </>
  )
}
