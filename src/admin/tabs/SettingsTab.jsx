import { useState } from "react";
import useLoad from "../useLoad";
import { api } from "../../lib/api";

// Тохиргооны мөр: ✓ бэлэн / ✕ дутуу + яаж засах
function Check({ ok, label, hint }) {
  return (
    <li className={"chk " + (ok ? "ok" : "bad")}>
      <span className="chk-ic">{ok ? "✓" : "!"}</span>
      <span>
        <b>{label}</b>
        {!ok && hint && <small>{hint}</small>}
      </span>
    </li>
  );
}

function ChangePassword() {
  const [f, setF] = useState({ current: "", next: "", again: "" });
  const [show, setShow] = useState(false); // нууц үгийг ил харуулах эсэх
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    if (f.next !== f.again) return setErr("Шинэ нууц үг таарахгүй байна");
    if (f.next.length < 10)
      return setErr("Админы нууц үг 10-аас дээш тэмдэгт байна");
    try {
      await api("/my/password", {
        method: "PUT",
        body: { current: f.current, next: f.next },
      });
      setF({ current: "", next: "", again: "" });
      setShow(false);
      setMsg(
        "Нууц үг солигдлоо. Бусад төхөөрөмж дээрх нэвтрэлт хүчингүй боллоо.",
      );
    } catch (e2) {
      setErr(e2.message);
    }
  };

  const field = (k, ph, ac) => (
    <label className="ed-field">
      <span>{ph}</span>
      <input
        required
        type={show ? "text" : "password"}
        autoComplete={ac}
        value={f[k]}
        onChange={(e) => setF({ ...f, [k]: e.target.value })}
      />
    </label>
  );

  return (
    <form className="ed-sec" onSubmit={submit}>
      <h4>Админы нууц үг солих</h4>
      {field("current", "Одоогийн нууц үг", "current-password")}
      <div className="ed-row">
        {field("next", "Шинэ нууц үг (10+ тэмдэгт)", "new-password")}
        {field("again", "Шинэ нууц үг давтах", "new-password")}
      </div>
      <button
        type="button"
        className="show-pw"
        onClick={() => setShow((v) => !v)}
        aria-pressed={show}
      >
        {show ? "🙈 Нууц үг нуух" : "👁 Нууц үг харуулах"}
      </button>
      {err && <p className="error">{err}</p>}
      {msg && <p className="note">{msg}</p>}
      <div>
        <button className="primary add-btn">Солих</button>
      </div>
    </form>
  );
}

export default function SettingsTab() {
  const [s, error, load] = useLoad("/admin/system");
  const [busy, setBusy] = useState("");
  const [out, setOut] = useState("");

  const backup = async () => {
    setBusy("backup");
    try {
      const r = await api("/admin/system/backup", { method: "POST" });
      setOut(`Backup хийгдлээ: ${r.name}`);
      load();
    } catch (e) {
      setOut(e.message);
    } finally {
      setBusy("");
    }
  };

  const testNotify = async () => {
    setBusy("notify");
    try {
      const r = await api("/admin/system/test-notify", { method: "POST" });
      const fmt = (v) =>
        v === true
          ? "✓ ажиллаж байна"
          : v === false
            ? "тохируулаагүй"
            : "алдаа: " + v;
      setOut(`Telegram: ${fmt(r.telegram)} · Имэйл: ${fmt(r.mail)}`);
    } catch (e) {
      setOut(e.message);
    } finally {
      setBusy("");
    }
  };

  if (error) return <p className="error">{error}</p>;
  if (!s) return <p className="empty">Ачаалж байна...</p>;

  return (
    <>
      <h3>Тохиргоо</h3>
      <div className="settings-grid">
        <section className="ed-sec">
          <h4>Ажиллагаанд бэлэн эсэх</h4>
          <ul className="chk-list">
            <Check
              ok={s.production}
              label="Production горим"
              hint="NODE_ENV=production (npm start)"
            />
            <Check
              ok={s.https}
              label="HTTPS / Secure cookie"
              hint="Домэйн + SSL тохируулаад COOKIE_SECURE=true"
            />
            <Check
              ok={s.jwtSecretOk}
              label="Нууц түлхүүр (JWT_SECRET)"
              hint=".env-д 32+ тэмдэгттэй санамсаргүй утга"
            />
            <Check
              ok={!s.publicUrl.includes("localhost")}
              label={`Сайтын хаяг: ${s.publicUrl}`}
              hint="PUBLIC_URL=https://таны-домэйн.mn"
            />
            <Check
              ok={s.telegram}
              label="Telegram мэдэгдэл"
              hint="TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID"
            />
            <Check
              ok={s.mail}
              label="Имэйл (нууц үг сэргээх)"
              hint="SMTP_HOST, SMTP_USER, SMTP_PASS"
            />
            <Check
              ok={s.qpay && !s.qpaySandbox}
              label={
                s.qpaySandbox ? "QPay (туршилтын орчин)" : "QPay автомат төлбөр"
              }
              hint={
                s.qpaySandbox
                  ? "QPAY_BASE_URL-ийг жинхэнэ хаяг руу солино"
                  : "QPay merchant гэрээ → QPAY_USERNAME, QPAY_PASSWORD, QPAY_INVOICE_CODE"
              }
            />
            <Check
              ok={s.backupEveryHours > 0}
              label={
                s.backupEveryHours > 0
                  ? `Автомат backup: ${s.backupEveryHours} цаг тутам`
                  : "Автомат backup"
              }
              hint="BACKUP_INTERVAL_HOURS=24"
            />
          </ul>
          <p className="up-hint">
            Тохиргоог серверийн <code>.env</code> файлд хийгээд серверээ дахин
            асаана. Жишээ: <code>.env.example</code>
          </p>
        </section>

        <section className="ed-sec">
          <h4>Нөөц хуулбар (backup)</h4>
          <p className="up-hint">Database болон бүх зургийг хуулна.</p>
          <ul className="backup-list">
            {s.backups.length === 0 ? (
              <li>Одоогоор backup байхгүй</li>
            ) : (
              s.backups.map((b) => <li key={b}>{b}</li>)
            )}
          </ul>
          <div className="pform-actions">
            <button
              className="primary add-btn"
              onClick={backup}
              disabled={busy === "backup"}
            >
              {busy === "backup" ? "Хийж байна..." : "Одоо backup хийх"}
            </button>
            <button
              className="small-btn lg"
              onClick={testNotify}
              disabled={busy === "notify"}
            >
              Мэдэгдэл турших
            </button>
          </div>
          {out && <p className="note">{out}</p>}
          <p className="up-hint">
            Node {s.node} · ажилласан {Math.floor(s.uptime / 3600)}ц{" "}
            {Math.floor((s.uptime % 3600) / 60)}мин
          </p>
        </section>
      </div>
      <ChangePassword />
    </>
  );
}
