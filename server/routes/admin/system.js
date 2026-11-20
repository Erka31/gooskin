// /api/admin/system — тохиргооны төлөв, backup, мэдэгдэл туршиж үзэх
import { Router } from "express";
import { notifyStatus, telegram } from "../../services/notify.js";
import { verifyMail } from "../../services/mail.js";
import { listBackups, runBackup } from "../../services/backup.js";
import {
  QPAY_ENABLED,
  QPAY,
  PUBLIC_URL,
  COOKIE_SECURE,
  IS_PROD,
  JWT_SECRET_IS_DEFAULT,
  BACKUP_INTERVAL_HOURS,
  SHOP_NAME,
} from "../../config.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    production: IS_PROD,
    publicUrl: PUBLIC_URL,
    https: COOKIE_SECURE,
    jwtSecretOk: !JWT_SECRET_IS_DEFAULT,
    qpay: QPAY_ENABLED,
    qpaySandbox: QPAY.baseUrl.includes("sandbox"),
    ...notifyStatus(),
    backupEveryHours: BACKUP_INTERVAL_HOURS,
    backups: listBackups().slice(0, 10),
    node: process.version,
    uptime: Math.round(process.uptime()),
  });
});

router.post("/backup", (req, res) => {
  res.json({ name: runBackup() });
});

router.post("/test-notify", async (req, res) => {
  const out = {};
  try {
    out.telegram = await telegram(`🔔 ${SHOP_NAME}: туршилтын мэдэгдэл`);
  } catch (e) {
    out.telegram = e.message;
  }
  try {
    out.mail = await verifyMail();
  } catch (e) {
    out.mail = e.message;
  }
  res.json(out);
});

export default router;
