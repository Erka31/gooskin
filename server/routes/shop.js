// /api — нийтэд нээлттэй: тохиргоо, бүтээгдэхүүн, захиалга, мэдээлэл авах, холбоо барих
import { Router } from "express";
import db, { transaction } from "../db/index.js";
import { emailOk, phoneOk, str } from "../lib/validate.js";
import { getUser } from "../middleware/auth.js";
import { parseImages } from "../services/images.js";
import crypto from "node:crypto";
import { tooMany, noteAttempt, rateLimit } from "../middleware/rateLimit.js";
import { notifyNewOrder, notifyMessage } from "../services/notify.js";
import { MAIL_ENABLED } from "../services/mail.js";
import { createInvoice, QPAY_ENABLED } from "../services/qpay.js";
import { syncQpay } from "../services/payments.js";
import {
  PAYMENTS,
  FREE_DELIVERY_FROM,
  DELIVERY_FEE,
  deliveryFor,
} from "../config.js";

const router = Router();

router.get("/config", (req, res) => {
  res.json({
    payments: PAYMENTS,
    freeDeliveryFrom: FREE_DELIVERY_FROM,
    deliveryFee: DELIVERY_FEE,
    qpayEnabled: QPAY_ENABLED,
    mailEnabled: MAIL_ENABLED,
  });
});

// Идэвхтэй ангиллууд + идэвхтэй барааны тоо
router.get("/categories", (req, res) => {
  res.json(
    db
      .prepare(
        `SELECT c.id, c.name, c.emoji, c.tone, c.tagline,
                (SELECT COUNT(*) FROM products p WHERE p.cat = c.name AND p.active = 1) AS count
         FROM categories c WHERE c.active = 1 ORDER BY c.sort, c.id`,
      )
      .all(),
  );
});

router.get("/products", (req, res) => {
  res.json(
    db
      .prepare(
        "SELECT id, brand, name, cat, price, old_price AS old, emoji, stock, description, images FROM products WHERE active = 1 ORDER BY id",
      )
      .all()
      .map((p) => ({ ...p, images: parseImages(p.images) })),
  );
});

