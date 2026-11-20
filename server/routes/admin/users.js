// /api/admin/users, /api/admin/subscribers — хэрэглэгчид ба мэдээлэл авагчид
import { Router } from "express";
import crypto from "node:crypto";
import db from "../../db/index.js";
import { hashPassword } from "../../lib/password.js";
import { setUserPassword } from "../../middleware/auth.js";

const router = Router();

router.get("/users", (req, res) => {
  res.json(
    db
      .prepare(
        `SELECT u.id, u.name, u.email, u.phone, u.created_at,
                COUNT(o.id) AS orders,
                COALESCE(SUM(CASE WHEN o.status != 'Цуцлагдсан' THEN o.total END), 0) AS spent
         FROM users u LEFT JOIN orders o ON o.user_id = u.id
         WHERE u.role = 'customer'
         GROUP BY u.id ORDER BY u.id DESC`,
      )
      .all(),
  );
});

// Хэрэглэгчийн нууц үгийг түр нууц үгээр солих (утсаар хүсэлт ирэхэд)
router.post("/users/:id/reset-password", (req, res) => {
  const u = db
    .prepare("SELECT id, role FROM users WHERE id = ?")
    .get(Number(req.params.id));
  if (!u || u.role !== "customer") {
    return res.status(404).json({ error: "Хэрэглэгч олдсонгүй" });
  }
  // Андуурагдах тэмдэгтгүй 10 оронтой түр нууц үг
  const abc = "abcdefghjkmnpqrstuvwxyz23456789";
  const temp = Array.from(crypto.randomBytes(10), (b) => abc[b % abc.length]).join("");
  setUserPassword(u.id, hashPassword(temp));
  res.json({ password: temp });
});

router.get("/subscribers", (req, res) => {
  res.json(db.prepare("SELECT * FROM subscribers ORDER BY id DESC").all());
});

export default router;
