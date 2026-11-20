// Бүтээгдэхүүнтэй холбоотой цэвэр туслах функцууд

// Хямдралын хувь (хуучин үнэ байхгүй бол 0)
export const discountOf = (p) =>
  p.old > p.price ? Math.round((1 - p.price / p.old) * 100) : 0;

// Эрэмбэлэх сонголтууд: [утга, харагдах нэр]
export const SORTS = [
  ["default", "Эрэмбэлэх"],
  ["asc", "Үнэ өсөхөөр"],
  ["desc", "Үнэ буурахаар"],
  ["sale", "Хамгийн их хямдрал"],
  ["name", "Нэрээр (А-Я)"],
];

const SORTERS = {
  asc: (a, b) => a.price - b.price,
  desc: (a, b) => b.price - a.price,
  sale: (a, b) => discountOf(b) - discountOf(a),
  name: (a, b) => a.name.localeCompare(b.name, "mn"),
};

// Ангилал + хайлтаар шүүгээд эрэмбэлэх
export function filterProducts(products, { cat, query, sort }) {
  const q = query.trim().toLowerCase();
  const list = products.filter(
    (p) =>
      (cat === "Бүгд" || p.cat === cat) &&
      (p.name + " " + p.brand + " " + p.cat).toLowerCase().includes(q),
  );
  return SORTERS[sort] ? [...list].sort(SORTERS[sort]) : list;
}

// Хүргэлтийн төлбөр (сервертэй ижил дүрэм)
export const deliveryFee = (subtotal, config) =>
  subtotal === 0 || subtotal >= config.freeDeliveryFrom
    ? 0
    : config.deliveryFee;
