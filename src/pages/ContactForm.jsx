import { useState } from "react";
import { api } from "../lib/api";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/contact", { method: "POST", body: form });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (sent)
    return (
      <p className="ok big">
        Баярлалаа! Таны мессежийг хүлээн авлаа. Бид удахгүй хариу өгнө ✅
      </p>
    );

  return (
    <form className="auth-form contact-form" onSubmit={submit}>
      <input
        required
        placeholder="Нэр"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        required
        type="email"
        placeholder="И-мэйл"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <textarea
        required
        rows={5}
        placeholder="Мессеж"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
      />
      {error && <p className="error">{error}</p>}
      <button className="primary" disabled={busy}>
        {busy ? "Илгээж байна..." : "Илгээх"}
      </button>
    </form>
  );
}
