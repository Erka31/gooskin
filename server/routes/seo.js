// SEO: sitemap.xml, robots.txt, хуудас бүрийн <title>/og meta (Facebook, Google)
import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import db from "../db/index.js";
import { parseImages } from "../services/images.js";
import { DIST_DIR, PUBLIC_URL, SHOP_NAME } from "../config.js";
import { productSlug } from "../lib/slug.js";

const router = Router();

// Мэдээллийн хуудсуудын гарчиг (src/pages/content.jsx-тэй таарна)
const PAGE_TITLES = {
  about: "Бидний тухай",
  terms: "Үйлчилгээний нөхцөл",
  privacy: "Нууцлалын бодлого",
  delivery: "Хүргэлт ба буцаалт",
  faq: "Түгээмэл асуултууд",
  stores: "Дэлгүүрүүдийн байршил",
  contact: "Холбоо барих",
};

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

router.get("/robots.txt", (req, res) => {
  res.type("text/plain").send(
    `User-agent: *\nDisallow: /admin\nDisallow: /api/\nDisallow: /reset-password\n\nSitemap: ${PUBLIC_URL}/sitemap.xml\n`,
  );
});

router.get("/sitemap.xml", (req, res) => {
  const urls = [
    "/",
    ...Object.keys(PAGE_TITLES).map((s) => `/p/${s}`),
    ...db
      .prepare("SELECT id, name FROM products WHERE active = 1")
      .all()
      .map((p) => `/product/${productSlug(p)}`),
  ];
  res.type("application/xml").send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.map((u) => `  <url><loc>${esc(PUBLIC_URL + u)}</loc></url>`).join("\n") +
      `\n</urlset>\n`,
  );
});

// ---------- index.html-д meta оруулах ----------
let template = null;
const loadTemplate = () => {
  const f = path.join(DIST_DIR, "index.html");
  if (!fs.existsSync(f)) return null;
  template ??= fs.readFileSync(f, "utf8");
  return template;
};

function metaFor(urlPath) {
  const base = {
    title: `${SHOP_NAME} · Арьс арчилгааны онлайн дэлгүүр`,
    description:
      "Арьс арчилгаа, нарны тос, нүүр будалтын оригинал бүтээгдэхүүн хямд үнээр. Улаанбаатарт 24–48 цагт хүргэнэ.",
    image: null,
    url: PUBLIC_URL + urlPath,
    noindex: false,
  };
  const prod = urlPath.match(/^\/product\/(\d+)/);
  if (prod) {
    const p = db
      .prepare("SELECT * FROM products WHERE id = ? AND active = 1")
      .get(Number(prod[1]));
    if (p) {
      const img = parseImages(p.images)[0];
      return {
        ...base,
        title: `${p.name} · ${p.brand} · ${SHOP_NAME}`,
        description:
          `${Number(p.price).toLocaleString("en-US")}₮ · ` +
          (p.description || `${p.cat} ангиллын бүтээгдэхүүн`).slice(0, 150),
        image: img ? PUBLIC_URL + img : null,
        url: `${PUBLIC_URL}/product/${productSlug(p)}`,
      };
    }
  }
  const page = urlPath.match(/^\/p\/([\w-]+)/);
  if (page && PAGE_TITLES[page[1]]) {
    return { ...base, title: `${PAGE_TITLES[page[1]]} · ${SHOP_NAME}` };
  }
  if (urlPath.startsWith("/admin") || urlPath.startsWith("/reset-password")) {
    return { ...base, noindex: true };
  }
  return base;
}

export function renderIndex(urlPath) {
  const html = loadTemplate();
  if (!html) return null;
  const m = metaFor(urlPath);
  const tags =
    `<link rel="canonical" href="${esc(m.url)}" />\n` +
    `<meta property="og:url" content="${esc(m.url)}" />\n` +
    `<meta property="og:site_name" content="${esc(SHOP_NAME)}" />\n` +
    `<meta name="twitter:card" content="${m.image ? "summary_large_image" : "summary"}" />\n` +
    (m.image ? `<meta property="og:image" content="${esc(m.image)}" />\n` : "") +
    (m.noindex ? `<meta name="robots" content="noindex" />\n` : "");
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(m.title)}</title>`)
    .replace(
      /<meta\s+name="description"[^>]*\/>/,
      `<meta name="description" content="${esc(m.description)}" />`,
    )
    .replace(
      /<meta property="og:title"[^>]*\/>/,
      `<meta property="og:title" content="${esc(m.title)}" />`,
    )
    .replace(
      /<meta\s+property="og:description"[^>]*\/>/,
      `<meta property="og:description" content="${esc(m.description)}" />`,
    )
    .replace("</head>", tags + "</head>");
}

export default router;
