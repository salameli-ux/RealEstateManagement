const RELATED_DOCS_BY_TYPE = {
  Rent: ['Rent receipt', 'Payment confirmation', 'Lease rent schedule'],
  Deposit: ['Deposit receipt', 'Move-in checklist', 'Signed lease excerpt'],
  HOA: ['HOA assessment notice', 'Quarterly statement'],
  Insurance: ['Insurance policy certificate', 'Premium invoice'],
  Tax: ['Property tax bill', 'County assessment notice'],
  Management: ['Management agreement', 'Monthly fee statement'],
  Monthly: ['Monthly service statement', 'Account administration summary'],
  Convenience: ['Payment processing receipt', 'ACH fee disclosure'],
  'Work Order': ['Work order summary', 'Coordination fee invoice', 'Vendor job ticket'],
  Leasing: ['Leasing agreement excerpt', 'Tenant placement invoice'],
  Inspection: ['Inspection checklist', 'Move-in report photos'],
  Maintenance: ['Work order', 'Vendor invoice', 'Service completion report'],
  Refund: ['Credit memo', 'Adjustment notice'],
}

export function getInvoiceUrl(payment) {
  if (!payment?.invoiceNumber) return null
  return `https://example.com/invoices/${encodeURIComponent(payment.invoiceNumber)}.pdf`
}

export function getRelatedDocuments(payment) {
  const labels = RELATED_DOCS_BY_TYPE[payment.type] || ['Supporting document']
  const code = payment.invoiceNumber || `payment-${payment.id}`

  return labels.map((label, index) => ({
    label,
    url: `https://example.com/documents/${encodeURIComponent(code)}-${index + 1}.pdf`,
  }))
}
