import Icon from "../common/Icon";
import { money } from "../../lib/api";
import { discountOf } from "../../lib/products";
import ProductImage from "../common/ProductImage";
import { useTone } from "../../hooks/useCategories";

export default function ProductCard({ p, onAdd, onOpen }) {
  const d = discountOf(p);
  const out = p.stock <= 0;
  const tone = useTone(p.cat);

  return (
    <article className={"card" + (out ? " out" : "")}>
      <div className={"card-media tone-" + tone}>
        <button
          className="card-open"
          onClick={() => onOpen(p)}
          aria-label={p.name + " дэлгэрэнгүй"}
        >
          <ProductImage p={p} className="card-pic" />
        </button>
        <div className="card-tags">
          {d > 0 && <span className="tag sale">-{d}%</span>}
          {out && <span className="tag">Дууссан</span>}
          {!out && p.stock <= 5 && (
            <span className="tag warn">{p.stock} үлдсэн</span>
          )}
        </div>
        <button
          className="quick-add"
          disabled={out}
          onClick={() => onAdd(p)}
          aria-label="Сагсанд нэмэх"
          title="Сагсанд нэмэх"
        >
          <Icon name="plus" size={20} stroke={2.2} />
        </button>
      </div>
      <button className="card-body" onClick={() => onOpen(p)}>
        <small className="card-brand">{p.brand}</small>
        <h3>{p.name}</h3>
        <div className="prices">
          <b>{money(p.price)}</b>
          {d > 0 && <s>{money(p.old)}</s>}
        </div>
      </button>
    </article>
  );
}
