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
  ownerTaxId TEXT
);

CREATE TABLE IF NOT EXISTS tenants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  unit TEXT,
  email TEXT,
  phone TEXT,
  leaseStart TEXT,
  leaseEnd TEXT,
  rent TEXT,
  status TEXT,
  nextDue TEXT,
  contract TEXT,
  cycle TEXT,
  documents TEXT,
  activity TEXT
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
  const stmt = db.prepare(`INSERT INTO tenants (name, unit, email, phone, leaseStart, leaseEnd, rent, status, nextDue, contract, cycle, documents, activity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  stmt.run('John Smith', 'Atlanta Duplex', 'john.smith@example.com', '(404) 555-0178', 'Jan 5, 2025', 'Jan 4, 2026', '$3,250', 'Paid', 'Jun 1', '12 month lease', 'Monthly', JSON.stringify(['Lease agreement', 'ID copy', 'Move-in checklist']), JSON.stringify(['May 1 - Rent received', 'Apr 27 - Maintenance request completed', 'Apr 15 - Lease reminder sent']))
  stmt.run('Kelly Rivera', 'Miami Condo', 'kelly.rivera@example.com', '(305) 555-0231', 'Mar 15, 2025', 'Mar 14, 2026', '$2,100', 'Due', 'May 29', '12 month lease', 'Monthly', JSON.stringify(['Lease agreement', 'Security deposit receipt', 'Pet addendum']), JSON.stringify(['Apr 20 - Payment reminder sent', 'Apr 10 - Lease signed', 'Mar 18 - Welcome email sent']))
  stmt.run('Marcus Lee', 'Chicago Townhome', 'marcus.lee@example.com', '(312) 555-0450', 'Feb 1, 2025', 'Jan 31, 2026', '$2,880', 'Overdue', 'May 16', '11 month lease', 'Monthly', JSON.stringify(['Lease agreement', 'Insurance proof', 'Payment authorization']), JSON.stringify(['May 16 - Payment overdue', 'May 5 - Maintenance follow-up', 'Apr 22 - Rent partial payment']))
}

const paymentCount = db.prepare('SELECT COUNT(*) as count FROM payments').get().count
if (paymentCount === 0) {
  const stmt = db.prepare(`INSERT INTO payments (invoiceNumber, tenantId, propertyId, amount, currency, type, status, dueDate, paidDate, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  stmt.run('INV-1001', 1, 1, 3250, 'USD', 'Rent', 'Paid', '2025-06-01', '2025-06-01', 'June rent for Atlanta Duplex')
  stmt.run('INV-1002', 2, 2, 2100, 'USD', 'Rent', 'Due', '2025-06-01', null, 'June rent for Miami Condo')
  stmt.run('INV-1003', 3, 3, 2880, 'USD', 'Rent', 'Overdue', '2025-05-16', null, 'May overdue rent for Chicago Townhome')
}

export default db
