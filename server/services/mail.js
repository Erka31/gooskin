// Имэйл илгээх (SMTP). .env-д SMTP_HOST, SMTP_USER, SMTP_PASS тохируулсан үед л ажиллана.
import nodemailer from "nodemailer";
import { SMTP, MAIL_FROM } from "../config.js";

export const MAIL_ENABLED = Boolean(SMTP.host && SMTP.user && SMTP.pass);

const transport = MAIL_ENABLED
  ? nodemailer.createTransport({
      host: SMTP.host,
      port: SMTP.port,
      secure: SMTP.secure,
      auth: { user: SMTP.user, pass: SMTP.pass },
    })
  : null;

export async function sendMail({ to, subject, text, html }) {
  if (!transport || !to) return false;
  await transport.sendMail({ from: MAIL_FROM, to, subject, text, html });
  return true;
}

// Тохиргоо зөв эсэхийг шалгах (админы "Тохиргоо" табаас)
export async function verifyMail() {
  if (!transport) return false;
  await transport.verify();
  return true;
}
