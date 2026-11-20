// Захиалгын төлбөрийн төлөвийг шинэчлэх (QPay шалгалт, админы тэмдэглэгээ)
import db from "../db/index.js";
import { isInvoicePaid, QPAY_ENABLED } from "./qpay.js";
import { notifyPaid } from "./notify.js";

// Төлөгдсөн гэж тэмдэглэх. "Шинэ" захиалгыг автоматаар "Баталгаажсан" болгоно.
export function markPaid(orderId) {
  const r = db
    .prepare(
      `UPDATE orders SET paid = 1, paid_at = CURRENT_TIMESTAMP,
         status = CASE WHEN status = 'Шинэ' THEN 'Баталгаажсан' ELSE status END
       WHERE id = ? AND paid = 0`,
    )
    .run(orderId);
  if (r.changes > 0) {
    notifyPaid(db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId));
  }
}

// QPay-ээс асууж төлөгдсөн бол тэмдэглэнэ. Буцаах: true/false
export async function syncQpay(order) {
  if (order.paid) return true;
  if (!QPAY_ENABLED || !order.qpay_invoice_id) return false;
  const paid = await isInvoicePaid(order.qpay_invoice_id, order.total);
  if (paid) markPaid(order.id);
  return paid;
}
