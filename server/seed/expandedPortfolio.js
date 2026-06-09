const PROPERTY_IMAGES = [
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1494527494455-0f29a669841a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560184897-a045d7ebb20d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80',
]

const EXPANDED_PROPERTIES = [
  { title: 'Magnolia Street Duplex', address: '412 Magnolia St, Austin, TX', ownerName: 'James Whitfield', ownerTaxId: '411-22-9034', type: 'Duplex', rent: 2400, beds: 3, baths: 2, price: 485000, yield: 5.9 },
  { title: 'Harbor View Condo', address: '88 Seaport Blvd Unit 5, Boston, MA', ownerName: 'Harbor View LLC', ownerTaxId: '84-3928175', type: 'Condo', rent: 3100, beds: 2, baths: 2, price: 620000, yield: 6.0 },
  { title: 'Desert Ridge Townhome', address: '1520 Desert Ridge Pkwy, Phoenix, AZ', ownerName: 'Elena Vasquez', ownerTaxId: '602-18-7741', type: 'Townhome', rent: 1950, beds: 3, baths: 2, price: 395000, yield: 5.8 },
  { title: 'Keystone Fourplex', address: '901 Keystone Ave, Denver, CO', ownerName: 'Keystone Real Estate Group', ownerTaxId: '88-1203948', type: 'Multi-family', rent: 4200, beds: 8, baths: 4, price: 890000, yield: 5.7 },
  { title: 'Ortiz Family Home', address: '334 Laurel Ave, San Jose, CA', ownerName: 'David & Nina Ortiz', ownerTaxId: '558-44-2109', type: 'Single Family', rent: 3800, beds: 4, baths: 3, price: 1120000, yield: 4.1 },
  { title: 'Lakeside Cottage', address: '77 Lakeview Dr, Minneapolis, MN', ownerName: 'Lakeside Holdings LLC', ownerTaxId: '41-8839201', type: 'Single Family', rent: 2200, beds: 3, baths: 2, price: 410000, yield: 6.4 },
  { title: 'Turner Park Apartment', address: '2100 Turner Park, Nashville, TN', ownerName: 'Michelle Turner', ownerTaxId: '409-77-6612', type: 'Condo', rent: 1750, beds: 2, baths: 1, price: 325000, yield: 6.5 },
  { title: 'Redwood Bungalow', address: '556 Redwood Ln, Portland, OR', ownerName: 'Redwood Capital Partners', ownerTaxId: '93-7721044', type: 'Single Family', rent: 2600, beds: 3, baths: 2, price: 520000, yield: 6.0 },
  { title: 'Ng Studio Loft', address: '1450 Market St Unit 804, San Francisco, CA', ownerName: 'Thomas Ng', ownerTaxId: '621-55-9088', type: 'Condo', rent: 3400, beds: 1, baths: 1, price: 780000, yield: 5.2 },
  { title: 'Bayshore Villa', address: '220 Bayshore Dr, Tampa, FL', ownerName: 'Bayshore Equity LLC', ownerTaxId: '82-4419023', type: 'Townhome', rent: 2850, beds: 3, baths: 2, price: 510000, yield: 6.7 },
  { title: 'Delgado Ranch Home', address: '8900 Ranch Rd, Dallas, TX', ownerName: 'Carmen Delgado', ownerTaxId: '633-29-4410', type: 'Single Family', rent: 2950, beds: 4, baths: 3, price: 560000, yield: 6.3 },
  { title: 'Northgate Loft', address: '18 Northgate Sq, Seattle, WA', ownerName: 'Northgate Properties Inc', ownerTaxId: '91-5538201', type: 'Condo', rent: 2700, beds: 2, baths: 2, price: 595000, yield: 5.4 },
  { title: 'Williams Bungalow', address: '144 Oak Hill Rd, Charlotte, NC', ownerName: 'Andre Williams', ownerTaxId: '242-81-3309', type: 'Single Family', rent: 2100, beds: 3, baths: 2, price: 380000, yield: 6.6 },
  { title: 'Silverline Duplex', address: '670 Silverline Ave, Columbus, OH', ownerName: 'Silverline Trust', ownerTaxId: '34-9928104', type: 'Duplex', rent: 2300, beds: 4, baths: 2, price: 365000, yield: 7.1 },
  { title: 'Kim Urban Flat', address: '920 W Belmont Ave, Chicago, IL', ownerName: 'Hannah Kim', ownerTaxId: '318-64-7720', type: 'Condo', rent: 2550, beds: 2, baths: 1, price: 440000, yield: 6.9 },
  { title: 'West End Brownstone', address: '215 West End Ave, New York, NY', ownerName: 'West End Realty LLC', ownerTaxId: '13-8849203', type: 'Townhome', rent: 5200, beds: 3, baths: 2, price: 1450000, yield: 4.3 },
  { title: 'Mendoza Adobe', address: '108 Camino Real, Santa Fe, NM', ownerName: 'Rafael Mendoza', ownerTaxId: '525-90-1188', type: 'Single Family', rent: 2400, beds: 3, baths: 2, price: 490000, yield: 5.9 },
  { title: 'Crown Plaza Unit', address: '501 Crown Plaza, Philadelphia, PA', ownerName: 'Crown Asset Management', ownerTaxId: '23-7719022', type: 'Condo', rent: 1900, beds: 2, baths: 1, price: 310000, yield: 7.4 },
  { title: 'Lambert Lake House', address: '44 Lake Shore Dr, Madison, WI', ownerName: 'Sophie Lambert', ownerTaxId: '391-22-8841', type: 'Single Family', rent: 2250, beds: 4, baths: 2, price: 425000, yield: 6.4 },
  { title: 'Union Park Flat', address: '780 Union Park St, Detroit, MI', ownerName: 'Union Park Investors', ownerTaxId: '38-9920114', type: 'Condo', rent: 1450, beds: 2, baths: 1, price: 185000, yield: 9.4 },
]

