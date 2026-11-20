// Бүтээгдэхүүний зургийн файлуудыг удирдах
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import db from "../db/index.js";
import { UPLOAD_DIR } from "../config.js";

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Зөвхөн бидний үүсгэсэн нэртэй файлыг зөвшөөрнө: /uploads/<32 hex>.<ext>
const URL_RE = /^\/uploads\/([a-f0-9]{32}\.(?:jpg|png|webp|gif))$/;
export const isUploadUrl = (u) => typeof u === "string" && URL_RE.test(u);
const fileOf = (u) => path.join(UPLOAD_DIR, u.match(URL_RE)[1]);

// Файлын эхний байтаар зургийн төрлийг тодорхойлох (Content-Type-д итгэхгүй)
export function sniffImage(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (buf.toString("ascii", 0, 6) === "GIF87a" || buf.toString("ascii", 0, 6) === "GIF89a") return "gif";
  return null;
}

export function saveImage(buf) {
  const ext = sniffImage(buf);
  if (!ext) return null;
  const name = crypto.randomBytes(16).toString("hex") + "." + ext;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
  return "/uploads/" + name;
}

export function copyImage(url) {
  if (!isUploadUrl(url) || !fs.existsSync(fileOf(url))) return null;
  const ext = path.extname(url);
  const name = crypto.randomBytes(16).toString("hex") + ext;
  fs.copyFileSync(fileOf(url), path.join(UPLOAD_DIR, name));
  return "/uploads/" + name;
}

export function deleteImages(urls) {
  for (const u of urls) {
    if (!isUploadUrl(u)) continue;
    try {
      fs.unlinkSync(fileOf(u));
    } catch {
      /* аль хэдийн байхгүй */
    }
  }
}

export const parseImages = (json) => {
  try {
    const arr = JSON.parse(json || "[]");
    return Array.isArray(arr) ? arr.filter(isUploadUrl) : [];
  } catch {
    return [];
  }
};

// Ямар ч бараанд холбогдоогүй, 1 өдрөөс хуучин файлуудыг устгах
// (зураг upload хийгээд формоо хадгалалгүй орхисон тохиолдол)
export function cleanupOrphans() {
  const used = new Set(
    db
      .prepare("SELECT images FROM products")
      .all()
      .flatMap((r) => parseImages(r.images))
      .map((u) => u.split("/").pop()),
  );
  const dayAgo = Date.now() - 24 * 3600 * 1000;
  for (const f of fs.readdirSync(UPLOAD_DIR)) {
    if (used.has(f)) continue;
    const full = path.join(UPLOAD_DIR, f);
    try {
      if (fs.statSync(full).mtimeMs < dayAgo) fs.unlinkSync(full);
    } catch {
      /* ignore */
    }
  }
}
