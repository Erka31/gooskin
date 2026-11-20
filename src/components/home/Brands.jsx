// Брэндүүдийн гүйдэг мөр
export default function Brands({ brands }) {
  if (brands.length === 0) return null;
  const list = [...brands, ...brands, ...brands];
  return (
    <section className="brands" aria-label="Брэндүүд">
      <div className="track">
        {list.map((b, i) => (
          <span key={i}>
            {b}
            <i>✦</i>
          </span>
        ))}
      </div>
    </section>
  );
}
