// GET /api/admin/stats — самбарын тоон үзүүлэлт
import { Router } from "express";
import db from "../../db/index.js";

const router = Router();

router.get("/", (req, res) => {
  const one = (sql) => db.prepare(sql).get().n;
  res.json({
    orders: one("SELECT COUNT(*) AS n FROM orders"),
    newOrders: one("SELECT COUNT(*) AS n FROM orders WHERE status = 'Шинэ'"),
    revenue: one(
      "SELECT COALESCE(SUM(total), 0) AS n FROM orders WHERE status != 'Цуцлагдсан'",
    ),
    customers: one("SELECT COUNT(*) AS n FROM users WHERE role = 'customer'"),
    products: one("SELECT COUNT(*) AS n FROM products WHERE active = 1"),
    lowStock: one(
      "SELECT COUNT(*) AS n FROM products WHERE active = 1 AND stock <= 5",
    ),
    subscribers: one("SELECT COUNT(*) AS n FROM subscribers"),
    unpaid: one(
      "SELECT COUNT(*) AS n FROM orders WHERE paid = 0 AND status != 'Цуцлагдсан'",
    ),
    newMessages: one("SELECT COUNT(*) AS n FROM messages WHERE done = 0"),
    top: db
      .prepare(
        `SELECT oi.product_name AS name, SUM(oi.qty) AS qty, SUM(oi.qty * oi.price) AS sum
         FROM order_items oi JOIN orders o ON o.id = oi.order_id
         WHERE o.status != 'Цуцлагдсан'
         GROUP BY oi.product_id ORDER BY qty DESC LIMIT 5`,
      )
      .all(),
  });
});

export default router;
