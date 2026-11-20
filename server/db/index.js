// SQLite холболт, хүснэгтүүд, хуучин database-ийн шинэчлэл
import { DatabaseSync } from "node:sqlite";
import { DB_PATH } from "../config.js";

const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand TEXT NOT NULL,
    name TEXT NOT NULL,
    cat TEXT NOT NULL,
    price INTEGER NOT NULL,
    old_price INTEGER NOT NULL,
    emoji TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL DEFAULT '',
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    total INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'Шинэ',
    user_id INTEGER REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    product_name TEXT NOT NULL,
    price INTEGER NOT NULL,
    qty INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    emoji TEXT NOT NULL DEFAULT '✨',
    tone TEXT NOT NULL DEFAULT 'rose',
    tagline TEXT NOT NULL DEFAULT '',
    sort INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at INTEGER NOT NULL,
    used_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

// ---------- Хуучин database-д дутуу баганыг нэмэх ----------
const hasCol = (table, col) =>
  db
    .prepare(`PRAGMA table_info(${table})`)
    .all()
    .some((c) => c.name === col);

const MIGRATIONS = [
  ["orders", "user_id", "INTEGER REFERENCES users(id)"],
  ["users", "role", "TEXT NOT NULL DEFAULT 'customer'"],
  ["products", "active", "INTEGER NOT NULL DEFAULT 1"],
  ["products", "stock", "INTEGER NOT NULL DEFAULT 50"],
  ["products", "description", "TEXT NOT NULL DEFAULT ''"],
  ["orders", "delivery", "INTEGER NOT NULL DEFAULT 0"],
  ["orders", "payment", "TEXT NOT NULL DEFAULT ''"],
  ["orders", "note", "TEXT NOT NULL DEFAULT ''"],
  ["orders", "paid", "INTEGER NOT NULL DEFAULT 0"],
  ["orders", "paid_at", "TEXT"],
  ["products", "images", "TEXT NOT NULL DEFAULT '[]'"],
  ["users", "pw_changed_at", "INTEGER NOT NULL DEFAULT 0"],
  ["orders", "public_key", "TEXT"],
  ["orders", "qpay_invoice_id", "TEXT"],
];

for (const [table, col, def] of MIGRATIONS) {
  if (!hasCol(table, col)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
  }
}

// Транзакц дотор ажиллуулах туслах
export function transaction(fn) {
  db.exec("BEGIN");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

export default db;
