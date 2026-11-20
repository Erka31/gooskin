import { useState, useEffect } from "react";
import ImageUploader from "./ImageUploader";
import { api, money } from "../../lib/api";

const EMOJIS = [
  "🧴",
  "💧",
  "🧼",
  "🫧",
  "☀️",
  "💄",
  "👁️",
  "🧖",
  "🌿",
  "🪥",
  "💅",
  "🌸",
  "🎁",
  "🧔",
  "🛁",
  "💇",
];

const toForm = (p, cats) => ({
  brand: p?.brand || "",
  name: p?.name || "",
  cat: p?.cat || cats[0]?.name || "",
  emoji: p?.emoji || "🧴",
  price: p?.price ?? "",
  old: p && p.old > p.price ? p.old : "",
  stock: p?.stock ?? 20,
  description: p?.description || "",
  active: p ? Boolean(p.active) : true,
  images: p?.images || [],
});

// Бараа нэмэх / засах цонх (зүүн талд форм, баруун талд урьдчилан харах)
export default function ProductEditor({
  product,
  categories,
  onClose,
  onSaved,
}) {
  const isNew = !product?.id;
  const [initial] = useState(() => toForm(product, categories));
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const tryClose = () => {
    if (!dirty || window.confirm("Хадгалаагүй өөрчлөлт байна. Хаах уу?")) {
      onClose();
    }
  };

  useEffect(() => {
    const f = (e) => e.key === "Escape" && tryClose();
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  });

  const price = Number(form.price) || 0;
  const old = Number(form.old) || 0;
  const discount =
    old > price && price > 0 ? Math.round((1 - price / old) * 100) : 0;

  const save = async (e) => {
    e.preventDefault();
    setError("");
    if (form.old !== "" && old < price) {
      setError(
        "Хуучин үнэ нь одоогийн үнээс их байх ёстой (эсвэл хоосон орхино уу)",
      );
      return;
    }
    setSaving(true);
    const body = {
      ...form,
      brand: form.brand.trim(),
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      old: form.old === "" ? price : old,
      stock: Number(form.stock) || 0,
    };
    try {
      if (isNew) await api("/admin/products", { method: "POST", body });
      else await api("/admin/products/" + product.id, { method: "PUT", body });
      onSaved(isNew ? "Бүтээгдэхүүн нэмэгдлээ" : "Өөрчлөлт хадгалагдлаа");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="ad-modal-bg"
      onMouseDown={(e) => e.target === e.currentTarget && tryClose()}
    >
      <form className="ad-modal editor" onSubmit={save}>
        <header className="ad-modal-head">
          <div>
            <small>
              {isNew ? "Шинэ бүтээгдэхүүн" : `#${product.id} засах`}
            </small>
            <h3>{form.name || "Нэргүй бүтээгдэхүүн"}</h3>
          </div>
          <button
            type="button"
            className="x-btn"
            onClick={tryClose}
            aria-label="Хаах"
          >
            ✕
          </button>
        </header>

        <div className="editor-body">
          <div className="editor-main">
            <section className="ed-sec">
              <h4>Зураг</h4>
              <ImageUploader
                images={form.images}
                onChange={(images) => setForm((f) => ({ ...f, images }))}
                onAdd={(url) =>
                  setForm((f) => ({ ...f, images: [...f.images, url] }))
                }
              />
            </section>

            <section className="ed-sec">
              <h4>Үндсэн мэдээлэл</h4>
              <label className="ed-field">
                <span>Бүтээгдэхүүний нэр *</span>
                <input
                  required
                  maxLength={120}
                  value={form.name}
                  onChange={set("name")}
                  placeholder="Жишээ: Hyaluronic чийгшүүлэгч серум"
                />
              </label>
              <div className="ed-row">
                <label className="ed-field">
                  <span>Брэнд *</span>
                  <input
                    required
                    maxLength={60}
                    value={form.brand}
                    onChange={set("brand")}
                    placeholder="Жишээ: COSRX"
                  />
                </label>
                <label className="ed-field">
                  <span>Ангилал *</span>
                  <select value={form.cat} onChange={set("cat")}>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.emoji} {c.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="ed-field">
                <span>
                  Тайлбар <em>{form.description.length}/2000</em>
                </span>
                <textarea
                  rows={5}
                  maxLength={2000}
                  value={form.description}
                  onChange={set("description")}
                  placeholder="Найрлага, хэрэглэх заавар, арьсны төрөл..."
                />
              </label>
              <div className="ed-field">
                <span>Зураггүй үед харагдах emoji</span>
                <div className="emoji-pick">
                  {EMOJIS.map((em) => (
                    <button
                      type="button"
                      key={em}
                      className={form.emoji === em ? "on" : ""}
                      onClick={() => setForm((f) => ({ ...f, emoji: em }))}
                    >
                      {em}
                    </button>
                  ))}
                  <input
                    value={form.emoji}
                    maxLength={8}
                    onChange={set("emoji")}
                    aria-label="Өөр emoji"
                  />
                </div>
              </div>
            </section>

            <section className="ed-sec">
              <h4>Үнэ ба нөөц</h4>
              <div className="ed-row three">
                <label className="ed-field">
                  <span>Зарах үнэ (₮) *</span>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.price}
                    onChange={set("price")}
                  />
                </label>
                <label className="ed-field">
                  <span>Хямдралын өмнөх үнэ (₮)</span>
                  <input
                    type="number"
                    min="0"
                    value={form.old}
                    onChange={set("old")}
                    placeholder="Хямдралгүй бол хоосон"
                  />
                </label>
                <label className="ed-field">
                  <span>Нөөц (ширхэг) *</span>
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={set("stock")}
                  />
                </label>
              </div>
              {discount > 0 && (
                <p className="ed-note ok">
                  −{discount}% хямдрал · худалдан авагч {money(old - price)}{" "}
                  хэмнэнэ
                </p>
              )}
              {Number(form.stock) === 0 && (
                <p className="ed-note warn">
                  Нөөц 0 бол дэлгүүрт “Дууссан” гэж харагдана
                </p>
              )}
              <label className="switch-row">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={set("active")}
                />
                <span className="sw" />
                <span>
                  <b>Дэлгүүрт харуулах</b>
                  <small>Унтраавал зөвхөн админд харагдана</small>
                </span>
              </label>
            </section>
          </div>

          <aside className="editor-side">
            <small className="side-label">Дэлгүүрт ингэж харагдана</small>
            <div className="preview-card">
              <div className="pv-media">
                {discount > 0 && <span className="pv-tag">-{discount}%</span>}
                {form.images[0] ? (
                  <img src={form.images[0]} alt="" />
                ) : (
                  <span className="pv-emoji">{form.emoji}</span>
                )}
              </div>
              <small className="pv-brand">{form.brand || "БРЭНД"}</small>
              <b className="pv-name">{form.name || "Бүтээгдэхүүний нэр"}</b>
              <div className="pv-price">
                <b>{money(price)}</b>
                {discount > 0 && <s>{money(old)}</s>}
              </div>
            </div>
            <ul className="side-facts">
              <li>
                <span>Ангилал</span>
                <b>{form.cat || "—"}</b>
              </li>
              <li>
                <span>Зураг</span>
                <b>{form.images.length} / 6</b>
              </li>
              <li>
                <span>Төлөв</span>
                <b className={form.active ? "c-ok" : "c-muted"}>
                  {form.active ? "Харагдана" : "Нуугдсан"}
                </b>
              </li>
            </ul>
          </aside>
        </div>

        <footer className="ad-modal-foot">
          {error && <p className="error">{error}</p>}
          <span className="grow" />
          <button type="button" className="small-btn lg" onClick={tryClose}>
            Болих
          </button>
          <button className="primary" disabled={saving}>
            {saving
              ? "Хадгалж байна..."
              : isNew
                ? "Бүтээгдэхүүн нэмэх"
                : "Хадгалах"}
          </button>
        </footer>
      </form>
    </div>
  );
}
