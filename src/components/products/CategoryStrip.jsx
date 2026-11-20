import { useCategories } from "../../hooks/useCategories";

// Бүтээгдэхүүний жагсаалтын дээрх ангиллын мөр (emoji + тоо)
export default function CategoryStrip({ cat, setCat, total }) {
  const cats = useCategories();
  if (cats.length === 0) return null;

  return (
    <nav className="cat-strip" aria-label="Ангиллаар шүүх">
      <button
        className={"cs-pill" + (cat === "Бүгд" ? " on" : "")}
        onClick={() => setCat("Бүгд")}
      >
        <span className="cs-emoji">🛍️</span>
        Бүгд
        <em>{total}</em>
      </button>
      {cats.map((c) => (
        <button
          key={c.id}
          className={
            "cs-pill" + (cat === c.name ? " on" : "") + (c.count ? "" : " zero")
          }
          onClick={() => setCat(c.name)}
        >
          <span className={"cs-emoji tone-" + c.tone}>{c.emoji}</span>
          {c.name}
          <em>{c.count || 0}</em>
        </button>
      ))}
    </nav>
  );
}
