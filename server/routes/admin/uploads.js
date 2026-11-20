// POST /api/admin/upload — зураг (binary body) хүлээн авч хадгална
import express, { Router } from "express";
import { saveImage } from "../../services/images.js";
import { MAX_IMAGE_BYTES } from "../../config.js";

const router = Router();

router.post(
  "/",
  express.raw({ type: "image/*", limit: MAX_IMAGE_BYTES }),
  (req, res) => {
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return res.status(400).json({ error: "Зургийн файл ирсэнгүй" });
    }
    const url = saveImage(req.body);
    if (!url) {
      return res
        .status(415)
        .json({ error: "Зөвхөн JPG, PNG, WEBP, GIF зураг оруулна уу" });
    }
    res.status(201).json({ url });
  },
);

// Хэт том файлын алдааг ойлгомжтой болгох
// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  if (err.type === "entity.too.large") {
    return res
      .status(413)
      .json({ error: `Зураг ${MAX_IMAGE_BYTES / 1024 / 1024}MB-аас бага байх ёстой` });
  }
  next(err);
});

export default router;
