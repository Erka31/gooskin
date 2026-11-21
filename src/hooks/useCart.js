import { useState, useEffect } from "react";

// Сагсыг эзэмшигч бүрээр тусад нь хадгална:
//   "guest"  → нэвтрээгүй зочин   (localStorage: cart:guest)
//   "u12"    → 12 дугаартай хэрэглэгч (localStorage: cart:u12)
//   null     → нэвтэрсэн эсэх нь хараахан тодорхойгүй (хадгалахгүй)
// Гарахад тухайн хэрэглэгчийн сагс харагдахаа болино, дахин нэвтрэхэд сэргэнэ.
// Зочин байхдаа сагсалсан барааг нэвтэрмэгц өөрийнх нь сагс руу нийлүүлнэ.
const LEGACY_KEY = "cart"; // хуучин хувилбарын нийтийн сагс
const keyOf = (owner) => "cart:" + owner;

const read = (key) => {
  try {
    const saved = JSON.parse(localStorage.getItem(key)) || [];
    return saved
      .filter((i) => i && Number.isInteger(i.id) && i.qty > 0)
      .map((i) => ({ id: i.id, qty: i.qty }));
  } catch {
    return [];
  }
};
const write = (key, cart) => {
  try {
    localStorage.setItem(key, JSON.stringify(cart));
  } catch {
    /* ignore */
  }
};
const drop = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
};

// Хоёр сагсыг нийлүүлэх (ижил барааны тоог нэмнэ)
const merge = (a, b) => {
  const out = a.map((i) => ({ ...i }));
  for (const it of b) {
    const ex = out.find((i) => i.id === it.id);
    if (ex) ex.qty += it.qty;
    else out.push({ ...it });
  }
  return out;
};

// Сагсны төлөв: нөөцөөс хэтрүүлэхгүй.
// cart зөвхөн {id, qty} хадгална; үнэ, нэр зэргийг products-оос авна.
export default function useCart(products, owner) {
  const [cart, setCart] = useState([]);
  const [loadedFor, setLoadedFor] = useState(null);

  // Эзэмшигч солигдоход (нэвтрэх / гарах) тухайн хүний сагсыг ачаална
  useEffect(() => {
    if (!owner) return;
    let next = read(keyOf(owner));
    const legacy = read(LEGACY_KEY);
    drop(LEGACY_KEY);
    if (owner === "guest") {
      next = merge(next, legacy);
    } else {
      // Зочин байхдаа сагсалсныг хэрэглэгчийн сагс руу шилжүүлнэ
      const guest = merge(read(keyOf("guest")), legacy);
      if (guest.length) {
        next = merge(next, guest);
        drop(keyOf("guest"));
      }
    }
    setCart(next);
    setLoadedFor(owner);
  }, [owner]);

  // Зөвхөн ачаалагдсан эзэмшигчийн түлхүүр рүү хадгална
  useEffect(() => {
    if (owner && loadedFor === owner) write(keyOf(owner), cart);
  }, [cart, owner, loadedFor]);

  const stockOf = (id) => products.find((p) => p.id === id)?.stock ?? 0;
  const qtyOf = (id) => cart.find((i) => i.id === id)?.qty || 0;

  // Амжилттай нэмсэн бол true, нөөц хүрэлцэхгүй бол false
  const add = (p, n = 1) => {
    const have = qtyOf(p.id);
    const qty = Math.min(p.stock, have + n);
    if (qty <= have) return false;
    setCart((c) =>
      c.find((i) => i.id === p.id)
        ? c.map((i) => (i.id === p.id ? { ...i, qty } : i))
        : [...c, { id: p.id, qty }],
    );
    return true;
  };

  const changeQty = (id, d) =>
    setCart((c) =>
      c
        .map((i) =>
          i.id === id ? { ...i, qty: Math.min(stockOf(id), i.qty + d) } : i,
        )
        .filter((i) => i.qty > 0),
    );

  const remove = (id) => setCart((c) => c.filter((i) => i.id !== id));
  const clear = () => setCart([]);

  // Харуулах мөрүүд (идэвхгүй болсон / дууссан бараа автоматаар хасагдана)
  const items = cart
    .map((c) => {
      const p = products.find((x) => x.id === c.id);
      return p ? { ...p, qty: Math.min(c.qty, p.stock) } : null;
    })
    .filter((i) => i && i.qty > 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return { items, count, qtyOf, add, changeQty, remove, clear };
}
