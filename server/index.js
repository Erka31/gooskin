// Серверийн эхлэл: тохиргоо шалгах → анхны өгөгдөл → сервер асаах → backup товлох
import db from "./db/index.js";
import seed from "./db/seed.js";
import app from "./app.js";
import { cleanupOrphans } from "./services/images.js";
import { runBackup } from "./services/backup.js";
import { verifyPassword } from "./lib/password.js";
import {
  PORT,
  IS_PROD,
  PUBLIC_URL,
  JWT_SECRET_IS_DEFAULT,
  DEFAULT_ADMIN_PASSWORD,
  BACKUP_INTERVAL_HOURS,
  COOKIE_SECURE,
} from "./config.js";

seed();
cleanupOrphans();

// ---------- Аюулгүй байдлын шалгалт ----------
const problems = [];
if (JWT_SECRET_IS_DEFAULT) {
  problems.push("JWT_SECRET тохируулаагүй (32+ тэмдэгттэй санамсаргүй утга өгнө үү)");
}
const weakAdmins = db
  .prepare("SELECT email, password_hash FROM users WHERE role = 'admin'")
  .all()
  .filter((a) => verifyPassword(DEFAULT_ADMIN_PASSWORD, a.password_hash))
  .map((a) => a.email);
if (weakAdmins.length) {
  problems.push(
    `Админы нууц үг "${DEFAULT_ADMIN_PASSWORD}" хэвээр байна (${weakAdmins.join(", ")}). ` +
      "Солих: npm run admin:password -- <имэйл> <шинэ нууц үг>",
  );
}
if (IS_PROD && !COOKIE_SECURE) {
  problems.push("Production дээр COOKIE_SECURE=false байна (https ашиглана уу)");
}
if (IS_PROD && PUBLIC_URL.startsWith("http://localhost")) {
  problems.push("PUBLIC_URL тохируулаагүй (жишээ: https://gooskin.mn)");
}

if (problems.length) {
  const msg = problems.map((p) => "  ⚠️  " + p).join("\n");
  if (IS_PROD) {
    console.error("\n❌ Production горимд асах боломжгүй:\n" + msg + "\n");
    process.exit(1);
  }
  console.warn("\nАнхааруулга (production-д заавал засна):\n" + msg + "\n");
}

app.listen(PORT, (err) => {
  // Express 5 порт эзэлсэн гэх мэт алдааг энд дамжуулна
  if (err) {
    console.error(
      err.code === "EADDRINUSE"
        ? `\n❌ ${PORT} порт өөр програмд (хуучин сервер?) эзлэгдсэн байна.\n` +
            `   Хуучин серверээ зогсооно уу:  lsof -ti :${PORT} | xargs kill\n`
        : `\n❌ Сервер асаж чадсангүй: ${err.message}\n`,
    );
    process.exit(1);
  }
  console.log(
    `${IS_PROD ? "Production" : "Development"} сервер: http://localhost:${PORT}  (${PUBLIC_URL})`,
  );
});

// ---------- Автомат backup ----------
if (BACKUP_INTERVAL_HOURS > 0) {
  const every = BACKUP_INTERVAL_HOURS * 3600 * 1000;
  const tick = () => {
    try {
      runBackup();
    } catch (e) {
      console.error("[backup] алдаа:", e.message);
    }
  };
  setTimeout(tick, 60 * 1000).unref(); // асаснаас 1 минутын дараа эхний backup
  setInterval(tick, every).unref();
}

// ---------- Зөв унтрах (pm2 / systemd restart) ----------
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    try {
      db.close();
    } catch {
      /* ignore */
    }
    process.exit(0);
  });
}