const EXPANDED_TENANTS = [
  { name: 'Avery Collins', email: 'avery.collins@example.com', phone: '(512) 555-0101', taxId: '512-01-4401', status: 'Paid', propertyIndex: 0 },
  { name: 'Jordan Blake', email: 'jordan.blake@example.com', phone: '(617) 555-0102', taxId: '617-02-4402', status: 'Due', propertyIndex: 1 },
  { name: 'Priya Sharma', email: 'priya.sharma@example.com', phone: '(480) 555-0103', taxId: '480-03-4403', status: 'Paid', propertyIndex: 2 },
  { name: 'Ethan Moore', email: 'ethan.moore@example.com', phone: '(303) 555-0104', taxId: '303-04-4404', status: 'Paid', propertyIndex: 3 },
  { name: 'Sofia Alvarez', email: 'sofia.alvarez@example.com', phone: '(408) 555-0105', taxId: '408-05-4405', status: 'Overdue', propertyIndex: 4 },
  { name: 'Noah Peterson', email: 'noah.peterson@example.com', phone: '(612) 555-0106', taxId: '612-06-4406', status: 'Paid', propertyIndex: 5 },
  { name: 'Chloe Nguyen', email: 'chloe.nguyen@example.com', phone: '(615) 555-0107', taxId: '615-07-4407', status: 'Due', propertyIndex: 6 },
  { name: 'Liam Foster', email: 'liam.foster@example.com', phone: '(503) 555-0108', taxId: '503-08-4408', status: 'Paid', propertyIndex: 7 },
  { name: 'Maya Johnson', email: 'maya.johnson@example.com', phone: '(415) 555-0109', taxId: '415-09-4409', status: 'Paid', propertyIndex: 8 },
  { name: 'Owen Carter', email: 'owen.carter@example.com', phone: '(813) 555-0110', taxId: '813-10-4410', status: 'Paid', propertyIndex: 9 },
  { name: 'Isabella Romero', email: 'isabella.romero@example.com', phone: '(214) 555-0111', taxId: '214-11-4411', status: 'Due', propertyIndex: 10 },
  { name: 'Henry Walsh', email: 'henry.walsh@example.com', phone: '(206) 555-0112', taxId: '206-12-4412', status: 'Paid', propertyIndex: 11 },
  { name: 'Natalie Reed', email: 'natalie.reed@example.com', phone: '(704) 555-0113', taxId: '704-13-4413', status: 'Paid', propertyIndex: 12 },
  { name: 'Victor Hayes', email: 'victor.hayes@example.com', phone: '(614) 555-0114', taxId: '614-14-4414', status: 'Due', propertyIndex: 13 },
  { name: 'Amanda Locke', email: 'amanda.locke@example.com', phone: '(312) 555-0115', taxId: '312-15-4415', status: 'Paid', propertyIndex: 14 },
  { name: 'Benjamin Tate', email: 'benjamin.tate@example.com', phone: '(212) 555-0116', taxId: '212-16-4416', status: 'Paid', propertyIndex: 15 },
]

