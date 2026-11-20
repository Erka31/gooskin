import Icon from "../common/Icon";
import ProductImage from "../common/ProductImage";
import { money } from "../../lib/api";
import { discountOf } from "../../lib/products";

// Нүүр хуудасны гол хэсэг: уриа + хамгийн их хямдралтай 3 бараа
export default function Banner({ products, brandCount, onOpen }) {
  const featured = [...products]
    .filter((p) => p.stock > 0)
    .sort((a, b) => discountOf(b) - discountOf(a))
    .slice(0, 3);

  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-copy">
          <span className="eyebrow">
            <Icon name="sparkle" size={15} /> Black Friday · 50% хүртэл хямдрал
          </span>
          <h1>
            Арьсаа <em>хайрлах</em>
            <br />
            цаг нь болжээ
          </h1>
          <p>
            Дэлхийн шилдэг брэндүүдийн оригинал арьс арчилгаа, нүүр будалтын
            бүтээгдэхүүнийг хамгийн хямд үнээр, гэрт тань хүргэнэ.
          </p>
          <div className="hero-cta">
            <a href="#products" className="btn-dark">
              Худалдан авах <Icon name="arrowRight" size={18} />
            </a>
            <a href="#categories" className="btn-ghost">
              Ангилал үзэх
            </a>
          </div>
          <dl className="hero-stats">
            <div>
              <dt>{products.length || "—"}+</dt>
              <dd>бүтээгдэхүүн</dd>
            </div>
            <div>
              <dt>{brandCount || "—"}</dt>
              <dd>брэнд</dd>
            </div>
            <div>
              <dt>24ц</dt>
              <dd>хүргэлт</dd>
            </div>
          </dl>
        </div>

        <div className="hero-art" aria-hidden={featured.length === 0}>
          <div className="blob b1" />
          <div className="blob b2" />
          <div className="ring" />
          {featured.map((p, i) => (
            <button
              key={p.id}
              className={"float-card f" + i}
              onClick={() => onOpen(p)}
            >
              <span className="fc-emoji">
                <ProductImage p={p} eager />
              </span>
              <span className="fc-text">
                <small>{p.brand}</small>
                <b>{p.name}</b>
                <span>
                  {money(p.price)}
                  {discountOf(p) > 0 && <em>-{discountOf(p)}%</em>}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
