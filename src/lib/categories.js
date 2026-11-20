import { TONES } from "../constants";

// Сервер /api/categories өгөхгүй үед (хуучин сервер, алдаа) бараануудаас
// ангиллын жагсаалтыг гаргаж авна — ингэснээр ангилал үргэлж харагдана.
export function categoriesFromProducts(products) {
  const map = new Map();
  for (const p of products) {
    if (!p.cat) continue;
    const c = map.get(p.cat);
    if (c) c.count += 1;
    else {
      map.set(p.cat, {
        id: p.cat,
        name: p.cat,
        emoji: p.emoji || "✨",
        tone: TONES[map.size % TONES.length][0],
        tagline: "",
        count: 1,
      });
    }
  }
  return [...map.values()];
}

// Серверийн жагсаалтыг бараатай нь нийлүүлэх:
// серверт байхгүй ч бараанд байгаа ангиллыг нэмнэ, тоог шинэчилнэ.
export function mergeCategories(server, products) {
  const fromProducts = categoriesFromProducts(products);
  if (!server) return fromProducts;
  const counts = Object.fromEntries(fromProducts.map((c) => [c.name, c.count]));
  const known = new Set(server.map((c) => c.name));
  return [
    ...server.map((c) => ({ ...c, count: counts[c.name] ?? c.count ?? 0 })),
    ...fromProducts.filter((c) => !known.has(c.name)),
  ];
}
