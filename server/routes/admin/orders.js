// /api/admin/orders — бүх захиалга, төлөв солих
import { Router } from "express";
import db, { transaction } from "../../db/index.js";
import { adjustStock } from "../../services/stock.js";
import { STATUSES, CANCELLED } from "../../config.js";

const router = Router();

router.get("/", (req, res) => {
  const orders = db.prepare("SELECT * FROM orders ORDER BY id DESC").all();
  const items = db.prepare("SELECT * FROM order_items").all();
  res.json(
    orders.map((o) => ({
      ...o,
      items: items.filter((i) => i.order_id === o.id),
    })),
  );
});

// Цуцлагдсан руу шилжвэл нөөц буцна, цуцлагдсанаас гарвал дахин хасагдана
router.patch("/:id", (req, res) => {
  const { status } = req.body || {};
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ error: "Төлөв буруу байна" });
  }
  const id = Number(req.params.id);
  const o = db.prepare("SELECT status FROM orders WHERE id = ?").get(id);
  if (!o) return res.status(404).json({ error: "Захиалга олдсонгүй" });

  transaction(() => {
    db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
    if (o.status !== CANCELLED && status === CANCELLED) adjustStock(id, +1);
    if (o.status === CANCELLED && status !== CANCELLED) adjustStock(id, -1);
  });
  res.json({ ok: true });
});

// Төлбөр төлөгдсөн / төлөгдөөгүй гэж тэмдэглэх
router.patch("/:id/paid", (req, res) => {
  const paid = req.body?.paid ? 1 : 0;
  const r = db
    .prepare(
      "UPDATE orders SET paid = ?, paid_at = CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END WHERE id = ?",
    )
    .run(paid, paid, Number(req.params.id));
  if (r.changes === 0) {
    return res.status(404).json({ error: "Захиалга олдсонгүй" });
  }
  res.json({ ok: true });
});

export default router;