const OCCUPIED_PROPERTY_INDICES = new Set(EXPANDED_TENANTS.map((tenant) => tenant.propertyIndex))

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function buildOwnerMailbox(ownerName, propertyTitle) {
  return [
    {
      subject: `May owner statement — ${propertyTitle}`,
      from: 'Property Management',
      date: 'Jun 1, 2025',
      preview: `May collections and expenses summary for ${propertyTitle}.`,
      unread: true,
    },
    {
      subject: 'Maintenance update',
      from: 'Maintenance',
      date: 'May 12, 2025',
      preview: `Routine service completed at ${propertyTitle}.`,
      unread: false,
    },
    {
      subject: 'Tax document ready',
      from: 'Accounting',
      date: 'Apr 28, 2025',
      preview: `${ownerName} annual property summary is available.`,
      unread: false,
    },
  ]
}

function buildOwnerDocuments(propertyTitle) {
  return [
    `${propertyTitle} deed`,
    'Title insurance policy',
    'Property tax bill 2024',
    'Insurance certificate',
  ]
}

function buildTenantPayload(property, tenantSeed, propertyId) {
  const rentLabel = `$${property.rent.toLocaleString()}`
  const slug = slugify(tenantSeed.name)
  return {
    propertyId,
    isCurrent: 1,
    name: tenantSeed.name,
    unit: property.address,
    email: tenantSeed.email,
    phone: tenantSeed.phone,
    taxId: tenantSeed.taxId,
    leaseStart: 'Feb 1, 2025',
    leaseEnd: 'Jan 31, 2026',
    rent: rentLabel,
    status: tenantSeed.status,
    nextDue: tenantSeed.status === 'Paid' ? 'Jul 1, 2025' : 'Jun 1, 2025',
    contract: '12 month lease',
    contractUrl: `https://example.com/contracts/${slug}.pdf`,
    cycle: 'Monthly',
    documents: [
      'Signed lease agreement',
      'Government ID copy',
      `Security deposit receipt (${rentLabel})`,
      'Renter insurance certificate',
      'Move-in inspection checklist',
    ],
    activity: [
      'Jun 1, 2025 — June rent invoice generated',
      'May 15, 2025 — May rent received',
      'May 2, 2025 — Maintenance request logged',
      'Apr 10, 2025 — Lease countersigned',
      'Feb 1, 2025 — Move-in completed',
    ],
    mailbox: [
      {
        subject: `Rent ${tenantSeed.status === 'Paid' ? 'receipt' : 'due'} — ${property.title}`,
        from: tenantSeed.status === 'Paid' ? 'Property Management' : 'Billing',
        date: 'Jun 1, 2025',
        preview: `${rentLabel} for ${property.title}.`,
        unread: tenantSeed.status !== 'Paid',
      },
      {
        subject: 'Welcome packet',
        from: 'Leasing',
        date: 'Feb 1, 2025',
        preview: `Move-in details for ${property.title}.`,
        unread: false,
      },
    ],
    bankName: 'Chase Bank',
    bankAccountType: 'Checking',
    bankRoutingNumber: '021000021',
    bankAccountNumber: String(8800000000 + propertyId).slice(0, 10),
    bankAccountHolder: tenantSeed.name,
    cardBrand: 'Visa',
    cardLast4: String(1000 + propertyId).slice(-4),
    cardExpMonth: '08',
    cardExpYear: '2028',
  }
}

function buildTenantPayments(tenantId, propertyId, property, tenantSeed) {
  const invoiceBase = `INV-EXP-${propertyId}-${tenantId}`
  const rows = [
    [`${invoiceBase}-DEP`, tenantId, propertyId, property.rent * 2, 'USD', 'Deposit', 'Paid', '2025-02-01', '2025-02-01', `Security deposit — ${tenantSeed.name}`],
    [`${invoiceBase}-05`, tenantId, propertyId, property.rent, 'USD', 'Rent', 'Paid', '2025-05-01', '2025-05-03', `May rent — ${property.title}`],
    [`${invoiceBase}-06`, tenantId, propertyId, property.rent, 'USD', 'Rent', tenantSeed.status === 'Paid' ? 'Paid' : tenantSeed.status, '2025-06-01', tenantSeed.status === 'Paid' ? '2025-06-01' : null, `June rent — ${property.title}`],
  ]
  if (tenantSeed.status === 'Overdue') {
    rows.push([`${invoiceBase}-04`, tenantId, propertyId, property.rent, 'USD', 'Rent', 'Overdue', '2025-04-01', null, `April rent — ${property.title}`])
  }
  rows.push([`${invoiceBase}-HOA`, null, propertyId, 250, 'USD', 'HOA', 'Paid', '2025-04-15', '2025-04-16', `HOA — ${property.title}`])
  rows.push([`${invoiceBase}-MGMT`, null, propertyId, Math.round(property.rent * 0.1), 'USD', 'Management', 'Paid', '2025-05-31', '2025-05-31', `May PM fee — ${property.title}`])
  return rows
}

