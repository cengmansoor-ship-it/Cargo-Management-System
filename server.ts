import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("cargo.db");

// Initialize Database Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY,
    baseCurrency TEXT DEFAULT 'USD',
    exchangeRateAFN REAL DEFAULT 80.0,
    exchangeRatePKR REAL DEFAULT 280.0,
    language TEXT DEFAULT 'en'
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    country TEXT,
    customerType TEXT,
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    country TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS cargo_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cargoEntryNo TEXT UNIQUE,
    customerId INTEGER,
    date TEXT,
    destinationCountry TEXT,
    totalWeight REAL,
    pricePerUnit REAL,
    unit TEXT DEFAULT 'kg',
    totalCharge REAL,
    currency TEXT,
    status TEXT DEFAULT 'OPEN',
    notes TEXT,
    FOREIGN KEY(customerId) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paymentNo TEXT UNIQUE,
    date TEXT,
    amount REAL,
    currency TEXT,
    method TEXT,
    partyType TEXT, -- CUSTOMER, SUPPLIER
    partyId INTEGER,
    referenceType TEXT, -- CARGO_ENTRY, NONE
    referenceId INTEGER,
    kind TEXT -- CARGO_PAYMENT, DEBT_REPAYMENT, SUPPLIER_PAYMENT
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expenseNo TEXT UNIQUE,
    date TEXT,
    amount REAL,
    currency TEXT,
    category TEXT, -- OFFICE_GENERAL, UPS_EXPENSE, OTHER
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    direction TEXT, -- IN, OUT
    amount REAL,
    currency TEXT,
    baseAmount REAL, -- Converted to USD
    category TEXT,
    referenceType TEXT,
    referenceId INTEGER,
    partyType TEXT,
    partyId INTEGER,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS units (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );
`);

// Migration Helper
const addColumnIfMissing = (tableName: string, columnName: string, columnDef: string) => {
  const info = db.prepare(`PRAGMA table_info(${tableName})`).all() as any[];
  if (!info.some(col => col.name === columnName)) {
    try {
      db.prepare(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}`).run();
      console.log(`Migration: Added '${columnName}' to '${tableName}'`);
    } catch (e) {
      console.error(`Migration failed for ${tableName}.${columnName}:`, e);
    }
  }
};

// Apply Migrations
addColumnIfMissing('cargo_entries', 'unit', "TEXT DEFAULT 'kg'");
addColumnIfMissing('settings', 'exchangeRateAFN', "REAL DEFAULT 80.0");
addColumnIfMissing('settings', 'exchangeRatePKR', "REAL DEFAULT 280.0");
addColumnIfMissing('settings', 'language', "TEXT DEFAULT 'en'");
addColumnIfMissing('ledger', 'partyType', "TEXT");
addColumnIfMissing('ledger', 'partyId', "INTEGER");

// Seed Units if empty
const unitsCount = db.prepare("SELECT COUNT(*) as count FROM units").get() as any;
if (unitsCount.count === 0) {
  db.prepare("INSERT INTO units (name) VALUES ('kg')").run();
  db.prepare("INSERT INTO units (name) VALUES ('ton')").run();
}

const app = express();
app.use(express.json());

// --- API ROUTES ---

// Settings
app.get("/api/settings", (req, res) => {
  const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get();
  res.json(settings);
});

app.put("/api/settings", (req, res) => {
  const { baseCurrency, exchangeRateAFN, exchangeRatePKR, language } = req.body;
  db.prepare("UPDATE settings SET baseCurrency = ?, exchangeRateAFN = ?, exchangeRatePKR = ?, language = ? WHERE id = 1")
    .run(baseCurrency, exchangeRateAFN, exchangeRatePKR, language);
  res.json({ success: true });
});

// Units
app.get("/api/units", (req, res) => {
  const units = db.prepare("SELECT * FROM units").all();
  res.json(units);
});

app.post("/api/units", (req, res) => {
  const { name } = req.body;
  try {
    const result = db.prepare("INSERT INTO units (name) VALUES (?)").run(name);
    res.json({ id: result.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: "Unit already exists" });
  }
});

