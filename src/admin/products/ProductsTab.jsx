import { useState } from "react";
import useLoad from "../useLoad";
import ProductEditor from "./ProductEditor";
import StockControl from "./StockControl";
import { api, money } from "../../lib/api";

const FILTERS = [
  ["all", "Бүгд", () => true],
  ["active", "Харагдаж буй", (p) => p.active],
  ["hidden", "Нуугдсан", (p) => !p.active],
  ["low", "Нөөц багатай", (p) => p.stock > 0 && p.stock <= 5],
  ["out", "Дууссан", (p) => p.stock <= 0],
  ["noimg", "Зураггүй", (p) => !p.images?.length],
];

export default function ProductsTab() {
  const [rows, error, load] = useLoad("/admin/products");
  const [cats] = useLoad("/admin/categories");
  const [editing, setEditing] = useState(null); // null | {} (шинэ) | product
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [filter, setFilter] = useState("all");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const flash = (m) => {
    setErr("");
    setMsg(m);
    setTimeout(() => setMsg(""), 3000);
  };
  const fail = (m) => {
    setMsg("");
    setErr(m);
  };

  const toggle = async (p) => {
    try {
      await api("/admin/products/" + p.id, {
        method: "PATCH",
        body: { active: !p.active },
      });
      load();
    } catch (e) {
      fail(e.message);
    }
  };

  const duplicate = async (p) => {
    try {
      await api(`/admin/products/${p.id}/duplicate`, { method: "POST" });
      flash(`"${p.name}"-ийн хуулбар үүслээ (нуугдсан төлөвтэй)`);
      load();
    } catch (e) {
      fail(e.message);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`"${p.name}" бүтээгдэхүүнийг устгах уу?`)) return;
    try {
      const r = await api("/admin/products/" + p.id, { method: "DELETE" });
      flash(
        r?.hidden
          ? "Захиалгад орсон тул устгаагүй, зөвхөн нуулаа"
          : "Бүтээгдэхүүн устгагдлаа",
      );
      load();
    } catch (e) {
      fail(e.message);
    }
  };

  if (error) return <p className="error">{error}</p>;
  if (!rows || !cats) return <p className="empty">Ачаалж байна...</p>;

  const needle = q.trim().toLowerCase();
  const test = FILTERS.find(([id]) => id === filter)[2];
  const list = rows.filter(
    (p) =>
      test(p) &&
      (!cat || p.cat === cat) &&
      (!needle ||
        `${p.name} ${p.brand} #${p.id}`.toLowerCase().includes(needle)),
  );

  return (
    <>
      <div className="toolbar">
        <h3>Бүтээгдэхүүн ({list.length})</h3>
        <input
          className="search-input"
          placeholder="Нэр, брэнд, №..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">Бүх ангилал</option>
          {cats.map((c) => (
            <option key={c.id} value={c.name}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>
        <button
          className="primary add-btn"
          onClick={() => setEditing({})}
          disabled={cats.length === 0}
        >
          + Шинэ бүтээгдэхүүн
        </button>
      </div>

      <div className="chips">
        {FILTERS.map(([id, label, fn]) => (
          <button
            key={id}
            className={filter === id ? "on" : ""}
            onClick={() => setFilter(id)}
          >
            {label} <em>{rows.filter(fn).length}</em>
          </button>
        ))}
      </div>

      {msg && <p className="note">{msg}</p>}
      {err && <p className="error">{err}</p>}

      {list.length === 0 ? (
        <p className="empty">Бүтээгдэхүүн олдсонгүй</p>
      ) : (
        <div className="table-wrap">
          <table className="prod-table">
            <thead>
              <tr>
                <th>Бүтээгдэхүүн</th>
                <th>Ангилал</th>
                <th>Үнэ</th>
                <th>Нөөц</th>
                <th>Дэлгүүрт</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className={p.active ? "" : "off"}>
                  <td>
                    <button
                      className="prod-cell"
                      onClick={() => setEditing(p)}
                      title="Засах"
                    >
                      <span className="thumb">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" />
                        ) : (
                          p.emoji
                        )}
                        {p.images?.length > 1 && <em>{p.images.length}</em>}
                      </span>
                      <span>
                        <b>{p.name}</b>
                        <small>
                          {p.brand} · #{p.id}
                        </small>
                      </span>
                    </button>
                  </td>
                  <td>{p.cat}</td>
                  <td>
                    <b>{money(p.price)}</b>
                    {p.old > p.price && (
                      <small className="was">
                        <s>{money(p.old)}</s> −
                        {Math.round((1 - p.price / p.old) * 100)}%
                      </small>
                    )}
                  </td>
                  <td>
                    <StockControl
                      key={p.id + ":" + p.stock}
                      product={p}
                      onSaved={load}
                      onError={fail}
                    />
                  </td>
                  <td>
                    <label
                      className="switch-row compact"
                      title={p.active ? "Нуух" : "Харуулах"}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(p.active)}
                        onChange={() => toggle(p)}
                      />
                      <span className="sw" />
                    </label>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="small-btn"
                        onClick={() => setEditing(p)}
                      >
                        Засах
                      </button>
                      <button
                        className="small-btn"
                        onClick={() => duplicate(p)}
                        title="Хуулбар үүсгэх"
                      >
                        Хуулбар
                      </button>
                      <button
                        className="small-btn danger"
                        onClick={() => remove(p)}
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
      )}

      {editing && (
        <ProductEditor
          product={editing.id ? editing : null}
          categories={cats}
          onClose={() => setEditing(null)}
          onSaved={(m) => {
            setEditing(null);
            flash(m);
            load();
          }}
        />
      )}
    </>
  );
}
