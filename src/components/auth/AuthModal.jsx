import { useState } from "react";
import Modal from "../common/Modal";
import { api } from "../../lib/api";

// Нууц үг сэргээх хүсэлт (имэйлээр холбоос ирнэ)
function ForgotForm({ onBack }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await api("/auth/forgot", { method: "POST", body: { email } });
      setMsg(r.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h3>Нууц үг сэргээх</h3>
      {msg ? (
        <p className="ok big">{msg}</p>
      ) : (
        <form onSubmit={submit} className="auth-form">
          <p className="hint">
            Бүртгэлтэй и-мэйлээ оруулна уу. Нууц үг шинэчлэх холбоос илгээнэ.
          </p>
          <input
            required
            type="email"
            placeholder="И-мэйл"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <p className="error">{error}</p>}
          <button className="primary" disabled={busy}>
            {busy ? "Илгээж байна..." : "Холбоос илгээх"}
          </button>
        </form>
      )}
      <p className="switch">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onBack();
          }}
        >
          ← Нэвтрэх рүү буцах
        </a>
      </p>
    </>
  );
}

export default function AuthModal({ mode, setMode, onClose, onDone }) {
  const isLogin = mode === "login";
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await api(isLogin ? "/auth/login" : "/auth/signup", {
        method: "POST",
        body: form,
      });
      onDone(res.user || res);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (mode === "forgot") {
    return (
      <Modal onClose={onClose}>
        <ForgotForm onBack={() => setMode("login")} />
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <h3>{isLogin ? "Нэвтрэх" : "Бүртгүүлэх"}</h3>
      <form onSubmit={submit} className="auth-form">
        {!isLogin && (
          <input
            required
            placeholder="Нэр"
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        )}
        <input
          required
          type="email"
          placeholder="И-мэйл"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        {!isLogin && (
          <input
            type="tel"
            placeholder="Утасны дугаар (заавал биш)"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        )}
        <input
          required
          type="password"
          minLength={isLogin ? undefined : 6}
          autoComplete={isLogin ? "current-password" : "new-password"}
          placeholder={isLogin ? "Нууц үг" : "Нууц үг (6+ тэмдэгт)"}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {isLogin && (
          <a
            href="#"
            className="forgot-link"
            onClick={(e) => {
              e.preventDefault();
              setMode("forgot");
            }}
          >
            Нууц үгээ мартсан уу?
          </a>
        )}
        {error && <p className="error">{error}</p>}
        <button className="primary" disabled={busy}>
          {busy ? "Түр хүлээнэ үү..." : isLogin ? "Нэвтрэх" : "Бүртгүүлэх"}
        </button>
      </form>
      <p className="switch">
        {isLogin ? "Бүртгэлгүй юу? " : "Бүртгэлтэй юу? "}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setError("");
            setMode(isLogin ? "signup" : "login");
          }}
        >
          {isLogin ? "Бүртгүүлэх" : "Нэвтрэх"}
        </a>
      </p>
    </Modal>
  );
}
