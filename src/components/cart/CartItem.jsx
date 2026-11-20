import Icon from "../common/Icon";
import { money } from "../../lib/api";
import ProductImage from "../common/ProductImage";
import { useTone } from "../../hooks/useCategories";

export default function CartItem({ item: i, changeQty, removeItem }) {
  const tone = useTone(i.cat);
  return (
    <div className="cart-item">
      <div className={"cart-emoji tone-" + tone}>
        <ProductImage p={i} />
      </div>
      <div className="cart-info">
        <small className="card-brand">{i.brand}</small>
        <b>{i.name}</b>
        <div className="qty">
          <button onClick={() => changeQty(i.id, -1)} aria-label="Хасах">
            <Icon name="minus" size={14} />
          </button>
          <span>{i.qty}</span>
          <button
            disabled={i.qty >= i.stock}
            onClick={() => changeQty(i.id, 1)}
            aria-label="Нэмэх"
          >
            <Icon name="plus" size={14} />
          </button>
        </div>
      </div>
      <div className="cart-right">
        <b>{money(i.price * i.qty)}</b>
        <button
          className="remove"
          onClick={() => removeItem(i.id)}
          aria-label="Устгах"
        >
          <Icon name="trash" size={16} />
        </button>
      </div>
    </div>
  );
}
