import { useState } from "react";
import useLoad from "../useLoad";
import { api, money } from "../../lib/api";
import { STATUSES } from "../../constants";

export default function OrdersTab() {
  const [rawOrders, error, load] = useLoad("/admin/orders");
  const [filter, setFilter] = useState("Бүгд");
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");

  const setStatus = async (id, status) => {
    setErr("");
    try {
      await api("/admin/orders/" + id, { method: "PATCH", body: { status } });
      load();
    } catch (e) {
      setErr(e?.message || "Төлөв өөрчлөхөд алдаа гарлаа");
    }
  };

  const setPaid = async (id, paid) => {
    setErr("");
    try {
      await api(`/admin/orders/${id}/paid`, { method: "PATCH", body: { paid } });
      load();
    } catch (e) {
      setErr(e?.message || "Төлбөрийн төлөв өөрчлөхөд алдаа гарлаа");
    }
  };

  if (error) return <p className="error">{error}</p>;
  if (!rawOrders) return <p className="empty">Ачаалж байна...</p>;

  const orders = Array.isArray(rawOrders)
    ? rawOrders
    : rawOrders.orders || rawOrders.items || [];

  const needle = q.trim().toLowerCase();
  const list = orders.filter(
    (o) =>
      (filter === "Бүгд" || o.status === filter) &&
      (!needle ||
        `#${o.id} ${o.name} ${o.phone} ${o.address}`
          .toLowerCase()
          .includes(needle)),
  );

  return (
    <>
      <div className="toolbar">
        <h3>Захиалгууд ({list.length})</h3>
        <input
          className="search-input"
          placeholder="Хайх: №, нэр, утас..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option>Бүгд</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      {err && <p className="error">{err}</p>}
      {list.length === 0 ? (
        <p className="empty">Захиалга алга</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>Огноо</th>
                <th>Харилцагч</th>
                <th>Бүтээгдэхүүн</th>
                <th>Дүн</th>
                <th>Төлөв</th>
              </tr>
            </thead>
            <tbody>
              {list.map((o) => {
                const items = Array.isArray(o.items) ? o.items : [];
                return (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{o.created_at}</td>
                    <td>
                      <b>{o.name}</b>
                      {o.user_id && <small> (бүртгэлтэй)</small>}
                      <br />
                      {o.phone}
                      <br />
                      <small>{o.address}</small>
                      {o.note && (
                        <>
                          <br />
                          <small className="order-note">📝 {o.note}</small>
                        </>
                      )}
                    </td>
                    <td>
                      {items.length === 0 ? (
                        <small>-</small>
                      ) : (
                        items.map((i, idx) => (
                          <div key={i.id || idx}>
                            {i.product_name || i.name} × {i.qty}
                          </div>
                        ))
                      )}
                    </td>
                    <td>
                      <b>{money(o.total ?? 0)}</b>
                      {o.delivery > 0 && (
                        <>
                          <br />
                          <small>хүргэлт {money(o.delivery)}</small>
                        </>
                      )}
                      {o.payment && (
                        <>
                          <br />
                          <small>{o.payment}</small>
                        </>
                      )}
                      <br />
                      <button
                        className={"small-btn pay-toggle" + (o.paid ? " paid" : "")}
                        onClick={() => setPaid(o.id, !o.paid)}
                        title="Дарж төлөвийг солино"
                      >
                        {o.paid ? "✓ Төлөгдсөн" : "Төлөгдөөгүй"}
                      </button>
                    </td>
                    <td>
                      <select
                        value={o.status}
                        onChange={(e) => setStatus(o.id, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
