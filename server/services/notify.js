// Шинэ захиалга, төлбөр, мессежийн мэдэгдэл: Telegram + имэйл.
// Тохируулаагүй бол чимээгүй алгасна. Алдаа гарсан ч захиалгад нөлөөлөхгүй.
import {
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID,
  ADMIN_NOTIFY_EMAIL,
  PUBLIC_URL,
  SHOP_NAME,
  SHOP_PHONE,
} from "../config.js";
import { sendMail, MAIL_ENABLED } from "./mail.js";

export const TELEGRAM_ENABLED = Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID);

const money = (n) => Number(n || 0).toLocaleString("en-US") + "₮";
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export async function telegram(html) {
  if (!TELEGRAM_ENABLED) return false;
  const r = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: html,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(10000),
    },
  );
  if (!r.ok) throw new Error("Telegram: " + r.status + " " + (await r.text()));
  return true;
}

// Алдааг лог руу бичээд үргэлжлүүлэх
const safe = (label, p) =>
  Promise.resolve(p).catch((e) => console.error(`[notify:${label}]`, e.message));

export function notifyNewOrder(order, lines, customerEmail) {
  const items = lines
    .map((l) => `• ${esc(l.p.name)} × ${l.qty} = ${money(l.p.price * l.qty)}`)
    .join("\n");
  const msg =
    `🛍️ <b>Шинэ захиалга #${order.id}</b>\n` +
    `👤 ${esc(order.name)} · 📞 ${esc(order.phone)}\n` +
    `📍 ${esc(order.address)}\n` +
    (order.note ? `📝 ${esc(order.note)}\n` : "") +
    `\n${items}\n` +
    (order.delivery ? `Хүргэлт: ${money(order.delivery)}\n` : "") +
    `<b>Нийт: ${money(order.total)}</b> · ${esc(order.payment)}\n\n` +
    `${PUBLIC_URL}/admin`;

  safe("telegram", telegram(msg));
  safe(
    "admin-mail",
    sendMail({
      to: ADMIN_NOTIFY_EMAIL,
      subject: `Шинэ захиалга #${order.id} · ${money(order.total)}`,
      text: msg.replace(/<[^>]+>/g, ""),
    }),
  );

  // Бүртгэлтэй хэрэглэгчид баталгаажуулах имэйл
  if (customerEmail) {
    const text =
      `Сайн байна уу, ${order.name}!\n\n` +
      `Таны #${order.id} захиалгыг хүлээн авлаа.\n\n` +
      lines.map((l) => `• ${l.p.name} × ${l.qty}`).join("\n") +
      `\n\nНийт: ${money(order.total)}\nТөлбөр: ${order.payment}\nХаяг: ${order.address}\n\n` +
      `Захиалгаа ${PUBLIC_URL} хаягаар нэвтэрч “Миний захиалгууд” хэсгээс харна уу.\n` +
      `Асуух зүйл байвал ${SHOP_PHONE} руу залгаарай.\n\n${SHOP_NAME}`;
    safe(
      "customer-mail",
      sendMail({
        to: customerEmail,
        subject: `${SHOP_NAME}: #${order.id} захиалга хүлээн авлаа`,
        text,
      }),
    );
  }
}

export function notifyPaid(order) {
  safe(
    "telegram",
    telegram(
      `✅ <b>Төлбөр орлоо #${order.id}</b>\n${money(order.total)} · ${esc(order.payment)}`,
    ),
  );
}

export function notifyMessage(m) {
  safe(
    "telegram",
    telegram(
      `✉️ <b>Шинэ мессеж</b>\n${esc(m.name)} (${esc(m.email)})\n\n${esc(m.message)}`,
    ),
  );
  safe(
    "admin-mail",
    sendMail({
      to: ADMIN_NOTIFY_EMAIL,
      subject: `Шинэ мессеж: ${m.name}`,
      text: `${m.name} <${m.email}>\n\n${m.message}`,
    }),
  );
}

export const notifyStatus = () => ({
  telegram: TELEGRAM_ENABLED,
  mail: MAIL_ENABLED,
  adminEmail: Boolean(ADMIN_NOTIFY_EMAIL),
});