router.post(
  "/orders",
  rateLimit({
    name: "orders",
    max: 20,
    message: "Хэт олон захиалга илгээлээ. Түр хүлээгээд дахин оролдоно уу",
  }),
  async (req, res) => {
    const { name, phone, address, items } = req.body || {};
    const payment = PAYMENTS.includes(req.body?.payment)
      ? req.body.payment
      : PAYMENTS[0];
    const note = str(req.body?.note, 500);

    if (!name?.trim() || !address?.trim() || !phone?.trim()) {
      return res
        .status(400)
        .json({ error: "Нэр, утас, хаягаа бүрэн бөглөнө үү" });
    }
    if (!phoneOk(phone)) {
      return res.status(400).json({ error: "Утасны дугаар буруу байна" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Сагс хоосон байна" });
    }

    // Бараа бүрийг шалгаж, нийт дүнг серверт тооцно (client-ийн үнэд итгэхгүй)
    const getProduct = db.prepare(
      "SELECT * FROM products WHERE id = ? AND active = 1",
    );
    const lines = [];
    let total = 0;
    for (const it of items) {
      const p = getProduct.get(Number(it.id));
      const qty = Math.floor(Number(it.qty));
      if (!p || !(qty >= 1 && qty <= 99)) {
        return res.status(400).json({ error: "Сагсны мэдээлэл буруу байна" });
      }
      if (p.stock < qty) {
        return res.status(409).json({
          error:
            p.stock > 0
              ? `"${p.name}" зөвхөн ${p.stock} ширхэг үлдсэн байна`
              : `"${p.name}" дууссан байна`,
        });
      }
      total += p.price * qty;
      lines.push({ p, qty });
    }

    const user = getUser(req);
    const delivery = deliveryFor(total);
    total += delivery;

    const publicKey = crypto.randomBytes(16).toString("hex");
    const orderId = transaction(() => {
      const r = db
        .prepare(
          "INSERT INTO orders (name, phone, address, total, user_id, delivery, payment, note, public_key) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .run(
          str(name, 100),
          str(phone, 30),
          str(address, 300),
          total,
          user ? user.id : null,
          delivery,
          payment,
          note,
          publicKey,
        );
      const id = Number(r.lastInsertRowid);
      const insItem = db.prepare(
        "INSERT INTO order_items (order_id, product_id, product_name, price, qty) VALUES (?, ?, ?, ?, ?)",
      );
      const decStock = db.prepare(
        "UPDATE products SET stock = stock - ? WHERE id = ?",
      );
      for (const { p, qty } of lines) {
        insItem.run(id, p.id, p.name, p.price, qty);
        decStock.run(qty, p.id);
      }
      return id;
    });

    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
    notifyNewOrder(order, lines, user?.email);

    // QPay нэхэмжлэх (тохируулсан үед). Алдаа гарвал гараар нэхэмжлэх горимд шилжинэ.
    let qpay = null;
    if (payment === "QPay" && QPAY_ENABLED) {
      try {
        const inv = await createInvoice(order);
        db.prepare("UPDATE orders SET qpay_invoice_id = ? WHERE id = ?").run(
          inv.invoice_id,
          orderId,
        );
        qpay = {
          qr_image: inv.qr_image,
          short_url: inv.qPay_shortUrl,
          urls: (inv.urls || []).map((u) => ({
            name: u.name,
            description: u.description,
            logo: u.logo,
            link: u.link,
          })),
        };
      } catch (e) {
        console.error("[qpay] invoice:", e.message);
      }
    }

    res
      .status(201)
      .json({ id: orderId, key: publicKey, total, delivery, payment, qpay });
  },
);

// Захиалгын төлбөр төлөгдсөн эсэх (захиалагч QR уншуулсны дараа шалгана)
router.post(
  "/orders/:id/check-payment",
  rateLimit({ name: "paycheck", max: 120 }),
  async (req, res) => {
    const order = db
      .prepare("SELECT * FROM orders WHERE id = ? AND public_key = ?")
      .get(Number(req.params.id), String(req.body?.key || ""));
    if (!order) return res.status(404).json({ error: "Захиалга олдсонгүй" });
    try {
      res.json({ paid: await syncQpay(order) });
    } catch (e) {
      console.error("[qpay] check:", e.message);
      res
        .status(502)
        .json({ error: "Төлбөр шалгахад алдаа гарлаа", paid: false });
    }
  },
);

// QPay callback: төлбөр орсон үед QPay энэ хаяг руу хандана.
// Callback-д итгэхгүй — QPay API-аас дахин шалгаж баталгаажуулна.
router.all("/qpay/callback", async (req, res) => {
  const order = db
    .prepare("SELECT * FROM orders WHERE id = ? AND public_key = ?")
    .get(Number(req.query.order), String(req.query.key || ""));
  if (order) {
    try {
      await syncQpay(order);
    } catch (e) {
      console.error("[qpay] callback:", e.message);
    }
  }
  res.send("SUCCESS");
});

router.post(
  "/subscribe",
  rateLimit({ name: "subscribe", max: 20, windowMs: 3600 * 1000 }),
  (req, res) => {
    const email = (req.body?.email || "").trim().toLowerCase();
    if (!emailOk(email)) {
      return res.status(400).json({ error: "И-мэйл хаяг буруу байна" });
    }
    db.prepare("INSERT OR IGNORE INTO subscribers (email) VALUES (?)").run(
      email,
    );
    res.status(201).json({ ok: true });
  },
);

router.post("/contact", (req, res) => {
  const name = str(req.body?.name, 100);
  const email = str(req.body?.email, 200).toLowerCase();
  const message = str(req.body?.message, 2000);
  if (!name || !message) {
    return res.status(400).json({ error: "Нэр болон мессежээ бичнэ үү" });
  }
  if (!emailOk(email)) {
    return res.status(400).json({ error: "И-мэйл хаяг буруу байна" });
  }
  const key = "contact|" + req.ip;
  if (tooMany(key)) {
    return res
      .status(429)
      .json({ error: "Хэт олон мессеж илгээлээ. Түр хүлээнэ үү" });
  }
  noteAttempt(key);
  db.prepare(
    "INSERT INTO messages (name, email, message) VALUES (?, ?, ?)",
  ).run(name, email, message);
  notifyMessage({ name, email, message });
  res.status(201).json({ ok: true });
});

export default router;
