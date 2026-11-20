// Бүтээгдэхүүний нөөцийн тооцоо
import db from "../db/index.js";

// Захиалгын мөрүүдээр нөөцийг нэмэх/хасах (sign: +1 буцаах, -1 хасах)
export function adjustStock(orderId, sign) {
  const rows = db
    .prepare("SELECT product_id, qty FROM order_items WHERE order_id = ?")
    .all(orderId);
  const upd = db.prepare(
    "UPDATE products SET stock = MAX(0, stock + ?) WHERE id = ?",
  );
  for (const r of rows) upd.run(sign * r.qty, r.product_id);
}
