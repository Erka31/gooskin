import { useState } from "react";
import Icon from "../common/Icon";
import { useCategories } from "../../hooks/useCategories";

const FIRST = 8; // эхэндээ харуулах ангиллын тоо

// Ангилал бүрийн tile — дарахад тухайн ангиллаар шүүнэ
export default function CategoryTiles({ onPick }) {
  const cats = useCategories();
  const [all, setAll] = useState(false);
  if (cats.length === 0) return null;

  // Бараатай ангиллыг эхэнд нь
  const sorted = [...cats].sort((a, b) => (b.count > 0) - (a.count > 0));
  const shown = all ? sorted : sorted.slice(0, FIRST);

  return (
    <section id="categories" className="section">
      <div className="section-title">
        <span className="kicker">Ангилал</span>
        <h2>Танд юу хэрэгтэй вэ?</h2>
      </div>
      <div className="cat-tiles">
        {shown.map((c) => (
          <button
            key={c.id}
            className={"cat-tile tone-" + c.tone}
            onClick={() => onPick(c.name)}
          >
            <span className="ct-emoji">{c.emoji}</span>
            <span className="ct-body">
              <b>{c.name}</b>
              {c.tagline && <small>{c.tagline}</small>}
            </span>
            <span className="ct-foot">
              {c.count > 0 ? `${c.count} бүтээгдэхүүн` : "Удахгүй"}
              <Icon name="arrowRight" size={16} />
            </span>
          </button>
        ))}
      </div>
      {sorted.length > FIRST && (
        <div className="more-row">
          <button className="btn-ghost" onClick={() => setAll(!all)}>
            {all ? "Цөөнийг харуулах" : `Бүх ${sorted.length} ангиллыг харах`}
            <Icon name="chevronDown" size={16} className={all ? "flip" : ""} />
          </button>
        </div>
      )}
    </section>
  );
}
