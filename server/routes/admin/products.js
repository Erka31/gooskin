// /api/admin/products — бүтээгдэхүүн нэмэх, засах, хуулбарлах, нуух, устгах
import { Router } from "express";
import db from "../../db/index.js";
import { MAX_IMAGES_PER_PRODUCT } from "../../config.js";
import {
  isUploadUrl,
  parseImages,
  deleteImages,
  copyImage,
} from "../../services/images.js";

const router = Router();
const NOT_FOUND = { error: "Бүтээгдэхүүн олдсонгүй" };

const COLS =
  "id, brand, name, cat, price, old_price AS old, emoji, active, stock, description, images";
const withImages = (p) => p && { ...p, images: parseImages(p.images) };
const getRow = (id) =>
  db.prepare("SELECT * FROM products WHERE id = ?").get(id);

const categoryExists = (name) =>
  Boolean(db.prepare("SELECT 1 FROM categories WHERE name = ?").get(name));

// Формын өгөгдлийг шалгаж цэвэрлэх ({error} эсвэл бүтээгдэхүүн буцаана)
const parseProduct = (b) => {
  const brand = String(b?.brand || "").trim().slice(0, 60);
  const name = String(b?.name || "").trim().slice(0, 120);
  const cat = String(b?.cat || "");
  const emoji = String(b?.emoji || "").trim().slice(0, 8) || "🧴";
  const price = Math.round(Number(b?.price));
  const old = b?.old === "" || b?.old == null ? price : Math.round(Number(b.old));
  const stock = Math.floor(Number(b?.stock ?? 0));
  const description = String(b?.description || "").trim().slice(0, 2000);
  const active = b?.active === undefined ? 1 : b.active ? 1 : 0;
  const images = Array.isArray(b?.images) ? b.images.filter(isUploadUrl) : [];

  if (!brand || !name) return { error: "Нэр, брэндээ бөглөнө үү" };
  if (!categoryExists(cat)) return { error: "Ангилал буруу байна" };
  if (!(price > 0)) return { error: "Үнэ 0-ээс их байх ёстой" };
  if (!(old >= price)) {
    return { error: "Хуучин үнэ нь одоогийн үнээс багагүй байх ёстой" };
  }
  if (!(stock >= 0)) return { error: "Нөөцийн тоо буруу байна" };
  if (images.length > MAX_IMAGES_PER_PRODUCT) {
    return { error: `Хамгийн ихдээ ${MAX_IMAGES_PER_PRODUCT} зураг оруулна` };
  }
  return { brand, name, cat, emoji, price, old, stock, description, active, images };
};

router.get("/", (req, res) => {
  res.json(
    db
      .prepare(`SELECT ${COLS} FROM products ORDER BY id DESC`)
      .all()
      .map(withImages),
  );
});

router.post("/", (req, res) => {
  const p = parseProduct(req.body);
  if (p.error) return res.status(400).json({ error: p.error });
  const r = db
    .prepare(
      "INSERT INTO products (brand, name, cat, price, old_price, emoji, stock, description, active, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .run(
      p.brand,
      p.name,
      p.cat,
      p.price,
      p.old,
      p.emoji,
      p.stock,
      p.description,
      p.active,
      JSON.stringify(p.images),
    );
  res.status(201).json({ id: Number(r.lastInsertRowid) });
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const row = getRow(id);
  if (!row) return res.status(404).json(NOT_FOUND);
  const p = parseProduct(req.body);
  if (p.error) return res.status(400).json({ error: p.error });

  db.prepare(
    "UPDATE products SET brand = ?, name = ?, cat = ?, price = ?, old_price = ?, emoji = ?, stock = ?, description = ?, active = ?, images = ? WHERE id = ?",
  ).run(
    p.brand,
    p.name,
    p.cat,
    p.price,
    p.old,
    p.emoji,
    p.stock,
    p.description,
    p.active,
    JSON.stringify(p.images),
    id,
  );
  // Хасагдсан зургийн файлуудыг устгах
  deleteImages(parseImages(row.images).filter((u) => !p.images.includes(u)));
  res.json({ ok: true });
});

// Хэсэгчлэн өөрчлөх: { active } эсвэл { stock }
router.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!getRow(id)) return res.status(404).json(NOT_FOUND);
  if ("active" in (req.body || {})) {
    db.prepare("UPDATE products SET active = ? WHERE id = ?").run(
      req.body.active ? 1 : 0,
      id,
    );
  }
  if ("stock" in (req.body || {})) {
    const stock = Math.floor(Number(req.body.stock));
    if (!(stock >= 0)) {
      return res.status(400).json({ error: "Нөөцийн тоо буруу байна" });
    }
    db.prepare("UPDATE products SET stock = ? WHERE id = ?").run(stock, id);
  }
  res.json(withImages(db.prepare(`SELECT ${COLS} FROM products WHERE id = ?`).get(id)));
});

// Хуулбар үүсгэх (зургийг ч хуулна, нуусан төлөвтэй)
router.post("/:id/duplicate", (req, res) => {
  const row = getRow(Number(req.params.id));
  if (!row) return res.status(404).json(NOT_FOUND);
  const images = parseImages(row.images).map(copyImage).filter(Boolean);
  const r = db
    .prepare(
      "INSERT INTO products (brand, name, cat, price, old_price, emoji, stock, description, active, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)",
    )
    .run(
      row.brand,
      row.name + " (хуулбар)",
      row.cat,
      row.price,
      row.old_price,
      row.emoji,
      row.stock,
      row.description,
      JSON.stringify(images),
    );
  res.status(201).json({ id: Number(r.lastInsertRowid) });
});

// Захиалгад орсон бол устгахгүй, зөвхөн нууна
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const row = getRow(id);
  if (!row) return res.status(404).json(NOT_FOUND);
  const used = db
    .prepare("SELECT 1 FROM order_items WHERE product_id = ? LIMIT 1")
    .get(id);
  if (used) {
    db.prepare("UPDATE products SET active = 0 WHERE id = ?").run(id);
    return res.json({ hidden: true });
  }
  db.prepare("DELETE FROM products WHERE id = ?").run(id);
  deleteImages(parseImages(row.images));
  res.json({ deleted: true });
});

export default router;
