import ProductCard from "./ProductCard";
import CategoryStrip from "./CategoryStrip";
import Icon from "../common/Icon";
import { SORTS } from "../../lib/products";

export default function ProductGrid({
  list,
  loading,
  error,
  sort,
  setSort,
  onAdd,
  onOpen,
  title,
  onReset,
  cat,
  setCat,
  total,
  hasQuery,
}) {
  return (
    <section id="products" className="section">
      <div className="section-head">
        <div className="section-title left">
          <span className="kicker">Дэлгүүр</span>
          <h2>
            {title} <small className="count">{list.length}</small>
          </h2>
        </div>
        <label className="sort">
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <Icon name="chevronDown" size={16} />
        </label>
      </div>

      <CategoryStrip cat={cat} setCat={setCat} total={total} />

      {loading ? (
        <div className="grid">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="card skeleton" />
          ))}
        </div>
      ) : error ? (
        <div className="empty-state">
          <span>⚠️</span>
          <p className="error">{error}</p>
        </div>
      ) : list.length === 0 ? (
        <div className="empty-state">
          {hasQuery ? (
            <>
              <span>🔍</span>
              <b>Илэрц олдсонгүй</b>
              <p>Өөр үгээр хайх эсвэл шүүлтүүрээ арилгаад үзээрэй.</p>
            </>
          ) : (
            <>
              <span>🌱</span>
              <b>Удахгүй нэмэгдэнэ</b>
              <p>Энэ ангилалд бүтээгдэхүүн удахгүй нэмэгдэнэ.</p>
            </>
          )}
          <button className="btn-ghost" onClick={onReset}>
            Бүх бүтээгдэхүүн үзэх
          </button>
        </div>
      ) : (
        <div className="grid">
          {list.map((p) => (
            <ProductCard key={p.id} p={p} onAdd={onAdd} onOpen={onOpen} />
          ))}
        </div>
      )}
    </section>
  );
}
