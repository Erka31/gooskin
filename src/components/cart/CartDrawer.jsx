import { useState } from "react";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import Checkout from "./Checkout";
import OrderSuccess from "./OrderSuccess";
import Icon from "../common/Icon";
import useEsc from "../../hooks/useEsc";
import { deliveryFee } from "../../lib/products";

// Сагс 3 алхамтай: cart (бараа) → checkout (хүргэлт + төлбөр) → done
const STEPS = [
  ["cart", "Сагс"],
  ["checkout", "Төлбөр"],
  ["done", "Баталгаажсан"],
];

export default function CartDrawer({
  open,
  onClose,
  items,
  changeQty,
  removeItem,
  clearCart,
  user,
  onLogin,
  config,
  onOrdered,
}) {
  const [step, setStep] = useState("cart");
  const [order, setOrder] = useState(null);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = deliveryFee(subtotal, config);
  const totals = { subtotal, delivery, total: subtotal + delivery };

  const close = () => {
    if (step === "done") {
      setOrder(null);
      setStep("cart");
    }
    onClose();
  };
  useEsc(close, open);

  const done = (o) => {
    setOrder(o);
    setStep("done");
    clearCart();
  };

  // Сагс хоосорвол төлбөрийн алхмаас буцаана
  const current = step === "checkout" && items.length === 0 ? "cart" : step;
  const stepIdx = STEPS.findIndex(([id]) => id === current);

  return (
    <>
      <div className={"overlay" + (open ? " show" : "")} onClick={close} />
      <aside
        className={"drawer" + (open ? " open" : "")}
        aria-hidden={!open}
        aria-label="Сагс"
      >
        <div className="drawer-head">
          {current === "checkout" ? (
            <button className="icon-btn" onClick={() => setStep("cart")}>
              <Icon name="arrowLeft" size={20} />
            </button>
          ) : (
            <span className="dh-icon">
              <Icon name="bag" size={20} />
            </span>
          )}
          <h3>
            {current === "checkout"
              ? "Захиалга баталгаажуулах"
              : current === "done"
                ? "Баярлалаа!"
                : "Миний сагс"}
          </h3>
          <button className="icon-btn" onClick={close} aria-label="Хаах">
            <Icon name="x" size={20} />
          </button>
        </div>

        {(items.length > 0 || current === "done") && (
          <ol className="stepper">
            {STEPS.map(([id, label], i) => (
              <li
                key={id}
                className={i < stepIdx ? "past" : i === stepIdx ? "now" : ""}
              >
                <span>{i < stepIdx ? <Icon name="check" size={13} stroke={3} /> : i + 1}</span>
                {label}
              </li>
            ))}
          </ol>
        )}

        {current === "done" && order ? (
          <OrderSuccess order={order} onClose={close} />
        ) : items.length === 0 ? (
          <div className="empty-state in-drawer">
            <span>🛍️</span>
            <b>Сагс хоосон байна</b>
            <p>Таалагдсан бүтээгдэхүүнээ сагсандаа нэмээрэй.</p>
            <button className="btn-dark" onClick={close}>
              Дэлгүүр хэсэх
            </button>
          </div>
        ) : current === "checkout" ? (
          <Checkout
            items={items}
            totals={totals}
            config={config}
            user={user}
            onLogin={onLogin}
            onDone={done}
            onOrdered={onOrdered}
          />
        ) : (
          <div className="drawer-body">
            <div className="cart-list">
              {items.map((i) => (
                <CartItem
                  key={i.id}
                  item={i}
                  changeQty={changeQty}
                  removeItem={removeItem}
                />
              ))}
            </div>
            <div className="drawer-foot">
              <CartSummary totals={totals} config={config} />
              <button
                className="primary block"
                onClick={() => setStep("checkout")}
              >
                Тооцоо хийх <Icon name="arrowRight" size={18} />
              </button>
              <p className="secure">
                <Icon name="lock" size={14} /> Аюулгүй, баталгаатай худалдан
                авалт
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
