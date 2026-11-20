// Token унших, cookie тавих, хэрэглэгчийг таних middleware-үүд
import db from "../db/index.js";
import { verifyJWT } from "../lib/jwt.js";
import { TOKEN_DAYS, COOKIE_SECURE } from "../config.js";

const SECURE = COOKIE_SECURE ? "; Secure" : "";

const getCookie = (req, name) =>
  (req.headers.cookie || "")
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(name + "="))
    ?.slice(name.length + 1);

// Authorization: Bearer <token> эсвэл "token" cookie
export function extractToken(req) {
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7).trim();
  return getCookie(req, "token") || null;
}

export function setAuthCookie(res, token) {
  res.setHeader(
    "Set-Cookie",
    `token=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${TOKEN_DAYS * 86400}${SECURE}`,
  );
}

export function clearAuthCookie(res) {
  res.setHeader(
    "Set-Cookie",
    `token=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${SECURE}`,
  );
}

// Хүсэлтээс нэвтэрсэн хэрэглэгчийг олох (байхгүй бол null)
export function getUser(req) {
  const token = extractToken(req);
  if (!token) return null;
  const payload = verifyJWT(token);
  if (!payload?.sub) return null;
  const u = db
    .prepare(
      "SELECT id, name, email, phone, role, pw_changed_at FROM users WHERE id = ?",
    )
    .get(Number(payload.sub));
  // Нууц үг солигдохоос өмнө олгосон token хүчингүй (миллисекундээр харьцуулна)
  const issuedMs = payload.t ?? (payload.iat || 0) * 1000;
  if (!u || issuedMs < (u.pw_changed_at || 0)) return null;
  const { pw_changed_at: _ignored, ...user } = u;
  return user;
}

// Нууц үгийг шинэчилж, бусад бүх нэвтрэлтийг хүчингүй болгоно
export function setUserPassword(userId, hash) {
  db.prepare(
    "UPDATE users SET password_hash = ?, pw_changed_at = ? WHERE id = ?",
  ).run(hash, Date.now(), userId);
}

export const requireAuth = (req, res, next) => {
  const u = getUser(req);
  if (!u) return res.status(401).json({ error: "Нэвтэрнэ үү" });
  req.user = u;
  next();
};

export const requireAdmin = (req, res, next) => {
  const u = getUser(req);
  if (!u) return res.status(401).json({ error: "Админаар нэвтэрнэ үү" });
  if (u.role !== "admin") {
    return res.status(403).json({ error: "Админ эрх байхгүй байна" });
  }
  req.user = u;
  next();
};
