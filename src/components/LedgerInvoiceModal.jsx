import { formatLedgerDate, formatLedgerSum, getLedgerOperationCode, getLedgerSumDirection } from '../utils/ledgerBalance'
import { getInvoiceUrl } from '../utils/ledgerDocuments'

export default function LedgerInvoiceModal({ payment, property, onClose }) {
  if (!payment) return null

  const invoiceUrl = getInvoiceUrl(payment)

  return (
    <div className="ledger-modal-backdrop" onClick={onClose} role="presentation">
      <div className="ledger-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-labelledby="ledger-invoice-title">
        <div className="ledger-modal-header">
          <div>
            <p className="ledger-modal-eyebrow">Invoice</p>
            <h3 id="ledger-invoice-title">{payment.invoiceNumber || `INV-${payment.id}`}</h3>
          </div>
          <button type="button" className="ledger-modal-close" onClick={onClose} aria-label="Close invoice">
            ×
          </button>
        </div>

        <div className="ledger-invoice-grid">
          <div>
            <span className="meta-label">Property</span>
            <p>{property?.address || '—'}</p>
          </div>
          <div>
            <span className="meta-label">Owner</span>
            <p>{property?.ownerName || '—'}</p>
          </div>
          <div>
            <span className="meta-label">Operation</span>
            <p>{getLedgerOperationCode(payment)}</p>
          </div>
          <div>
            <span className="meta-label">Status</span>
            <p>{payment.status}</p>
          </div>
          <div>
            <span className="meta-label">Due date</span>
            <p>{formatLedgerDate(payment.dueDate)}</p>
          </div>
          <div>
            <span className="meta-label">Paid date</span>
            <p>{formatLedgerDate(payment.paidDate)}</p>
          </div>
          <div className="ledger-invoice-wide">
            <span className="meta-label">Description</span>
            <p>{payment.description || '—'}</p>
          </div>
          <div>
            <span className="meta-label">Amount</span>
            <p className={`owner-ledger-sum ${getLedgerSumDirection(payment)}`}>{formatLedgerSum(payment)}</p>
          </div>
        </div>

        {invoiceUrl ? (
          <a className="link-button ledger-modal-action" href={invoiceUrl} target="_blank" rel="noreferrer">
            Open invoice PDF
          </a>
        ) : null}
      </div>
    </div>
  )
}
