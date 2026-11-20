import { useState } from "react";
import { api } from "../../lib/api";

// Хүснэгтээс нөөцийг шууд засах: − [тоо] +
export default function StockControl({ product, onSaved, onError }) {
  const [value, setValue] = useState(String(product.stock ?? 0));
  const [saving, setSaving] = useState(false);

  const commit = async (n) => {
    const stock = Math.max(0, Math.floor(Number(n)));
    if (!Number.isFinite(stock)) {
      setValue(String(product.stock));
      return;
    }
    setValue(String(stock));
    if (stock === product.stock) return;
    setSaving(true);
    try {
      await api("/admin/products/" + product.id, {
        method: "PATCH",
        body: { stock },
      });
      onSaved();
    } catch (e) {
      setValue(String(product.stock));
      onError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const level = product.stock <= 0 ? "out" : product.stock <= 5 ? "low" : "";

  return (
    <div className={"stock-ctl " + level + (saving ? " saving" : "")}>
      <button
        type="button"
        onClick={() => commit(Number(value) - 1)}
        disabled={saving || Number(value) <= 0}
        aria-label="Хасах"
      >
        −
      </button>
      <input
        value={value}
        inputMode="numeric"
        onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
        onBlur={() => commit(value)}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        aria-label="Нөөц"
      />
      <button
        type="button"
        onClick={() => commit(Number(value) + 1)}
        disabled={saving}
        aria-label="Нэмэх"
      >
        +
      </button>
    </div>
  );
}
