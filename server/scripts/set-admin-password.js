// Админы нууц үг солих / шинэ админ үүсгэх:
//   npm run admin:password -- admin@goo.mn "ШинэНууцҮг123"
import db from "../db/index.js";
import { hashPassword } from "../lib/password.js";
import { setUserPassword } from "../middleware/auth.js";

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error('Хэрэглээ: npm run admin:password -- <имэйл> "<нууц үг>"');
  process.exit(1);
}
if (password.length < 10) {
  console.error("Админы нууц үг хамгийн багадаа 10 тэмдэгт байна.");
  process.exit(1);
}
const mail = email.trim().toLowerCase();
const u = db.prepare("SELECT id, role FROM users WHERE email = ?").get(mail);
if (u) {
  db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(u.id);
  setUserPassword(u.id, hashPassword(password));
  console.log(`✓ ${mail} — нууц үг солигдлоо (бусад нэвтрэлт хүчингүй боллоо)`);
} else {
  db.prepare(
    "INSERT INTO users (name, email, phone, password_hash, role) VALUES ('Админ', ?, '', ?, 'admin')",
  ).run(mail, hashPassword(password));
  console.log(`✓ ${mail} — шинэ админ үүслээ`);
}
