// /api/admin/messages — холбоо барих мессежүүд
import { Router } from "express";
import db from "../../db/index.js";

const router = Router();

router.get("/", (req, res) => {
  res.json(db.prepare("SELECT * FROM messages ORDER BY id DESC").all());
});

// Шийдсэн / шийдээгүй гэж тэмдэглэх
router.patch("/:id", (req, res) => {
  const r = db
    .prepare("UPDATE messages SET done = ? WHERE id = ?")
    .run(req.body?.done ? 1 : 0, Number(req.params.id));
  if (r.changes === 0) return res.status(404).json({ error: "Олдсонгүй" });
  res.json({ ok: true });
});

export default router;
