// /api/admin/categories — ангилал нэмэх, засах, устгах, эрэмбэлэх
import { Router } from "express";
import db, { transaction } from "../../db/index.js";
import { TONES } from "../../config.js";
import { str } from "../../lib/validate.js";

const router = Router();
const NOT_FOUND = { error: "Ангилал олдсонгүй" };

const parseCategory = (b) => {
  const name = str(b?.name, 40);
  const emoji = str(b?.emoji, 8) || "✨";
  const tone = TONES.includes(b?.tone) ? b.tone : "rose";
  const tagline = str(b?.tagline, 80);
  const sort = Math.floor(Number(b?.sort) || 0);
  const active = b?.active === undefined ? 1 : b.active ? 1 : 0;
  if (!name) return { error: "Ангиллын нэрийг оруулна уу" };
  return { name, emoji, tone, tagline, sort, active };
};

router.get("/", (req, res) => {
  res.json(
    db
      .prepare(
        `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.cat = c.name) AS products
         FROM categories c ORDER BY c.sort, c.id`,
      )
      .all(),
  );
});

router.post("/", (req, res) => {
  const c = parseCategory(req.body);
  if (c.error) return res.status(400).json({ error: c.error });
  if (db.prepare("SELECT 1 FROM categories WHERE name = ?").get(c.name)) {
    return res.status(409).json({ error: "Ийм нэртэй ангилал байна" });
  }
  const r = db
    .prepare(
      "INSERT INTO categories (name, emoji, tone, tagline, sort, active) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .run(c.name, c.emoji, c.tone, c.tagline, c.sort, c.active);
  res.status(201).json({ id: Number(r.lastInsertRowid) });
});

// Нэр солигдвол тухайн ангиллын бараануудыг ч шинэчилнэ
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const c = parseCategory(req.body);
  if (c.error) return res.status(400).json({ error: c.error });
  const old = db.prepare("SELECT name FROM categories WHERE id = ?").get(id);
  if (!old) return res.status(404).json(NOT_FOUND);
  if (
    c.name !== old.name &&
    db.prepare("SELECT 1 FROM categories WHERE name = ?").get(c.name)
  ) {
    return res.status(409).json({ error: "Ийм нэртэй ангилал байна" });
  }
  transaction(() => {
    db.prepare(
      "UPDATE categories SET name = ?, emoji = ?, tone = ?, tagline = ?, sort = ?, active = ? WHERE id = ?",
    ).run(c.name, c.emoji, c.tone, c.tagline, c.sort, c.active, id);
    if (c.name !== old.name) {
      db.prepare("UPDATE products SET cat = ? WHERE cat = ?").run(
        c.name,
        old.name,
      );
    }
  });
  res.json({ ok: true });
});

// Бараатай ангиллыг устгахгүй
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const c = db.prepare("SELECT name FROM categories WHERE id = ?").get(id);
  if (!c) return res.status(404).json(NOT_FOUND);
  const { n } = db
    .prepare("SELECT COUNT(*) AS n FROM products WHERE cat = ?")
    .get(c.name);
  if (n > 0) {
    return res.status(409).json({
      error: `Энэ ангилалд ${n} бараа байна. Эхлээд барааг өөр ангилал руу шилжүүлнэ үү.`,
    });
  }
  db.prepare("DELETE FROM categories WHERE id = ?").run(id);
  res.json({ ok: true });
});

export default router;
