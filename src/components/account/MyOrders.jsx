import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import { api, money } from "../../lib/api";
import { STATUSES } from "../../constants";

export default function MyOrders({ onClose, onChanged }) {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  const load = () =>
    api("/my/orders")
      .then(setOrders)
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const cancel = async (id) => {
    if (!window.confirm(`#${id} захиалгыг цуцлах уу?`)) return;
    try {
      await api(`/my/orders/${id}/cancel`, { method: "POST" });
      load();
      onChanged();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Modal onClose={onClose} wide>
      <h3>Миний захиалгууд</h3>
      {error && <p className="error">{error}</p>}
      {!orders && !error && <p className="empty">Ачаалж байна...</p>}
      {orders && orders.length === 0 && (
        <p className="empty">Захиалга хараахан алга</p>
      )}
      <div className="my-orders">
        {orders &&
          orders.map((o) => (
            <div className="my-order" key={o.id}>
              <div className="my-order-head">
                <b>Захиалга #{o.id}</b>
                <span className={"status s-" + STATUSES.indexOf(o.status)}>
                  {o.status}
                </span>
              </div>
              <div className="my-order-meta">
                <small>{o.created_at}</small>
                {o.payment && (
                  <span
                    className={
                      "pay-badge" + (o.paid ? " paid" : "")
                    }
                  >
                    {o.payment} · {o.paid ? "Төлөгдсөн" : "Төлөгдөөгүй"}
                  </span>
                )}
              </div>
              {o.items.map((i) => (
                <div key={i.id} className="my-order-line">
                  <span>
                    {i.product_name} × {i.qty}
                  </span>
                  <span>{money(i.price * i.qty)}</span>
                </div>
              ))}
              {o.delivery > 0 && (
                <div className="my-order-line muted">
                  <span>Хүргэлт</span>
                  <span>{money(o.delivery)}</span>
                </div>
              )}
              <div className="my-order-total">
                {o.status === "Шинэ" && (
                  <button className="remove" onClick={() => cancel(o.id)}>
                    Цуцлах
                  </button>
                )}
                <span>
                  Нийт: <b>{money(o.total)}</b>
                </span>
              </div>
            </div>
          ))}
      </div>
    </Modal>
  );
}
