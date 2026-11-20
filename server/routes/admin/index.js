// /api/admin — админ нэвтрэлт + бусад бүх админ route (requireAdmin-аар хамгаалагдсан)
import { Router } from "express";
import { loginHandler } from "../auth.js";
import { requireAdmin } from "../../middleware/auth.js";
import stats from "./stats.js";
import orders from "./orders.js";
import products from "./products.js";
import users from "./users.js";
import messages from "./messages.js";
import categories from "./categories.js";
import uploads from "./uploads.js";
import system from "./system.js";
import { rateLimit } from "../../middleware/rateLimit.js";

const router = Router();

router.post(
  "/login",
  rateLimit({ name: "admin-login", max: 30 }),
  loginHandler(true),
);

router.use(requireAdmin);
router.use("/stats", stats);
router.use("/orders", orders);
router.use("/products", products);
router.use("/", users); // /users, /subscribers
router.use("/messages", messages);
router.use("/categories", categories);
router.use("/upload", uploads);
router.use("/system", system);

export default router;