app.delete("/api/units/:id", (req, res) => {
  db.prepare("DELETE FROM units WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// Customers
app.get("/api/customers", (req, res) => {
  const customers = db.prepare(`
    SELECT c.*, 
    (SELECT SUM(totalCharge) FROM cargo_entries WHERE customerId = c.id) as totalCharged,
    (SELECT SUM(amount) FROM payments WHERE partyType = 'CUSTOMER' AND partyId = c.id) as totalPaid
    FROM customers c
  `).all();
  res.json(customers);
});

app.post("/api/customers", (req, res) => {
  const { name, phone, country, customerType, notes } = req.body;
  const result = db.prepare("INSERT INTO customers (name, phone, country, customerType, notes) VALUES (?, ?, ?, ?, ?)")
    .run(name, phone, country, customerType, notes);
  res.json({ id: result.lastInsertRowid });
});

// Cargo Entries
app.get("/api/cargo-entries", (req, res) => {
  const entries = db.prepare(`
    SELECT ce.*, c.name as customerName,
    (SELECT SUM(amount) FROM payments WHERE referenceType = 'CARGO_ENTRY' AND referenceId = ce.id) as paidAmount
    FROM cargo_entries ce
    JOIN customers c ON ce.customerId = c.id
  `).all();
  res.json(entries);
});

app.post("/api/cargo-entries", (req, res) => {
  const { customerId, date, destinationCountry, totalWeight, pricePerUnit, unit, currency, notes } = req.body;
  const totalCharge = totalWeight * pricePerUnit;
  const cargoEntryNo = `CRG-${Date.now()}`;
  const result = db.prepare("INSERT INTO cargo_entries (cargoEntryNo, customerId, date, destinationCountry, totalWeight, pricePerUnit, unit, totalCharge, currency, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(cargoEntryNo, customerId, date, destinationCountry, totalWeight, pricePerUnit, unit, totalCharge, currency, notes);
  res.json({ id: result.lastInsertRowid, cargoEntryNo });
});

// Payments (AUTO LEDGER)
app.post("/api/payments", (req, res) => {
  const { date, amount, currency, method, partyType, partyId, referenceType, referenceId, kind } = req.body;
  const paymentNo = `PAY-${Date.now()}`;
  
  const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get() as any;
  let baseAmount = amount;
  if (currency === 'AFN') baseAmount = amount / settings.exchangeRateAFN;
  if (currency === 'PKR') baseAmount = amount / settings.exchangeRatePKR;

  const transaction = db.transaction(() => {
    const payResult = db.prepare("INSERT INTO payments (paymentNo, date, amount, currency, method, partyType, partyId, referenceType, referenceId, kind) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(paymentNo, date, amount, currency, method, partyType, partyId, referenceType, referenceId, kind);
    
    const direction = partyType === 'CUSTOMER' ? 'IN' : 'OUT';
    const category = kind;

    db.prepare("INSERT INTO ledger (date, direction, amount, currency, baseAmount, category, referenceType, referenceId, partyType, partyId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(date, direction, amount, currency, baseAmount, category, 'PAYMENT', payResult.lastInsertRowid, partyType, partyId);
    
    return payResult.lastInsertRowid;
  });

  const id = transaction();
  res.json({ id, paymentNo });
});

// Expenses
app.get("/api/expenses", (req, res) => {
  const expenses = db.prepare("SELECT * FROM expenses ORDER BY date DESC").all();
  res.json(expenses);
});

app.post("/api/expenses", (req, res) => {
  const { date, amount, currency, category, description } = req.body;
  const expenseNo = `EXP-${Date.now()}`;

  const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get() as any;
  let baseAmount = amount;
  if (currency === 'AFN') baseAmount = amount / settings.exchangeRateAFN;
  if (currency === 'PKR') baseAmount = amount / settings.exchangeRatePKR;

  const transaction = db.transaction(() => {
    const expResult = db.prepare("INSERT INTO expenses (expenseNo, date, amount, currency, category, description) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(expenseNo, date, amount, currency, category, description);
    
    db.prepare("INSERT INTO ledger (date, direction, amount, currency, baseAmount, category, referenceType, referenceId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run(date, 'OUT', amount, currency, baseAmount, category, 'EXPENSE', expResult.lastInsertRowid);
    
    return expResult.lastInsertRowid;
  });

  const id = transaction();
  res.json({ id, expenseNo });
});

// Payments
app.get("/api/payments", (req, res) => {
  const payments = db.prepare(`
    SELECT p.*, 
    CASE 
      WHEN p.partyType = 'CUSTOMER' THEN (SELECT name FROM customers WHERE id = p.partyId)
      WHEN p.partyType = 'SUPPLIER' THEN (SELECT name FROM suppliers WHERE id = p.partyId)
    END as partyName
    FROM payments p 
    ORDER BY date DESC
  `).all();
  res.json(payments);
});

// Reports
app.get("/api/reports/cashflow", (req, res) => {
  const { from, to } = req.query;
  const query = `SELECT * FROM ledger WHERE date BETWEEN ? AND ?`;
  const rows = db.prepare(query).all(from, to) as any[];

  const cashInTotal = rows.filter(r => r.direction === 'IN').reduce((sum, r) => sum + r.baseAmount, 0);
  const cashOutTotal = rows.filter(r => r.direction === 'OUT').reduce((sum, r) => sum + r.baseAmount, 0);

  const breakdownIn = db.prepare(`SELECT category, SUM(baseAmount) as amount FROM ledger WHERE direction = 'IN' AND date BETWEEN ? AND ? GROUP BY category`).all(from, to);
  const breakdownOut = db.prepare(`SELECT category, SUM(baseAmount) as amount FROM ledger WHERE direction = 'OUT' AND date BETWEEN ? AND ? GROUP BY category`).all(from, to);

  res.json({
    cashInTotal,
    cashOutTotal,
    net: cashInTotal - cashOutTotal,
    breakdownIn,
    breakdownOut
  });
});

app.get("/api/reports/debts", (req, res) => {
  const customerReceivables = db.prepare(`
    SELECT SUM(totalCharge) - (SELECT IFNULL(SUM(amount), 0) FROM payments WHERE partyType = 'CUSTOMER') as total
    FROM cargo_entries
  `).get() as any;

  res.json({
    customerReceivablesTotal: customerReceivables.total || 0,
    supplierPayablesTotal: 0 // Placeholder
  });
});

// Suppliers
app.get("/api/suppliers", (req, res) => {
  const suppliers = db.prepare("SELECT * FROM suppliers").all();
  res.json(suppliers);
});

app.post("/api/suppliers", (req, res) => {
  const { name, phone, country, notes } = req.body;
  const result = db.prepare("INSERT INTO suppliers (name, phone, country, notes) VALUES (?, ?, ?, ?)")
    .run(name, phone, country, notes);
  res.json({ id: result.lastInsertRowid });
});

// Customers - Edit/Delete
app.put("/api/customers/:id", (req, res) => {
  const { name, phone, country, customerType, notes } = req.body;
  db.prepare("UPDATE customers SET name = ?, phone = ?, country = ?, customerType = ?, notes = ? WHERE id = ?")
    .run(name, phone, country, customerType, notes, req.params.id);
  res.json({ success: true });
});

app.delete("/api/customers/:id", (req, res) => {
  db.prepare("DELETE FROM customers WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// Suppliers - Edit/Delete
app.put("/api/suppliers/:id", (req, res) => {
  const { name, phone, country, notes } = req.body;
  db.prepare("UPDATE suppliers SET name = ?, phone = ?, country = ?, notes = ? WHERE id = ?")
    .run(name, phone, country, notes, req.params.id);
  res.json({ success: true });
});

app.delete("/api/suppliers/:id", (req, res) => {
  db.prepare("DELETE FROM suppliers WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// Cargo Entries - Edit/Delete
app.put("/api/cargo-entries/:id", (req, res) => {
  const { customerId, date, destinationCountry, totalWeight, pricePerUnit, unit, currency, notes, status } = req.body;
  const totalCharge = totalWeight * pricePerUnit;
  db.prepare("UPDATE cargo_entries SET customerId = ?, date = ?, destinationCountry = ?, totalWeight = ?, pricePerUnit = ?, unit = ?, totalCharge = ?, currency = ?, notes = ?, status = ? WHERE id = ?")
    .run(customerId, date, destinationCountry, totalWeight, pricePerUnit, unit, totalCharge, currency, notes, status, req.params.id);
  res.json({ success: true });
});

app.delete("/api/cargo-entries/:id", (req, res) => {
  db.prepare("DELETE FROM cargo_entries WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// Payments - Delete (with Ledger reversal)
app.delete("/api/payments/:id", (req, res) => {
  const transaction = db.transaction(() => {
    db.prepare("DELETE FROM ledger WHERE referenceType = 'PAYMENT' AND referenceId = ?").run(req.params.id);
    db.prepare("DELETE FROM payments WHERE id = ?").run(req.params.id);
  });
  transaction();
  res.json({ success: true });
});

// Expenses - Delete (with Ledger reversal)
app.delete("/api/expenses/:id", (req, res) => {
  const transaction = db.transaction(() => {
    db.prepare("DELETE FROM ledger WHERE referenceType = 'EXPENSE' AND referenceId = ?").run(req.params.id);
    db.prepare("DELETE FROM expenses WHERE id = ?").run(req.params.id);
  });
  transaction();
  res.json({ success: true });
});

// Payments - Edit (with Ledger update)
app.put("/api/payments/:id", (req, res) => {
  const { date, amount, currency, method, partyType, partyId, referenceType, referenceId, kind } = req.body;
  
  const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get() as any;
  let baseAmount = amount;
  if (currency === 'AFN') baseAmount = amount / settings.exchangeRateAFN;
  if (currency === 'PKR') baseAmount = amount / settings.exchangeRatePKR;

  const transaction = db.transaction(() => {
    db.prepare("UPDATE payments SET date = ?, amount = ?, currency = ?, method = ?, partyType = ?, partyId = ?, referenceType = ?, referenceId = ?, kind = ? WHERE id = ?")
      .run(date, amount, currency, method, partyType, partyId, referenceType, referenceId, kind, req.params.id);
    
    const direction = partyType === 'CUSTOMER' ? 'IN' : 'OUT';
    db.prepare("UPDATE ledger SET date = ?, direction = ?, amount = ?, currency = ?, baseAmount = ?, category = ?, partyType = ?, partyId = ? WHERE referenceType = 'PAYMENT' AND referenceId = ?")
      .run(date, direction, amount, currency, baseAmount, kind, partyType, partyId, req.params.id);
  });

  transaction();
  res.json({ success: true });
});

// Expenses - Edit (with Ledger update)
app.put("/api/expenses/:id", (req, res) => {
  const { date, amount, currency, category, description } = req.body;

  const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get() as any;
  let baseAmount = amount;
  if (currency === 'AFN') baseAmount = amount / settings.exchangeRateAFN;
  if (currency === 'PKR') baseAmount = amount / settings.exchangeRatePKR;

  const transaction = db.transaction(() => {
    db.prepare("UPDATE expenses SET date = ?, amount = ?, currency = ?, category = ?, description = ? WHERE id = ?")
      .run(date, amount, currency, category, description, req.params.id);
    
    db.prepare("UPDATE ledger SET date = ?, amount = ?, currency = ?, baseAmount = ?, category = ? WHERE referenceType = 'EXPENSE' AND referenceId = ?")
      .run(date, amount, currency, baseAmount, category, req.params.id);
  });

  transaction();
  res.json({ success: true });
});

// --- VITE MIDDLEWARE ---
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
}

const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
