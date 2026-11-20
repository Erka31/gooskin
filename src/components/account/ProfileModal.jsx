import { useState } from "react";
import Modal from "../common/Modal";
import { api } from "../../lib/api";

export default function ProfileModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: user.name || "",
    phone: user.phone || "",
  });
  const [pw, setPw] = useState({ current: "", next: "" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");

  const save = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      const u = await api("/my/profile", { method: "PUT", body: form });
      onSaved(u);
      setMsg("Мэдээлэл хадгалагдлаа ✅");
    } catch (err) {
      setError(err.message);
    }
  };

  const changePw = async (e) => {
    e.preventDefault();
    setPwMsg("");
    setPwError("");
    try {
      await api("/my/password", { method: "PUT", body: pw });
      setPw({ current: "", next: "" });
      setPwMsg("Нууц үг солигдлоо ✅");
    } catch (err) {
      setPwError(err.message);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h3>Миний мэдээлэл</h3>
      <form className="auth-form" onSubmit={save}>
        <label className="lbl">И-мэйл</label>
        <input value={user.email} disabled />
        <label className="lbl">Нэр</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <label className="lbl">Утас</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        {error && <p className="error">{error}</p>}
        {msg && <p className="ok">{msg}</p>}
        <button className="primary">Хадгалах</button>
      </form>
      <h4 className="sub-h">Нууц үг солих</h4>
      <form className="auth-form" onSubmit={changePw}>
        <input
          required
          type="password"
          autoComplete="current-password"
          placeholder="Одоогийн нууц үг"
          value={pw.current}
          onChange={(e) => setPw({ ...pw, current: e.target.value })}
        />
        <input
          required
          type="password"
          minLength={6}
          autoComplete="new-password"
          placeholder="Шинэ нууц үг (6+ тэмдэгт)"
          value={pw.next}
          onChange={(e) => setPw({ ...pw, next: e.target.value })}
        />
        {pwError && <p className="error">{pwError}</p>}
        {pwMsg && <p className="ok">{pwMsg}</p>}
        <button className="primary">Нууц үг солих</button>
      </form>
    </Modal>
  );
}
