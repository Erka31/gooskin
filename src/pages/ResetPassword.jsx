import { useState } from "react";
import Link from "../components/common/Link";
import { api } from "../lib/api";
import { navigate } from "../lib/router";

// /reset-password?token=... — имэйлээр ирсэн холбоосоор шинэ нууц үг тавих
export default function ResetPassword({ token, onDone }) {
  const [pw, setPw] = useState({ a: "", b: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (pw.a !== pw.b) {
      setError("Хоёр нууц үг таарахгүй байна");
      return;
    }
    setBusy(true);
    try {
      const r = await api("/auth/reset", {
        method: "POST",
        body: { token, password: pw.a },
      });
      onDone(r.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page">
      <div className="page-hero">
        <nav className="crumbs">
          <Link to="/">Нүүр</Link> <span>/</span> Нууц үг сэргээх
        </nav>
        <h1>Шинэ нууц үг</h1>
      </div>
      <div className="page-body narrow">
        {!token ? (
          <p className="error">
            Холбоос буруу байна. Нэвтрэх цонхны “Нууц үгээ мартсан уу?” хэсгээс
            дахин хүсэлт илгээнэ үү.
          </p>
        ) : (
          <form className="auth-form contact-form" onSubmit={submit}>
            <input
              required
              type="password"
              minLength={6}
              autoComplete="new-password"
              placeholder="Шинэ нууц үг (6+ тэмдэгт)"
              value={pw.a}
              onChange={(e) => setPw({ ...pw, a: e.target.value })}
            />
            <input
              required
              type="password"
              minLength={6}
              autoComplete="new-password"
              placeholder="Шинэ нууц үг давтах"
              value={pw.b}
              onChange={(e) => setPw({ ...pw, b: e.target.value })}
            />
            {error && <p className="error">{error}</p>}
            <button className="primary" disabled={busy}>
              {busy ? "Хадгалж байна..." : "Нууц үг хадгалах"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
