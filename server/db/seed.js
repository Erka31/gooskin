// Анхны өгөгдөл: админ бүртгэл, жишээ бүтээгдэхүүн, тайлбар
import db from "./index.js";
import { hashPassword } from "../lib/password.js";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "../config.js";

function seedAdmin() {
  const admin = db
    .prepare("SELECT id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1")
    .get();
  if (admin) return;

  const pw = ADMIN_PASSWORD || "admin123";
  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(ADMIN_EMAIL);
  if (existing) {
    db.prepare(
      "UPDATE users SET role = 'admin', password_hash = ? WHERE id = ?",
    ).run(hashPassword(pw), existing.id);
  } else {
    db.prepare(
      "INSERT INTO users (name, email, phone, password_hash, role) VALUES ('Админ', ?, '', ?, 'admin')",
    ).run(ADMIN_EMAIL, hashPassword(pw));
  }
  console.log(
    `Админ бүртгэл үүслээ: ${ADMIN_EMAIL}` +
      (ADMIN_PASSWORD ? "" : " (нууц үг: admin123)"),
  );
}

const PRODUCTS = [
  ["Brand A", "Чийгшүүлэгч крем", "Арьс арчилгаа", 32900, 45000, "🧴"],
  ["Brand B", "Нарны тос SPF50", "Нарны тос", 28500, 38000, "☀️"],
  ["Brand C", "Уруулын будаг", "Нүүр будалт", 19900, 25000, "💄"],
  ["Brand D", "Нүүр угаагч хөөс", "Арьс арчилгаа", 15500, 21000, "🫧"],
  ["Brand E", "Шүдний оо", "Амны хөндий", 9900, 12000, "🪥"],
  ["Brand F", "Серум", "Арьс арчилгаа", 54000, 72000, "💧"],
  ["Brand B", "Нарны тос SPF30 хөнгөн", "Нарны тос", 24000, 30000, "🌞"],
  ["Brand G", "Тушь", "Нүүр будалт", 22000, 29000, "👁️"],
  ["Brand E", "Амны зайлуулагч", "Амны хөндий", 11500, 14000, "🦷"],
  ["Brand H", "Нүүрний маск", "Арьс арчилгаа", 6900, 9000, "🧖"],
  ["Brand C", "Суурь тос", "Нүүр будалт", 36000, 48000, "🧼"],
  ["Brand D", "Тонер", "Арьс арчилгаа", 27000, 35000, "🌿"],
];

function seedProducts() {
  const { n } = db.prepare("SELECT COUNT(*) AS n FROM products").get();
  if (n > 0) return;
  const ins = db.prepare(
    "INSERT INTO products (brand, name, cat, price, old_price, emoji) VALUES (?, ?, ?, ?, ?, ?)",
  );
  for (const row of PRODUCTS) ins.run(...row);
}

// Тайлбаргүй бүтээгдэхүүнд ангиллаар нь анхны тайлбар өгөх
const DESCRIPTIONS = {
  "Арьс арчилгаа":
    "Арьсыг чийгшүүлж, зөөлрүүлэн, өдөр тутмын арчилгаанд тохиромжтой. Бүх төрлийн арьсанд хэрэглэж болно.",
  "Нарны тос":
    "UVA/UVB туяанаас хамгаалж, арьсыг наранд түлэгдэхээс сэргийлнэ. Гадагш гарахаас 15 минутын өмнө түрхэнэ.",
  "Амны хөндий":
    "Амны хөндийг цэвэр, амьсгалыг сэрүүн байлгана. Өдөрт 2 удаа хэрэглэхийг зөвлөж байна.",
  "Нүүр будалт":
    "Удаан тогтоцтой, арьсанд зөөлөн. Өдөр тутмын болон баярын будалтад тохиромжтой.",
};

function seedDescriptions() {
  const upd = db.prepare(
    "UPDATE products SET description = ? WHERE cat = ? AND description = ''",
  );
  for (const [cat, d] of Object.entries(DESCRIPTIONS)) upd.run(d, cat);
}

// Анхны ангиллууд: [нэр, emoji, өнгө, товч тайлбар]
const CATEGORIES = [
  ["Арьс арчилгаа", "🧴", "rose", "Өдөр тутмын арьс арчилгаа"],
  ["Нүүр угаагч", "🫧", "sky", "Хөөс, гель, тос угаагч"],
  ["Тонер, эссенс", "🌿", "sage", "Арьсны тэнцвэр, чийг"],
  ["Серум, ампул", "💧", "sky", "Идэвхтэй найрлагатай серум"],
  ["Чийгшүүлэгч крем", "🍶", "peach", "Өдрийн болон шөнийн тос"],
  ["Нүүрний маск", "🧖", "sage", "Даавуун, шавар, шөнийн маск"],
  ["Батга, асуудалтай арьс", "🩹", "rose", "Батга, улайлт, нүхжилт"],
  ["Нарны тос", "☀️", "sun", "SPF хамгаалалт өдөр бүр"],
  ["Нүд арчилгаа", "👁️", "plum", "Нүдний крем, патч"],
  ["Уруул арчилгаа", "👄", "peach", "Уруулын тос, маск"],
  ["Нүүр будалт", "💄", "peach", "Уруул, тушь, суурь тос"],
  ["Үс арчилгаа", "💇", "sand", "Шампунь, ангижруулагч, тос"],
  ["Биеийн арчилгаа", "🛁", "mint", "Лосьон, скраб, шүршүүрийн гель"],
  ["Гар, хумс", "💅", "rose", "Гарын тос, хумсны арчилгаа"],
  ["Үнэртэн", "🌸", "plum", "Сүрчиг, биеийн шүршлэг"],
  ["Эрэгтэй арчилгаа", "🧔", "sky", "Сахлын болон арьс арчилгаа"],
  ["Хүүхдийн арчилгаа", "🍼", "sun", "Зөөлөн, хүүхдэд ээлтэй"],
  ["Амны хөндий", "🪥", "mint", "Цэвэр, сэрүүн амьсгал"],
  ["Витамин, нэмэлт", "💊", "sand", "Гоо сайхны витамин"],
  ["Бэлгийн багц", "🎁", "peach", "Хайртай хүндээ бэлэглэх"],
];

function seedCategories() {
  const { n } = db.prepare("SELECT COUNT(*) AS n FROM categories").get();
  const ins = db.prepare(
    "INSERT OR IGNORE INTO categories (name, emoji, tone, tagline, sort) VALUES (?, ?, ?, ?, ?)",
  );
  if (n === 0) {
    CATEGORIES.forEach(([name, emoji, tone, tagline], i) =>
      ins.run(name, emoji, tone, tagline, i),
    );
  }
  // Бараанд байгаа боловч ангиллын жагсаалтад байхгүй нэрийг нэмэх
  const missing = db
    .prepare(
      "SELECT DISTINCT cat FROM products WHERE cat NOT IN (SELECT name FROM categories)",
    )
    .all();
  for (const { cat } of missing) ins.run(cat, "✨", "rose", "", 99);
}

export default function seed() {
  seedAdmin();
  seedCategories();
  seedProducts();
  seedDescriptions();
}