export function seedExpandedPortfolio(db) {
  const marker = db.prepare('SELECT id FROM properties WHERE title = ?').get('Magnolia Street Duplex')
  if (marker) return

  const insertProperty = db.prepare(`
    INSERT INTO properties (
      title, address, imageUrl, type, price, purchasePrice, purchaseDate, currentValue, zillowEstimate,
      yield, status, rent, beds, baths, ownerName, ownerTaxId, openingBalance, ownerDocuments, ownerMailbox
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertTenant = db.prepare(`
    INSERT INTO tenants (
      propertyId, isCurrent, name, unit, email, phone, taxId, leaseStart, leaseEnd, rent, status, nextDue,
      contract, contractUrl, cycle, documents, activity, mailbox,
      bankName, bankAccountType, bankRoutingNumber, bankAccountNumber, bankAccountHolder,
      cardBrand, cardLast4, cardExpMonth, cardExpYear
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertPayment = db.prepare(`
    INSERT INTO payments (invoiceNumber, tenantId, propertyId, amount, currency, type, status, dueDate, paidDate, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const paymentExists = db.prepare('SELECT id FROM payments WHERE invoiceNumber = ?')
  const propertyIds = []

  EXPANDED_PROPERTIES.forEach((property, index) => {
    const purchasePrice = Math.round(property.price * 0.92)
    const currentValue = Math.round(property.price * 1.05)
    const zillowEstimate = Math.round(property.price * 1.03)
    const occupied = OCCUPIED_PROPERTY_INDICES.has(index)
    const info = insertProperty.run(
      property.title,
      property.address,
      PROPERTY_IMAGES[index % PROPERTY_IMAGES.length],
      property.type,
      property.price,
      purchasePrice,
      '2019-06-15',
      currentValue,
      zillowEstimate,
      property.yield,
      occupied ? 'Leased' : 'Available',
      property.rent,
      property.beds,
      property.baths,
      property.ownerName,
      property.ownerTaxId,
      Math.round(property.rent * 4),
      JSON.stringify(buildOwnerDocuments(property.title)),
      JSON.stringify(buildOwnerMailbox(property.ownerName, property.title))
    )
    propertyIds.push(Number(info.lastInsertRowid))
  })

  EXPANDED_TENANTS.forEach((tenantSeed) => {
    const property = EXPANDED_PROPERTIES[tenantSeed.propertyIndex]
    const propertyId = propertyIds[tenantSeed.propertyIndex]
    const tenant = buildTenantPayload(property, tenantSeed, propertyId)
    const info = insertTenant.run(
      tenant.propertyId,
      tenant.isCurrent,
      tenant.name,
      tenant.unit,
      tenant.email,
      tenant.phone,
      tenant.taxId,
      tenant.leaseStart,
      tenant.leaseEnd,
      tenant.rent,
      tenant.status,
      tenant.nextDue,
      tenant.contract,
      tenant.contractUrl,
      tenant.cycle,
      JSON.stringify(tenant.documents),
      JSON.stringify(tenant.activity),
      JSON.stringify(tenant.mailbox),
      tenant.bankName,
      tenant.bankAccountType,
      tenant.bankRoutingNumber,
      tenant.bankAccountNumber,
      tenant.bankAccountHolder,
      tenant.cardBrand,
      tenant.cardLast4,
      tenant.cardExpMonth,
      tenant.cardExpYear
    )
    const tenantId = Number(info.lastInsertRowid)
    for (const payment of buildTenantPayments(tenantId, propertyId, property, tenantSeed)) {
      if (!paymentExists.get(payment[0])) {
        insertPayment.run(...payment)
      }
    }
  })
}
