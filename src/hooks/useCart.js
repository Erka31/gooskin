import { useState, useEffect } from "react";

const STORAGE_KEY = "cart";

const loadCart = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    return saved.map((i) => ({ id: i.id, qty: i.qty }));
  } catch {
    return [];
  }
};

// Сагсны төлөв: localStorage-д хадгална, нөөцөөс хэтрүүлэхгүй.
// cart зөвхөн {id, qty} хадгална; үнэ, нэр зэргийг products-оос авна.
export default function useCart(products) {
  const [cart, setCart] = useState(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart]);

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
