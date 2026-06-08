import Database from 'better-sqlite3'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import bcrypt from 'bcrypt'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dataDir = resolve(__dirname, 'data')
const dbPath = resolve(dataDir, 'saas.db')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const db = new Database(dbPath)

db.pragma('journal_mode = WAL')

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  role TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS properties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  address TEXT,
  imageUrl TEXT,
  type TEXT,
  price INTEGER,
  purchasePrice INTEGER,
  purchaseDate TEXT,
  currentValue INTEGER,
  zillowEstimate INTEGER,
  yield REAL,
  status TEXT,
  rent INTEGER,
  beds INTEGER,
  baths INTEGER,
  ownerName TEXT,
  ownerTaxId TEXT,
  openingBalance INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tenants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  propertyId INTEGER,
  isCurrent INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  unit TEXT,
  email TEXT,
  phone TEXT,
  taxId TEXT,
  leaseStart TEXT,
  leaseEnd TEXT,
  rent TEXT,
  status TEXT,
  nextDue TEXT,
  contract TEXT,
  contractUrl TEXT,
  cycle TEXT,
  documents TEXT,
  activity TEXT,
  mailbox TEXT
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoiceNumber TEXT,
  tenantId INTEGER,
  propertyId INTEGER,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  dueDate TEXT,
  paidDate TEXT,
  description TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
