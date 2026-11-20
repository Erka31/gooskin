// QPay merchant API v2 (https://developer.qpay.mn)
// .env-д QPAY_USERNAME, QPAY_PASSWORD, QPAY_INVOICE_CODE тохируулсан үед ажиллана.
// Туршилтын орчинд QPAY_BASE_URL=https://merchant-sandbox.qpay.mn/v2 гэж өгнө.
import { QPAY, QPAY_ENABLED, PUBLIC_URL, SHOP_NAME } from "../config.js";

export { QPAY_ENABLED };

let cached = { token: null, until: 0 };

async function call(path, { method = "POST", body, auth } = {}) {
  const r = await fetch(QPAY.baseUrl + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: auth || `Bearer ${await accessToken()}`,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    // Token хугацаа дууссан бол дараагийн удаа шинээр авна
    if (r.status === 401) cached = { token: null, until: 0 };
    throw new Error(`QPay ${path} ${r.status}: ${data.message || JSON.stringify(data)}`);
  }
  return data;
}

async function accessToken() {
  if (cached.token && Date.now() < cached.until) return cached.token;
  const basic = Buffer.from(`${QPAY.username}:${QPAY.password}`).toString("base64");
  const d = await call("/auth/token", { auth: `Basic ${basic}` });
  // Хугацааг 50 минутаар хязгаарлаж кэшлэнэ
  cached = { token: d.access_token, until: Date.now() + 50 * 60 * 1000 };
  return cached.token;
}

// Захиалгад нэхэмжлэх үүсгэх → { invoice_id, qr_image, qPay_shortUrl, urls }
export async function createInvoice(order) {
  return call("/invoice", {
    body: {
      invoice_code: QPAY.invoiceCode,
      sender_invoice_no: String(order.id),
      invoice_receiver_code: String(order.phone || "terminal"),
      invoice_description: `${SHOP_NAME} захиалга #${order.id}`,
      amount: order.total,
      callback_url: `${PUBLIC_URL}/api/qpay/callback?order=${order.id}&key=${order.public_key}`,
    },
  });
}

// Нэхэмжлэх төлөгдсөн эсэх
export async function isInvoicePaid(invoiceId, amount) {
  const d = await call("/payment/check", {
    body: {
      object_type: "INVOICE",
      object_id: invoiceId,
      offset: { page_number: 1, page_limit: 100 },
    },
  });
  const paidRows = (d.rows || []).filter((r) => r.payment_status === "PAID");
  const paid = Number(d.paid_amount || 0);
  return paidRows.length > 0 && (paid === 0 || paid >= amount);
}
