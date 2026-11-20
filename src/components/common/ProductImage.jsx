import { useState } from "react";

// Барааны зураг: зураг байвал <img>, байхгүй (эсвэл ачаалж чадаагүй) бол emoji
export default function ProductImage({ p, src, className = "", eager }) {
  const url = src ?? p.images?.[0];
  const [broken, setBroken] = useState(false);

  if (url && !broken) {
    return (
      <img
        className={"p-img " + className}
        src={url}
        alt={p.name}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onError={() => setBroken(true)}
      />
    );
  }
  return (
    <span className={"p-emoji " + className} role="img" aria-label={p.name}>
      {p.emoji || "🧴"}
    </span>
  );
}
