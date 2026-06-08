import { getRelatedDocuments } from '../utils/ledgerDocuments'
import { getLedgerOperationCode } from '../utils/ledgerBalance'

export default function LedgerDocumentsModal({ payment, onClose }) {
  if (!payment) return null

  const documents = getRelatedDocuments(payment)

  return (
    <div className="ledger-modal-backdrop" onClick={onClose} role="presentation">
      <div className="ledger-modal ledger-modal-compact" onClick={(event) => event.stopPropagation()} role="dialog" aria-labelledby="ledger-docs-title">
        <div className="ledger-modal-header">
          <div>
            <p className="ledger-modal-eyebrow">Related documents</p>
            <h3 id="ledger-docs-title">{getLedgerOperationCode(payment)}</h3>
          </div>
          <button type="button" className="ledger-modal-close" onClick={onClose} aria-label="Close documents">
            ×
          </button>
        </div>

        <ul className="ledger-documents-list">
          {documents.map((document) => (
            <li key={document.url}>
              <a href={document.url} target="_blank" rel="noreferrer">
                <span>{document.label}</span>
                <span className="ledger-documents-open">Open</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
