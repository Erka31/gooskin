// Database + зургийн нөөц хуулбар (backups/<огноо>/)
import fs from "node:fs";
import path from "node:path";
import db from "../db/index.js";
import { BACKUP_DIR, BACKUP_KEEP, UPLOAD_DIR } from "../config.js";

const stamp = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
};

export function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) return [];
  return fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => /^\d{4}-\d{2}-\d{2}_\d{6}$/.test(f))
    .sort()
    .reverse();
}

export function runBackup() {
  const dir = path.join(BACKUP_DIR, stamp());
  fs.mkdirSync(dir, { recursive: true });
  // VACUUM INTO: ажиллаж буй database-ийн бүрэн, тогтвортой хуулбар
  const dbFile = path.join(dir, "shop.db");
  db.exec(`VACUUM INTO '${dbFile.replace(/'/g, "''")}'`);
  if (fs.existsSync(UPLOAD_DIR)) {
    fs.cpSync(UPLOAD_DIR, path.join(dir, "uploads"), { recursive: true });
  }
  // Хуучин нөөцийг устгах
  for (const old of listBackups().slice(BACKUP_KEEP)) {
    fs.rmSync(path.join(BACKUP_DIR, old), { recursive: true, force: true });
  }
  console.log(`[backup] ${dir}`);
  return path.basename(dir);
}