`)

const paymentColumns = db.prepare("PRAGMA table_info(payments)").all().map((row) => row.name)
if (!paymentColumns.includes('invoiceNumber')) {
  db.prepare('ALTER TABLE payments ADD COLUMN invoiceNumber TEXT').run()
}

const propertyColumns = db.prepare('PRAGMA table_info(properties)').all().map((row) => row.name)
if (!propertyColumns.includes('ownerName')) {
  db.prepare('ALTER TABLE properties ADD COLUMN ownerName TEXT').run()
}
if (!propertyColumns.includes('ownerTaxId')) {
  db.prepare('ALTER TABLE properties ADD COLUMN ownerTaxId TEXT').run()
}
if (!propertyColumns.includes('openingBalance')) {
  db.prepare('ALTER TABLE properties ADD COLUMN openingBalance INTEGER NOT NULL DEFAULT 0').run()
}

const seedOpeningBalanceByTitle = {
  'Atlanta Duplex': 12000,
  'Miami Condo': 25000,
  'Chicago Townhome': 15000,
}
for (const [title, balance] of Object.entries(seedOpeningBalanceByTitle)) {
  db.prepare('UPDATE properties SET openingBalance = ? WHERE title = ? AND (openingBalance IS NULL OR openingBalance = 0)').run(balance, title)
}

const tenantColumns = db.prepare('PRAGMA table_info(tenants)').all().map((row) => row.name)
if (!tenantColumns.includes('taxId')) {
  db.prepare('ALTER TABLE tenants ADD COLUMN taxId TEXT').run()
}
if (!tenantColumns.includes('propertyId')) {
  db.prepare('ALTER TABLE tenants ADD COLUMN propertyId INTEGER').run()
}
if (!tenantColumns.includes('isCurrent')) {
  db.prepare('ALTER TABLE tenants ADD COLUMN isCurrent INTEGER NOT NULL DEFAULT 0').run()
}
if (!tenantColumns.includes('contractUrl')) {
  db.prepare('ALTER TABLE tenants ADD COLUMN contractUrl TEXT').run()
}
if (!tenantColumns.includes('mailbox')) {
  db.prepare('ALTER TABLE tenants ADD COLUMN mailbox TEXT').run()
}

const seedTenantTaxIdsByName = {
  'John Smith': '456-78-9012',
  'Kelly Rivera': '789-01-2345',
  'Marcus Lee': '321-54-6789',
}

const tenantsMissingTaxId = db.prepare("SELECT id, name FROM tenants WHERE taxId IS NULL OR taxId = ''").all()
for (const tenant of tenantsMissingTaxId) {
  const taxId = seedTenantTaxIdsByName[tenant.name] || '000-00-0000'
  db.prepare('UPDATE tenants SET taxId = ? WHERE id = ?').run(taxId, tenant.id)
}

const seedOwnersByTitle = {
  'Atlanta Duplex': { ownerName: 'Robert Chen', ownerTaxId: '123-45-6789' },
  'Miami Condo': { ownerName: 'Sunrise Holdings LLC', ownerTaxId: '87-6543210' },
  'Chicago Townhome': { ownerName: 'Patricia Williams', ownerTaxId: '912-34-5678' },
}

const propertiesMissingOwner = db.prepare("SELECT id, title FROM properties WHERE ownerName IS NULL OR ownerName = ''").all()
for (const property of propertiesMissingOwner) {
  const owner = seedOwnersByTitle[property.title] || { ownerName: 'Demo Owner', ownerTaxId: '000-00-0000' }
  db.prepare('UPDATE properties SET ownerName = ?, ownerTaxId = ? WHERE id = ?').run(owner.ownerName, owner.ownerTaxId, property.id)
}

const propertyCount = db.prepare('SELECT COUNT(*) as count FROM properties').get().count
if (propertyCount === 0) {
  const stmt = db.prepare(`INSERT INTO properties (title, address, imageUrl, type, price, purchasePrice, purchaseDate, currentValue, zillowEstimate, yield, status, rent, beds, baths, ownerName, ownerTaxId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  stmt.run('Atlanta Duplex', '245 Peachtree St, Atlanta, GA', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80', 'Duplex', 540000, 495000, '2018-03-22', 610000, 560000, 5.7, 'Leased', 3250, 4, 2, 'Robert Chen', '123-45-6789')
  stmt.run('Miami Condo', '18 Ocean Drive, Miami, FL', 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80', 'Condo', 420000, 385000, '2020-05-10', 455000, 430000, 6.0, 'Available', 2100, 2, 2, 'Sunrise Holdings LLC', '87-6543210')
  stmt.run('Chicago Townhome', '790 Lakeview Ave, Chicago, IL', 'https://images.unsplash.com/photo-1494527494455-0f29a669841a?auto=format&fit=crop&w=800&q=80', 'Townhome', 470000, 430000, '2019-09-15', 505000, 485000, 5.8, 'Renewal', 2880, 3, 2, 'Patricia Williams', '912-34-5678')
}

const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count
if (userCount === 0) {
  const passwordHash = bcrypt.hashSync('123456', 10)
  db.prepare('INSERT INTO users (name, email, passwordHash, role) VALUES (?, ?, ?, ?)').run('Administrator', 'admin@example.com', passwordHash, 'admin')
}

const tenantCount = db.prepare('SELECT COUNT(*) as count FROM tenants').get().count
if (tenantCount === 0) {
  const stmt = db.prepare(`INSERT INTO tenants (name, unit, email, phone, taxId, leaseStart, leaseEnd, rent, status, nextDue, contract, cycle, documents, activity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  stmt.run('John Smith', 'Atlanta Duplex', 'john.smith@example.com', '(404) 555-0178', '456-78-9012', 'Jan 5, 2025', 'Jan 4, 2026', '$3,250', 'Paid', 'Jun 1', '12 month lease', 'Monthly', JSON.stringify(['Lease agreement', 'ID copy', 'Move-in checklist']), JSON.stringify(['May 1 - Rent received', 'Apr 27 - Maintenance request completed', 'Apr 15 - Lease reminder sent']))
  stmt.run('Kelly Rivera', 'Miami Condo', 'kelly.rivera@example.com', '(305) 555-0231', '789-01-2345', 'Mar 15, 2025', 'Mar 14, 2026', '$2,100', 'Due', 'May 29', '12 month lease', 'Monthly', JSON.stringify(['Lease agreement', 'Security deposit receipt', 'Pet addendum']), JSON.stringify(['Apr 20 - Payment reminder sent', 'Apr 10 - Lease signed', 'Mar 18 - Welcome email sent']))
  stmt.run('Marcus Lee', 'Chicago Townhome', 'marcus.lee@example.com', '(312) 555-0450', '321-54-6789', 'Feb 1, 2025', 'Jan 31, 2026', '$2,880', 'Overdue', 'May 16', '11 month lease', 'Monthly', JSON.stringify(['Lease agreement', 'Insurance proof', 'Payment authorization']), JSON.stringify(['May 16 - Payment overdue', 'May 5 - Maintenance follow-up', 'Apr 22 - Rent partial payment']))
}

const paymentCount = db.prepare('SELECT COUNT(*) as count FROM payments').get().count
if (paymentCount === 0) {
  const stmt = db.prepare(`INSERT INTO payments (invoiceNumber, tenantId, propertyId, amount, currency, type, status, dueDate, paidDate, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  stmt.run('INV-1001', 1, 1, 3250, 'USD', 'Rent', 'Paid', '2025-06-01', '2025-06-01', 'June rent for Atlanta Duplex')
  stmt.run('INV-1002', 2, 2, 2100, 'USD', 'Rent', 'Due', '2025-06-01', null, 'June rent for Miami Condo')
  stmt.run('INV-1003', 3, 3, 2880, 'USD', 'Rent', 'Overdue', '2025-05-16', null, 'May overdue rent for Chicago Townhome')
}

const miamiProperty = db.prepare("SELECT id FROM properties WHERE address LIKE '%18 Ocean Drive%' OR title = 'Miami Condo'").get()
const miamiTenant = db.prepare("SELECT id FROM tenants WHERE name = 'Kelly Rivera'").get()

if (miamiProperty) {
  db.prepare(`UPDATE properties SET
    title = ?,
    address = ?,
    imageUrl = ?,
    type = ?,
    price = ?,
    purchasePrice = ?,
    purchaseDate = ?,
    currentValue = ?,
    zillowEstimate = ?,
    yield = ?,
    status = ?,
    rent = ?,
    beds = ?,
    baths = ?,
    ownerName = ?,
    ownerTaxId = ?,
    openingBalance = ?
    WHERE id = ?`).run(
    'Miami Condo',
    '18 Ocean Drive, Miami, FL',
    'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80',
    'Condo',
    445000,
    385000,
    '2020-05-10',
    472000,
    458000,
    6.4,
    'Leased',
    2850,
    2,
    2,
    'Sunrise Holdings LLC',
    '87-6543210',
    25000,
    miamiProperty.id
  )
}

const atlantaProperty = db.prepare("SELECT id FROM properties WHERE title = 'Atlanta Duplex'").get()
const chicagoProperty = db.prepare("SELECT id FROM properties WHERE title = 'Chicago Townhome'").get()
const johnSmith = db.prepare("SELECT id FROM tenants WHERE name = 'John Smith'").get()
const marcusLee = db.prepare("SELECT id FROM tenants WHERE name = 'Marcus Lee'").get()

if (atlantaProperty && johnSmith) {
  db.prepare('UPDATE tenants SET propertyId = ?, isCurrent = 1 WHERE id = ?').run(atlantaProperty.id, johnSmith.id)
}
if (chicagoProperty && marcusLee) {
  db.prepare('UPDATE tenants SET propertyId = ?, isCurrent = 1 WHERE id = ?').run(chicagoProperty.id, marcusLee.id)
}

if (miamiTenant) {
  db.prepare(`UPDATE tenants SET
    propertyId = ?,
    isCurrent = 1,
    unit = ?,
    email = ?,
    phone = ?,
    taxId = ?,
    leaseStart = ?,
    leaseEnd = ?,
    rent = ?,
    status = ?,
    nextDue = ?,
    contract = ?,
    contractUrl = ?,
    cycle = ?,
    documents = ?,
    activity = ?,
    mailbox = ?
    WHERE id = ?`).run(
    miamiProperty?.id || null,
    'Unit 12B — 18 Ocean Drive',
    'kelly.rivera@example.com',
    '(305) 555-0231',
    '789-01-2345',
    'Mar 15, 2025',
    'Mar 14, 2026',
    '$2,850',
    'Due',
    'Jun 1, 2025',
    '12 month lease',
    'https://example.com/contracts/miami-condo-unit-12b.pdf',
    'Monthly',
    JSON.stringify([
      'Signed lease agreement',
      'Government-issued ID copy',
      'Security deposit receipt ($5,700)',
      'Pet addendum — Coco (12 lb dog)',
      'Renter insurance certificate',
      'Move-in inspection checklist',
      'Parking permit — P2 slot 48',
      'ACH autopay authorization form',
    ]),
    JSON.stringify([
      'Jun 1, 2025 — June rent invoice generated',
      'May 29, 2025 — Payment reminder email sent',
      'May 15, 2025 — May rent received ($2,850)',
      'May 3, 2025 — Maintenance: AC filter replaced',
      'Apr 20, 2025 — HOA notice forwarded to tenant',
      'Apr 10, 2025 — Lease countersigned by all parties',
      'Apr 2, 2025 — Background & credit check cleared',
      'Mar 18, 2025 — Welcome packet delivered',
      'Mar 15, 2025 — Move-in day completed',
    ]),
    JSON.stringify([
      { subject: 'June rent due — $2,850', from: 'Billing', date: 'Jun 1, 2025', preview: 'Your June rent for Unit 12B is due today. Pay online or via ACH.', unread: true },
      { subject: 'Payment reminder', from: 'Billing', date: 'May 29, 2025', preview: 'Friendly reminder: June rent is due in 3 days.', unread: true },
      { subject: 'Rent receipt — May', from: 'Property Management', date: 'May 15, 2025', preview: 'Thank you. Your May rent of $2,850 was received.', unread: false },
      { subject: 'Welcome to 18 Ocean Drive', from: 'Property Management', date: 'Mar 18, 2025', preview: 'Welcome! Move-in instructions and parking details inside.', unread: false },
    ]),
    miamiTenant.id
  )
}

if (miamiProperty) {
  const pastTenantExists = db.prepare('SELECT id FROM tenants WHERE name = ? AND propertyId = ?')
  const insertPastTenant = db.prepare(`INSERT INTO tenants (
    propertyId, isCurrent, name, unit, email, phone, taxId, leaseStart, leaseEnd, rent, status, nextDue,
    contract, contractUrl, cycle, documents, activity, mailbox
  ) VALUES (?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)

  const miamiPastTenants = [
    {
      name: 'Marco Alvarez',
      unit: 'Unit 12B — 18 Ocean Drive',
      email: 'marco.alvarez@example.com',
      phone: '(305) 555-0142',
      taxId: '612-34-8901',
      leaseStart: '2022-06-01',
      leaseEnd: '2024-02-28',
      rent: '$2,650',
      status: 'Paid',
      nextDue: '',
      contract: '12 month lease',
      contractUrl: 'https://example.com/contracts/miami-marco-alvarez.pdf',
      cycle: 'Monthly',
      documents: [
        'Signed lease agreement',
        'Driver license copy',
        'Security deposit receipt ($5,300)',
        'Renter insurance certificate',
        'Move-out inspection report',
        'Final utility statement',
      ],
      activity: [
        'Feb 28, 2024 — Move-out completed',
        'Feb 15, 2024 — Lease non-renewal notice sent',
        'Feb 1, 2024 — Final rent received ($2,650)',
        'Jan 10, 2024 — HVAC maintenance completed',
        'Dec 1, 2023 — December rent received',
        'Jun 1, 2022 — Move-in completed',
      ],
      mailbox: [
        { subject: 'Lease ended — thank you', from: 'Property Management', date: 'Feb 28, 2024', preview: 'Your lease at 18 Ocean Drive has ended. Deposit review underway.', unread: false },
        { subject: 'Non-renewal confirmation', from: 'Leasing', date: 'Feb 15, 2024', preview: 'We received your notice to vacate at end of term.', unread: false },
        { subject: 'Rent receipt — February', from: 'Billing', date: 'Feb 1, 2024', preview: 'Final month rent of $2,650 received.', unread: false },
      ],
    },
    {
      name: 'Diana Brooks',
      unit: 'Unit 12B — 18 Ocean Drive',
      email: 'diana.brooks@example.com',
      phone: '(305) 555-0198',
      taxId: '543-21-0987',
      leaseStart: '2020-03-01',
      leaseEnd: '2022-05-31',
      rent: '$2,400',
      status: 'Paid',
      nextDue: '',
      contract: '12 month lease',
      contractUrl: 'https://example.com/contracts/miami-diana-brooks.pdf',
      cycle: 'Monthly',
      documents: [
        'Signed lease agreement',
        'Passport copy',
        'Security deposit receipt ($4,800)',
        'Pet addendum — Milo (cat)',
        'Move-in inspection checklist',
        'Lease termination letter',
      ],
      activity: [
        'May 31, 2022 — Move-out completed',
        'May 1, 2022 — Final rent received ($2,400)',
        'Apr 12, 2022 — Relocation notice received',
        'Mar 1, 2022 — March rent received',
        'Mar 15, 2020 — Move-in completed',
      ],
      mailbox: [
        { subject: 'Deposit returned', from: 'Accounting', date: 'Jun 10, 2022', preview: 'Your security deposit refund of $4,200 has been processed.', unread: false },
        { subject: 'Move-out instructions', from: 'Property Management', date: 'May 15, 2022', preview: 'Please review the attached move-out checklist.', unread: false },
        { subject: 'Rent receipt — May', from: 'Billing', date: 'May 1, 2022', preview: 'May rent of $2,400 received.', unread: false },
      ],
    },
  ]

  for (const tenant of miamiPastTenants) {
    if (!pastTenantExists.get(tenant.name, miamiProperty.id)) {
      insertPastTenant.run(
        miamiProperty.id,
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
        JSON.stringify(tenant.mailbox)
      )
    }
  }

  const marco = db.prepare("SELECT id FROM tenants WHERE name = 'Marco Alvarez' AND propertyId = ?").get(miamiProperty.id)
  const diana = db.prepare("SELECT id FROM tenants WHERE name = 'Diana Brooks' AND propertyId = ?").get(miamiProperty.id)
  const insertPayment = db.prepare(`INSERT INTO payments (invoiceNumber, tenantId, propertyId, amount, currency, type, status, dueDate, paidDate, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  const paymentExists = db.prepare('SELECT id FROM payments WHERE invoiceNumber = ?')

  const pastPayments = []
  if (marco) {
    pastPayments.push(
      ['INV-MIA-MARCO-0224', marco.id, miamiProperty.id, 2650, 'USD', 'Rent', 'Paid', '2024-02-01', '2024-02-01', 'February rent — Marco Alvarez'],
      ['INV-MIA-MARCO-DEP', marco.id, miamiProperty.id, 5300, 'USD', 'Deposit', 'Paid', '2022-06-01', '2022-06-01', 'Security deposit — Marco Alvarez'],
      ['INV-MIA-MARCO-0124', marco.id, miamiProperty.id, 2650, 'USD', 'Rent', 'Paid', '2024-01-01', '2024-01-03', 'January rent — Marco Alvarez']
    )
  }
  if (diana) {
    pastPayments.push(
      ['INV-MIA-DIANA-0522', diana.id, miamiProperty.id, 2400, 'USD', 'Rent', 'Paid', '2022-05-01', '2022-05-02', 'May rent — Diana Brooks'],
      ['INV-MIA-DIANA-DEP', diana.id, miamiProperty.id, 4800, 'USD', 'Deposit', 'Paid', '2020-03-01', '2020-03-01', 'Security deposit — Diana Brooks'],
      ['INV-MIA-DIANA-REF', diana.id, miamiProperty.id, 4200, 'USD', 'Refund', 'Paid', '2022-06-10', '2022-06-10', 'Deposit refund — Diana Brooks']
    )
  }

  for (const payment of pastPayments) {
    if (!paymentExists.get(payment[0])) {
      insertPayment.run(...payment)
    }
  }
}

if (miamiProperty && miamiTenant) {
  const insertPayment = db.prepare(`INSERT INTO payments (invoiceNumber, tenantId, propertyId, amount, currency, type, status, dueDate, paidDate, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  const paymentExists = db.prepare('SELECT id FROM payments WHERE invoiceNumber = ?')

  const miamiDemoPayments = [
    ['INV-MIA-2025-06', miamiTenant.id, miamiProperty.id, 2850, 'USD', 'Rent', 'Due', '2025-06-01', null, 'June rent — Unit 12B'],
    ['INV-MIA-2025-05', miamiTenant.id, miamiProperty.id, 2850, 'USD', 'Rent', 'Paid', '2025-05-01', '2025-05-15', 'May rent — Unit 12B'],
    ['INV-MIA-2025-04', miamiTenant.id, miamiProperty.id, 2850, 'USD', 'Rent', 'Paid', '2025-04-01', '2025-04-03', 'April rent — Unit 12B'],
    ['INV-MIA-2025-03', miamiTenant.id, miamiProperty.id, 2850, 'USD', 'Rent', 'Paid', '2025-03-01', '2025-03-02', 'March rent — Unit 12B'],
    ['INV-MIA-DEP-001', miamiTenant.id, miamiProperty.id, 5700, 'USD', 'Deposit', 'Paid', '2025-03-10', '2025-03-10', 'Security deposit — 2 months'],
    ['INV-MIA-HOA-2025', null, miamiProperty.id, 485, 'USD', 'HOA', 'Paid', '2025-04-15', '2025-04-16', 'Quarterly HOA assessment Q2'],
    ['INV-MIA-INS-2025', null, miamiProperty.id, 1340, 'USD', 'Insurance', 'Paid', '2025-01-10', '2025-01-12', 'Windstorm & liability insurance 2025'],
    ['INV-MIA-MGMT-03', null, miamiProperty.id, 285, 'USD', 'Management', 'Paid', '2025-03-31', '2025-03-31', 'March property management fee (10%)'],
    ['INV-MIA-MGMT-04', null, miamiProperty.id, 285, 'USD', 'Management', 'Paid', '2025-04-30', '2025-04-30', 'April property management fee (10%)'],
    ['INV-MIA-MGMT-05', null, miamiProperty.id, 285, 'USD', 'Management', 'Paid', '2025-05-31', '2025-05-31', 'May property management fee (10%)'],
    ['INV-MIA-MGMT-06', null, miamiProperty.id, 285, 'USD', 'Management', 'Due', '2025-06-30', null, 'June property management fee (10%)'],
    ['INV-MIA-MGMT-MARCO-0124', null, miamiProperty.id, 265, 'USD', 'Management', 'Paid', '2024-01-31', '2024-01-31', 'January PM fee — Marco Alvarez tenancy'],
    ['INV-MIA-MGMT-MARCO-0224', null, miamiProperty.id, 265, 'USD', 'Management', 'Paid', '2024-02-29', '2024-02-29', 'February PM fee — Marco Alvarez tenancy'],
    ['INV-MIA-MGMT-DIANA-0522', null, miamiProperty.id, 240, 'USD', 'Management', 'Paid', '2022-05-31', '2022-05-31', 'May PM fee — Diana Brooks tenancy'],
    ['INV-MIA-TAX-2024', null, miamiProperty.id, 3180, 'USD', 'Tax', 'Paid', '2025-03-01', '2025-03-05', '2024 Miami-Dade property tax'],
    ['INV-MIA-REP-001', null, miamiProperty.id, 760, 'USD', 'Maintenance', 'Paid', '2025-05-04', '2025-05-06', 'HVAC filter service & coil cleaning'],
    ['INV-MIA-REF-001', miamiTenant.id, miamiProperty.id, 150, 'USD', 'Refund', 'Pending', '2025-06-15', null, 'Pro-rated utility credit'],
  ]

  for (const payment of miamiDemoPayments) {
    if (!paymentExists.get(payment[0])) {
      insertPayment.run(...payment)
    }
  }
}

db.prepare(`
  UPDATE properties
  SET status = 'Available'
  WHERE status NOT IN ('Available', 'Vacant')
    AND id NOT IN (
      SELECT propertyId FROM tenants WHERE isCurrent = 1 AND propertyId IS NOT NULL
    )
`).run()

export default db
