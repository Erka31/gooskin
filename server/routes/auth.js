// /api/auth — бүртгүүлэх, нэвтрэх, гарах, одоогийн хэрэглэгч, нууц үг сэргээх
import crypto from "node:crypto";
import { Router } from "express";
import db from "../db/index.js";
import { signJWT } from "../lib/jwt.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { emailOk, phoneOk } from "../lib/validate.js";
import {
  setAuthCookie,
  clearAuthCookie,
  getUser,
  setUserPassword,
} from "../middleware/auth.js";
import {
  tooMany,
  noteAttempt,
  resetAttempts,
  rateLimit,
} from "../middleware/rateLimit.js";
import { sendMail, MAIL_ENABLED } from "../services/mail.js";
import { PUBLIC_URL, SHOP_NAME, SHOP_PHONE } from "../config.js";

const router = Router();
const HOUR = 3600 * 1000;

const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
});

// Нэвтрүүлэх: HttpOnly cookie тавина (token-ийг JSON-оор буцаахгүй)
export const startSession = (res, u) =>
  setAuthCookie(res, signJWT({ sub: u.id, role: u.role, t: Date.now() }));

// Нэвтрэх handler үүсгэгч — adminOnly=true бол зөвхөн админыг нэвтрүүлнэ
export const loginHandler = (adminOnly) => (req, res) => {
  const email = (req.body?.email || "").trim().toLowerCase();
  const password = req.body?.password || "";
  const key = "login|" + req.ip + "|" + email;
  const ipKey = "login-ip|" + req.ip;

  if (tooMany(key) || tooMany(ipKey, 50)) {
    return res
      .status(429)
      .json({ error: "Хэт олон оролдлоо. 15 минутын дараа дахин оролдоно уу" });
  }

  const u = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (
    !u ||
    (adminOnly && u.role !== "admin") ||
    !verifyPassword(password, u.password_hash)
  ) {
    noteAttempt(key);
    noteAttempt(ipKey);
    return res.status(401).json({ error: "И-мэйл эсвэл нууц үг буруу байна" });
  }

  resetAttempts(key);
  startSession(res, u);
  res.json({ user: publicUser(u) });
};

router.post(
  "/signup",
  rateLimit({
    name: "signup",
    max: 10,
    windowMs: HOUR,
    message: "Хэт олон бүртгэл үүсгэлээ. Түр хүлээнэ үү",
  }),
  (req, res) => {
    const name = (req.body?.name || "").trim().slice(0, 100);
    const email = (req.body?.email || "").trim().toLowerCase().slice(0, 200);
    const phone = (req.body?.phone || "").trim().slice(0, 30);
    const password = req.body?.password || "";

    if (!name) return res.status(400).json({ error: "Нэрээ оруулна уу" });
    if (!emailOk(email)) {
      return res.status(400).json({ error: "И-мэйл хаяг буруу байна" });
    }
    if (password.length < 6 || password.length > 200) {
      return res
        .status(400)
        .json({ error: "Нууц үг хамгийн багадаа 6 тэмдэгт байна" });
    }
    if (phone && !phoneOk(phone)) {
      return res.status(400).json({ error: "Утасны дугаар буруу байна" });
    }
    if (db.prepare("SELECT id FROM users WHERE email = ?").get(email)) {
      return res
        .status(409)
        .json({ error: "Энэ и-мэйлээр аль хэдийн бүртгүүлсэн байна" });
    }

    const r = db
      .prepare(
        "INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'customer')",
      )
      .run(name, email, phone, hashPassword(password));
    const user = { id: Number(r.lastInsertRowid), name, email, phone, role: "customer" };
    startSession(res, user);
    res.status(201).json({ user });
  },
);

router.post("/login", loginHandler(false));

router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get("/me", (req, res) => {
  res.json(getUser(req));
});

// ---------- Нууц үг сэргээх ----------
const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

router.post(
  "/forgot",
  rateLimit({ name: "forgot", max: 5, windowMs: HOUR }),
  async (req, res) => {
    if (!MAIL_ENABLED) {
      return res.status(503).json({
        error: `Имэйл үйлчилгээ одоогоор идэвхгүй байна. ${SHOP_PHONE} дугаар руу залгаж нууц үгээ сэргээлгэнэ үү.`,
      });
    }
    const email = (req.body?.email || "").trim().toLowerCase();
    const ok = {
      ok: true,
      message:
        "Хэрэв энэ и-мэйлээр бүртгэл байгаа бол нууц үг сэргээх холбоос илгээлээ. Имэйлээ шалгана уу.",
    };
    const u = emailOk(email)
      ? db.prepare("SELECT id, name, email FROM users WHERE email = ?").get(email)
      : null;
    // Бүртгэл байгаа эсэхийг илчлэхгүйн тулд үргэлж ижил хариу өгнө
    if (!u) return res.json(ok);

    const token = crypto.randomBytes(32).toString("hex");
    db.prepare("DELETE FROM password_resets WHERE user_id = ?").run(u.id);
    db.prepare(
      "INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
    ).run(u.id, sha256(token), Date.now() + HOUR);

    const link = `${PUBLIC_URL}/reset-password?token=${token}`;
    try {
      await sendMail({
        to: u.email,
        subject: `${SHOP_NAME}: нууц үг сэргээх`,
        text:
          `Сайн байна уу, ${u.name}!\n\n` +
          `Нууц үгээ шинэчлэхийн тулд доорх холбоосоор орно уу (1 цагийн хугацаатай):\n${link}\n\n` +
          `Хэрэв та хүсэлт гаргаагүй бол энэ имэйлийг үл тоомсорлоно уу.\n\n${SHOP_NAME}`,
      });
    } catch (e) {
      console.error("[forgot] mail:", e.message);
      return res
        .status(502)
        .json({ error: "Имэйл илгээж чадсангүй. Дараа дахин оролдоно уу" });
    }
    res.json(ok);
  },
);

router.post(
  "/reset",
  rateLimit({ name: "reset", max: 20, windowMs: HOUR }),
  (req, res) => {
    const token = String(req.body?.token || "");
    const password = String(req.body?.password || "");
    if (password.length < 6 || password.length > 200) {
      return res
        .status(400)
        .json({ error: "Нууц үг хамгийн багадаа 6 тэмдэгт байна" });
    }
    const row = db
      .prepare(
        "SELECT * FROM password_resets WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?",
      )
      .get(sha256(token), Date.now());
    if (!row) {
      return res.status(400).json({
        error: "Холбоос хүчингүй эсвэл хугацаа нь дууссан байна. Дахин хүсэлт илгээнэ үү.",
      });
    }
    setUserPassword(row.user_id, hashPassword(password));
    db.prepare("DELETE FROM password_resets WHERE user_id = ?").run(row.user_id);
    const u = db.prepare("SELECT * FROM users WHERE id = ?").get(row.user_id);
    startSession(res, u);
    res.json({ user: publicUser(u) });
  },
);

export default router;
