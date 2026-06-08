function InvoiceIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 3h8l4 4v14H8V3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M16 3v4h4M9 12h6M9 16h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function DocumentsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7a2 2 0 0 1 2-2h5l2 2h7v12H4V7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M11 5v3h3" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

export default function LedgerRowActions({ payment, onOpenInvoice, onOpenDocuments }) {
  if (!payment?.invoiceNumber) {
    return <span className="owner-ledger-actions owner-ledger-actions-empty" aria-hidden="true" />
  }

  return (
    <span className="owner-ledger-actions">
      <button
        type="button"
        className="ledger-action-btn"
        title="View invoice"
        aria-label={`View invoice ${payment.invoiceNumber}`}
        onClick={() => onOpenInvoice(payment)}
      >
        <InvoiceIcon />
      </button>
      <button
        type="button"
        className="ledger-action-btn"
        title="Related documents"
        aria-label={`Related documents for ${payment.invoiceNumber}`}
        onClick={() => onOpenDocuments(payment)}
      >
        <DocumentsIcon />
      </button>
    </span>
  )
}
