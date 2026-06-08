export const ownerDetailsMap = {
  'Atlanta Duplex': {
    documents: ['Property deed', 'Title insurance', 'HOA agreement', 'Annual tax return'],
    mailbox: [
      { subject: 'May owner statement', from: 'Property Management', date: 'Jun 1, 2025', preview: 'Your May rent collection and expense summary is attached.', unread: true },
      { subject: 'Lease renewal notice', from: 'Property Management', date: 'May 18, 2025', preview: 'John Smith lease is up for renewal in January 2026.', unread: false },
      { subject: 'Tax document ready', from: 'Accounting', date: 'Apr 30, 2025', preview: 'Your 1099 summary for Atlanta Duplex is available.', unread: false },
    ],
  },
  'Miami Condo': {
    documents: ['Condo deed', 'Insurance certificate', 'LLC operating agreement'],
    mailbox: [
      { subject: 'Vacancy update', from: 'Property Management', date: 'May 29, 2025', preview: 'Miami Condo remains listed. Two showings scheduled this week.', unread: true },
      { subject: 'Insurance renewal', from: 'Insurance Desk', date: 'May 12, 2025', preview: 'Please review the updated condo insurance quote.', unread: false },
    ],
  },
  'Chicago Townhome': {
    documents: ['Townhome deed', 'Property survey', 'Mortgage statement'],
    mailbox: [
      { subject: 'Overdue rent alert', from: 'Collections', date: 'May 16, 2025', preview: 'Marcus Lee rent payment is overdue for Chicago Townhome.', unread: true },
      { subject: 'Maintenance completed', from: 'Maintenance', date: 'May 5, 2025', preview: 'HVAC service at Chicago Townhome has been completed.', unread: false },
      { subject: 'Q1 performance report', from: 'Property Management', date: 'Apr 8, 2025', preview: 'Your quarterly cash flow report is ready to review.', unread: false },
    ],
  },
}
