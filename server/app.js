// Express app-ийг угсрах: middleware → API route-ууд → frontend → алдааны handler
import express from "express";
import fs from "node:fs";
import path from "node:path";
import db from "./db/index.js";
import { DIST_DIR, UPLOAD_DIR, TRUST_PROXY, IS_PROD } from "./config.js";
import securityHeaders from "./middleware/security.js";
import { notFound, errorHandler } from "./middleware/errors.js";
import authRoutes from "./routes/auth.js";
import accountRoutes from "./routes/account.js";
import shopRoutes from "./routes/shop.js";
import adminRoutes from "./routes/admin/index.js";
import seoRoutes, { renderIndex } from "./routes/seo.js";

const app = express();

app.disable("x-powered-by");
// nginx-ийн ард бол хэрэглэгчийн жинхэнэ IP-г X-Forwarded-For-оос авна
app.set("trust proxy", TRUST_PROXY);

// ---------- Хүсэлтийн лог (API) ----------
app.use((req, res, next) => {
  if (!req.path.startsWith("/api/")) return next();
  const t = Date.now();
  res.on("finish", () => {
    // Development-д зөвхөн алдааг, production-д бүгдийг бичнэ
    if (IS_PROD || res.statusCode >= 400) {
      console.log(
        `${new Date().toISOString()} ${req.ip} ${req.method} ${req.originalUrl.split("?")[0]} ${res.statusCode} ${Date.now() - t}ms`,
      );
    }
  });
  next();
});

app.use(express.json({ limit: "100kb" }));
app.use(securityHeaders);

// ---------- Бүтээгдэхүүний зураг ----------
app.use(
  "/uploads",
  express.static(UPLOAD_DIR, { maxAge: "30d", immutable: true, index: false }),
);

// ---------- Серверийн төлөв (uptime мониторинг) ----------
app.get("/api/health", (req, res) => {
  try {
    db.prepare("SELECT 1").get();
    res.json({ ok: true, uptime: Math.round(process.uptime()) });
  } catch {
    res.status(503).json({ ok: false });
  }
});

// ---------- API ----------
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
app.use("/api/auth", authRoutes);
app.use("/api/my", accountRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", shopRoutes);
app.use("/api", notFound);

// ---------- SEO ----------
app.use(seoRoutes);

// ---------- Production: build хийсэн frontend-ийг serve хийх ----------
if (fs.existsSync(path.join(DIST_DIR, "index.html"))) {
  app.use(
    "/assets",
    express.static(path.join(DIST_DIR, "assets"), { maxAge: "1y", immutable: true }),
  );
  app.use(express.static(DIST_DIR, { index: false, maxAge: "1d" }));
  // SPA: бусад бүх GET хүсэлтэд index.html (хуудас бүрийн meta-тай)
  app.use((req, res, next) => {
    if (req.method !== "GET" || path.extname(req.path)) return next();
    const html = renderIndex(req.path);
    if (!html) return next();
    res.setHeader("Cache-Control", "no-cache");
    res.type("html").send(html);
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
