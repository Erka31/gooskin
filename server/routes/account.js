// /api/my — нэвтэрсэн хэрэглэгчийн захиалга, профайл, нууц үг
import { Router } from "express";
import db, { transaction } from "../db/index.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { phoneOk, str } from "../lib/validate.js";
import { requireAuth, setUserPassword } from "../middleware/auth.js";
import { startSession } from "./auth.js";
import { adjustStock } from "../services/stock.js";
import { CANCELLED } from "../config.js";

const router = Router();
router.use(requireAuth);

router.get("/orders", (req, res) => {
  const orders = db
    .prepare(
      "SELECT id, total, delivery, payment, paid, address, note, status, created_at FROM orders WHERE user_id = ? ORDER BY id DESC",
    )
    .all(req.user.id);
  const items = db
    .prepare(
      `SELECT oi.* FROM order_items oi
       JOIN orders o ON o.id = oi.order_id WHERE o.user_id = ?`,
    )
    .all(req.user.id);
  res.json(
    orders.map((o) => ({
      ...o,
      items: items.filter((i) => i.order_id === o.id),
    })),
  );
});

// Зөвхөн "Шинэ" төлөвтэй захиалгыг цуцална, нөөц буцна
router.post("/orders/:id/cancel", (req, res) => {
  const id = Number(req.params.id);
  const o = db
    .prepare("SELECT id, status FROM orders WHERE id = ? AND user_id = ?")
    .get(id, req.user.id);
  if (!o) return res.status(404).json({ error: "Захиалга олдсонгүй" });
  if (o.status !== "Шинэ") {
    return res
      .status(400)
      .json({ error: "Зөвхөн шинэ захиалгыг цуцлах боломжтой" });
  }
  transaction(() => {
    db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(CANCELLED, id);
    adjustStock(id, +1);
  });
  res.json({ ok: true });
});

router.put("/profile", (req, res) => {
  const name = str(req.body?.name, 100);
  const phone = str(req.body?.phone, 30);
  if (!name) return res.status(400).json({ error: "Нэрээ оруулна уу" });
  if (phone && !phoneOk(phone)) {
    return res.status(400).json({ error: "Утасны дугаар буруу байна" });
  }
  db.prepare("UPDATE users SET name = ?, phone = ? WHERE id = ?").run(
    name,
    phone,
    req.user.id,
  );
  res.json({ ...req.user, name, phone });
});

router.put("/password", (req, res) => {
  const current = String(req.body?.current || "");
  const next = String(req.body?.next || "");
  const row = db
    .prepare("SELECT password_hash FROM users WHERE id = ?")
    .get(req.user.id);
  if (!verifyPassword(current, row.password_hash)) {
    return res.status(400).json({ error: "Одоогийн нууц үг буруу байна" });
  }
  if (next.length < 6 || next.length > 200) {
    return res
      .status(400)
      .json({ error: "Шинэ нууц үг хамгийн багадаа 6 тэмдэгт байна" });
  }
  // Бусад төхөөрөмж дээрх нэвтрэлт хүчингүй болно, энэ төхөөрөмжид шинэ cookie
  setUserPassword(req.user.id, hashPassword(next));
  startSession(res, req.user);
  res.json({ ok: true });
});

export default router;
