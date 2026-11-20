import { useState } from "react";
import { api } from "../lib/api";
import { goShop } from "./goShop";

export default function AdminLogin({ me, onDone }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await api("/admin/login", { method: "POST", body: form });
      const user = res?.user || res;
      if (!user || user.role !== "admin") {
        setError("Админ эрхгүй хэрэглэгч байна.");
      } else {
        onDone(user);
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setError(err?.message || err?.error || "Нэвтрэхэд алдаа гарлаа");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-wrap">
      <div className="admin-login-page">
        <form className="admin-card" onSubmit={submit}>
          <h2>🔐 Админ нэвтрэх</h2>
          {me && (
            <p className="hint">
              Та энгийн хэрэглэгчээр нэвтэрсэн байна. Админ эрхээр нэвтэрнэ үү.
            </p>
          )}
          <input
            required
            type="email"
            placeholder="Админ и-мэйл"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            required
            type="password"
            placeholder="Нууц үг"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <p className="error">{error}</p>}
          <button className="primary" disabled={busy}>
            {busy ? "Түр хүлээнэ үү..." : "Нэвтрэх"}
          </button>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              goShop();
            }}
          >
            ← Дэлгүүр рүү буцах
          </a>
        </form>
      </div>
    </div>
  );
}
