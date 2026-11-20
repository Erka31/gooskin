// Серверийн бүх тохиргоо ба тогтмол утгууд.
// Утгуудыг төслийн үндсэн хавтасны .env файлаас (эсвэл орчны хувьсагчаас) уншина.
// Бүх хувьсагчийн тайлбарыг .env.example-с харна уу.
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");

// .env файл байвал ачаална (Node 21.7+). Байхгүй бол алгасна.
try {
  process.loadEnvFile(path.join(ROOT, ".env"));
} catch {
  /* .env байхгүй */
}

const env = (k, d) => {
  const v = process.env[k];
  return v === undefined || v === "" ? d : v;
};
const bool = (v) => ["1", "true", "yes", "on"].includes(String(v).toLowerCase());

export const IS_PROD = env("NODE_ENV") === "production";
export const PORT = Number(env("PORT", 3001));
export const PUBLIC_URL = env("PUBLIC_URL", `http://localhost:${PORT}`).replace(/\/$/, "");

// ---------- Аюулгүй байдал ----------
const DEV_SECRET = "goo-shop-super-secret-key-change-in-prod-2026";
export const JWT_SECRET = env("JWT_SECRET", DEV_SECRET);
export const JWT_SECRET_IS_DEFAULT = JWT_SECRET === DEV_SECRET || JWT_SECRET.length < 32;
// https дээр ажиллах үед cookie-г зөвхөн https-ээр явуулна
export const COOKIE_SECURE = bool(env("COOKIE_SECURE", IS_PROD ? "true" : "false"));
// nginx зэрэг proxy-ийн ард бол хэрэглэгчийн жинхэнэ IP-г авахын тулд
const tp = env("TRUST_PROXY", IS_PROD ? "1" : "");
export const TRUST_PROXY = tp === "" ? false : /^\d+$/.test(tp) ? Number(tp) : bool(tp) || tp;

export const ADMIN_EMAIL = env("ADMIN_EMAIL", "admin@goo.mn").toLowerCase();
export const ADMIN_PASSWORD = env("ADMIN_PASSWORD");
export const DEFAULT_ADMIN_PASSWORD = "admin123";

// ---------- Файл, хавтас ----------
export const DB_PATH = env("DB_PATH", path.join(ROOT, "server", "shop.db"));
export const DIST_DIR = path.join(ROOT, "dist");
export const UPLOAD_DIR = env("UPLOAD_DIR", path.join(ROOT, "server", "uploads"));
export const BACKUP_DIR = env("BACKUP_DIR", path.join(ROOT, "backups"));
export const BACKUP_KEEP = Number(env("BACKUP_KEEP", 14));
// Автомат backup хэдэн цаг тутам (0 = унтраах). Production-д default 24.
export const BACKUP_INTERVAL_HOURS = Number(env("BACKUP_INTERVAL_HOURS", IS_PROD ? 24 : 0));

// ---------- Дэлгүүр ----------
export const SHOP_NAME = env("SHOP_NAME", "Gooskin");
export const SHOP_PHONE = env("SHOP_PHONE", "88094535");

// ---------- Мэдэгдэл: Telegram ----------
export const TELEGRAM_BOT_TOKEN = env("TELEGRAM_BOT_TOKEN");
export const TELEGRAM_CHAT_ID = env("TELEGRAM_CHAT_ID");

// ---------- Имэйл (SMTP) ----------
export const SMTP = {
  host: env("SMTP_HOST"),
  port: Number(env("SMTP_PORT", 587)),
  secure: bool(env("SMTP_SECURE", "false")),
  user: env("SMTP_USER"),
  pass: env("SMTP_PASS"),
};
export const MAIL_FROM = env("MAIL_FROM", SMTP.user ? `${SHOP_NAME} <${SMTP.user}>` : undefined);
export const ADMIN_NOTIFY_EMAIL = env("ADMIN_NOTIFY_EMAIL");

// ---------- QPay merchant API ----------
export const QPAY = {
  baseUrl: env("QPAY_BASE_URL", "https://merchant.qpay.mn/v2").replace(/\/$/, ""),
  username: env("QPAY_USERNAME"),
  password: env("QPAY_PASSWORD"),
  invoiceCode: env("QPAY_INVOICE_CODE"),
};
export const QPAY_ENABLED = Boolean(QPAY.username && QPAY.password && QPAY.invoiceCode);

// ---------- Зураг ----------
export const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
export const MAX_IMAGES_PER_PRODUCT = 6;

// Ангиллын өнгөний сонголтууд (frontend-ийн .tone-* класстай таарна)
export const TONES = ["rose", "sun", "mint", "plum", "sky", "peach", "sand", "sage"];

export const TOKEN_DAYS = 7;

export const STATUSES = ["Шинэ", "Баталгаажсан", "Хүргэгдсэн", "Цуцлагдсан"];
export const CANCELLED = "Цуцлагдсан";

// Эхнийх нь default. Нэрийг өөрчилбөл frontend-ийн PAYMENT_META-г бас солино.
export const PAYMENTS = [
  "QPay",
  "Дансаар шилжүүлэх",
  "Бэлнээр (хүргэлтээр)",
  "Картаар (хүргэлтээр)",
];
export const FREE_DELIVERY_FROM = 50000;
export const DELIVERY_FEE = 5000;
export const deliveryFor = (subtotal) =>
  subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
