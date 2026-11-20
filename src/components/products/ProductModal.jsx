import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Icon from "../common/Icon";
import { money } from "../../lib/api";
import { discountOf } from "../../lib/products";
import ProductImage from "../common/ProductImage";
import { useTone } from "../../hooks/useCategories";

export default function ProductModal({ p, inCart, onAdd, onClose }) {
  const [qty, setQty] = useState(1);
  const [shown, setShown] = useState(0);
  const images = p.images || [];
  const max = Math.max(0, p.stock - inCart);
  const d = discountOf(p);
  const tone = useTone(p.cat);
  const [shared, setShared] = useState("");

  useEffect(() => {
    document.title = `${p.name} · ${p.brand} · Gooskin`;
  }, [p.name, p.brand]);

  // Холбоос хуваалцах: утсан дээр Share цонх, компьютер дээр хуулна
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: p.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared("Холбоос хуулагдлаа");
    } catch {
      /* хэрэглэгч цуцалсан */
    }
    setTimeout(() => setShared(""), 2000);
  };

  return (
    <Modal onClose={onClose} wide>
      <div className="pd">
        <div className="pd-gallery">
          <div className={"pd-img tone-" + tone}>
            {d > 0 && <span className="tag sale">-{d}%</span>}
            <ProductImage
              key={images[shown] || "emoji"}
              p={p}
              src={images[shown]}
              className="pd-pic"
              eager
            />
          </div>
          {images.length > 1 && (
            <div className="pd-thumbs">
              {images.map((src, i) => (
                <button
                  key={src}
                  className={i === shown ? "on" : ""}
                  onClick={() => setShown(i)}
                  aria-label={`Зураг ${i + 1}`}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="pd-info">
          <small className="card-brand">
            {p.brand} · {p.cat}
          </small>
          <h3>{p.name}</h3>
          <div className="prices big">
            <b>{money(p.price)}</b>
            {d > 0 && (
              <>
                <s>{money(p.old)}</s>
                <span className="save">{money(p.old - p.price)} хэмнэнэ</span>
              </>
            )}
          </div>
          <p className="pd-desc">{p.description || "Тайлбар байхгүй."}</p>

          <div className="pd-stock">
            <span
              className={
                "dot" + (p.stock > 5 ? "" : p.stock > 0 ? " warn" : " off")
              }
            />
            {p.stock > 0 ? `Нөөцөд ${p.stock} ширхэг` : "Одоогоор дууссан"}
            {inCart > 0 && <em> · Сагсанд {inCart}</em>}
          </div>

          {max > 0 ? (
            <div className="pd-buy">
              <div className="qty lg">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Хасах"
                >
                  <Icon name="minus" size={16} />
                </button>
                <span>{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(max, q + 1))}
                  aria-label="Нэмэх"
                >
                  <Icon name="plus" size={16} />
                </button>
              </div>
              <button
                className="primary grow"
                onClick={() => {
                  onAdd(p, qty);
                  onClose();
                }}
              >
                <Icon name="bag" size={18} /> Сагсанд нэмэх ·{" "}
                {money(p.price * qty)}
              </button>
            </div>
          ) : (
            <button className="primary" disabled>
              {p.stock > 0 ? "Бүгд сагсанд байна" : "Дууссан"}
            </button>
          )}

          <button type="button" className="share-btn" onClick={share}>
            <Icon name="copy" size={15} /> {shared || "Холбоос хуваалцах"}
          </button>

          <ul className="pd-perks">
            <li>
              <Icon name="truck" size={16} /> Улаанбаатарт 24–48 цагт хүргэнэ
            </li>
            <li>
              <Icon name="shield" size={16} /> 100% оригинал баталгаатай
            </li>
            <li>
              <Icon name="refresh" size={16} /> 7 хоногийн дотор буцаах
              боломжтой
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
