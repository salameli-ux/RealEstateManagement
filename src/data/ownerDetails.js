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
    documents: [
      'Condo deed — Unit 12B, 18 Ocean Drive',
      'Sunrise Holdings LLC operating agreement',
      'Title insurance policy (2020)',
      'HOA bylaws & 2025 budget',
      'Windstorm insurance certificate',
      'Flood elevation certificate',
      'Miami-Dade property tax bill 2024',
      'Annual building inspection report',
      'Parking space assignment — P2-48',
      'Vendor W-9 — Coastal Maintenance Co.',
    ],
    mailbox: [
      { subject: 'June owner statement ready', from: 'Property Management', date: 'Jun 2, 2025', preview: 'May net income for 18 Ocean Drive: $2,280 collected, $1,585 expenses.', unread: true },
      { subject: 'Rent received — Kelly Rivera', from: 'Collections', date: 'May 15, 2025', preview: 'May rent of $2,850 posted to your owner ledger.', unread: true },
      { subject: 'June rent invoice issued', from: 'Billing', date: 'Jun 1, 2025', preview: 'Kelly Rivera June rent invoice generated. Due Jun 1.', unread: false },
      { subject: 'HOA assessment paid', from: 'Accounting', date: 'Apr 16, 2025', preview: 'Q2 HOA of $485 paid on your behalf for Unit 12B.', unread: false },
      { subject: 'Insurance renewal quote', from: 'Insurance Desk', date: 'May 12, 2025', preview: 'Please review the updated windstorm policy quote for Ocean Drive.', unread: false },
      { subject: 'New tenant lease signed', from: 'Leasing', date: 'Apr 10, 2025', preview: 'Kelly Rivera lease for Unit 12B is fully executed.', unread: false },
      { subject: 'Maintenance completed', from: 'Maintenance', date: 'May 6, 2025', preview: 'HVAC service at 18 Ocean Drive completed. Invoice attached.', unread: false },
      { subject: 'Q1 performance snapshot', from: 'Property Management', date: 'Apr 1, 2025', preview: 'Your Q1 cash flow report for the Miami portfolio is ready.', unread: false },
      { subject: 'Tax payment confirmation', from: 'Accounting', date: 'Mar 5, 2025', preview: '2024 property tax of $3,180 paid for 18 Ocean Drive.', unread: false },
      { subject: 'Listing removed — unit leased', from: 'Leasing', date: 'Mar 16, 2025', preview: 'Miami Condo is now off-market. Kelly Rivera move-in scheduled.', unread: false },
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
