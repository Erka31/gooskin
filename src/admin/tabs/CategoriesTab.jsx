import { useState } from "react";
import useLoad from "../useLoad";
import { api } from "../../lib/api";
import { TONES } from "../../constants";

const EMPTY = {
  name: "",
  emoji: "✨",
  tone: "rose",
  tagline: "",
  active: true,
};
const QUICK = [
  "🧴",
  "🫧",
  "🧖",
  "☀️",
  "👁️",
  "💄",
  "💇",
  "🛁",
  "💅",
  "🌸",
  "🧔",
  "🪥",
  "🎁",
  "🌿",
  "💧",
  "✨",
];

// Ангилал нэмэх / засах форм
function CategoryForm({ initial, onCancel, onSaved }) {
  const [f, setF] = useState(initial);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) =>
    setF({
      ...f,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });

  const save = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      if (f.id)
        await api("/admin/categories/" + f.id, { method: "PUT", body: f });
      else
        await api("/admin/categories", {
          method: "POST",
          body: { ...f, sort: 999 },
        });
      onSaved(f.id ? "Ангилал шинэчлэгдлээ" : "Ангилал нэмэгдлээ");
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="cat-form" onSubmit={save}>
      <div className={"cat-preview tone-" + f.tone}>
        <span>{f.emoji || "✨"}</span>
        <b>{f.name || "Ангиллын нэр"}</b>
        <small>{f.tagline || "Товч тайлбар"}</small>
      </div>
      <div className="cat-fields">
        <div className="ed-row">
          <label className="ed-field">
            <span>Нэр *</span>
            <input
              required
              maxLength={40}
              value={f.name}
              onChange={set("name")}
              placeholder="Жишээ: Үс арчилгаа"
            />
          </label>
          <label className="ed-field">
            <span>Товч тайлбар</span>
            <input
              maxLength={80}
              value={f.tagline}
              onChange={set("tagline")}
              placeholder="Шампунь, тос, маск"
            />
          </label>
        </div>
        <div className="ed-field">
          <span>Дүрс</span>
          <div className="emoji-pick">
            {QUICK.map((em) => (
              <button
                type="button"
                key={em}
                className={f.emoji === em ? "on" : ""}
                onClick={() => setF({ ...f, emoji: em })}
              >
                {em}
              </button>
            ))}
            <input
              value={f.emoji}
              maxLength={8}
              onChange={set("emoji")}
              aria-label="Өөр emoji"
            />
          </div>
        </div>
        <div className="ed-field">
          <span>Өнгө</span>
          <div className="tone-pick">
            {TONES.map(([id, label]) => (
              <button
                type="button"
                key={id}
                title={label}
                className={"tone-" + id + (f.tone === id ? " on" : "")}
                onClick={() => setF({ ...f, tone: id })}
              />
            ))}
          </div>
        </div>
        <label className="switch-row">
          <input type="checkbox" checked={f.active} onChange={set("active")} />
          <span className="sw" />
          <span>
            <b>Дэлгүүрт харуулах</b>
          </span>
        </label>
        {err && <p className="error">{err}</p>}
        <div className="pform-actions">
          <button className="primary add-btn" disabled={busy}>
            {f.id ? "Хадгалах" : "Нэмэх"}
          </button>
          <button type="button" className="small-btn lg" onClick={onCancel}>
            Болих
          </button>
        </div>
      </div>
    </form>
  );
}

export default function CategoriesTab() {
  const [rows, error, load] = useLoad("/admin/categories");
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const done = (m) => {
    setForm(null);
    setErr("");
    setMsg(m);
    load();
  };

  // Дээш/доош зөөж бүх ангиллын дарааллыг хадгалах
  const move = async (i, d) => {
    const list = [...rows];
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    try {
      await Promise.all(
        list.map((c, k) =>
          c.sort === k
            ? null
            : api("/admin/categories/" + c.id, {
                method: "PUT",
                body: { ...c, sort: k },
              }),
        ),
      );
      load();
    } catch (e) {
      setErr(e.message);
    }
  };

  const toggle = async (c) => {
    await api("/admin/categories/" + c.id, {
      method: "PUT",
      body: { ...c, active: !c.active },
    }).catch((e) => setErr(e.message));
    load();
  };

  const remove = async (c) => {
    if (!window.confirm(`"${c.name}" ангиллыг устгах уу?`)) return;
    try {
      await api("/admin/categories/" + c.id, { method: "DELETE" });
      done("Ангилал устгагдлаа");
    } catch (e) {
      setMsg("");
      setErr(e.message);
    }
  };

  if (error) return <p className="error">{error}</p>;
  if (!rows) return <p className="empty">Ачаалж байна...</p>;

  return (
    <>
      <div className="toolbar">
        <h3>Ангилал ({rows.length})</h3>
        {!form && (
          <button
            className="primary add-btn"
            onClick={() => setForm({ ...EMPTY })}
          >
            + Шинэ ангилал
          </button>
        )}
      </div>
      {msg && <p className="note">{msg}</p>}
      {err && <p className="error">{err}</p>}
      {form && (
        <CategoryForm
          key={form.id || "new"}
          initial={form}
          onCancel={() => setForm(null)}
          onSaved={done}
        />
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Дараалал</th>
              <th>Ангилал</th>
              <th>Бараа</th>
              <th>Дэлгүүрт</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c, i) => (
              <tr key={c.id} className={c.active ? "" : "off"}>
                <td>
                  <div className="order-btns">
                    <button
                      className="small-btn"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label="Дээш"
                    >
                      ↑
                    </button>
                    <button
                      className="small-btn"
                      onClick={() => move(i, 1)}
                      disabled={i === rows.length - 1}
                      aria-label="Доош"
                    >
                      ↓
                    </button>
                  </div>
                </td>
                <td>
                  <div className="cat-cell">
                    <span className={"cat-dot tone-" + c.tone}>{c.emoji}</span>
                    <span>
                      <b>{c.name}</b>
                      <small>{c.tagline}</small>
                    </span>
                  </div>
                </td>
                <td>{c.products}</td>
                <td>
                  <label className="switch-row compact">
                    <input
                      type="checkbox"
                      checked={Boolean(c.active)}
                      onChange={() => toggle(c)}
                    />
                    <span className="sw" />
                  </label>
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      className="small-btn"
                      onClick={() =>
                        setForm({ ...c, active: Boolean(c.active) })
                      }
                    >
                      Засах
                    </button>
                    <button
                      className="small-btn danger"
                      onClick={() => remove(c)}
                      disabled={c.products > 0}
                      title={
                        c.products > 0
                          ? "Бараатай ангиллыг устгах боломжгүй"
                          : ""
                      }
                    >
                      Устгах
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
