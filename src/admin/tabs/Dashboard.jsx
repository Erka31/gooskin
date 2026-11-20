import useLoad from "../useLoad";
import { money } from "../../lib/api";

export default function Dashboard() {
  const [s, error] = useLoad("/admin/stats");
  if (error) return <p className="error">{error}</p>;
  if (!s) return <p className="empty">Ачаалж байна...</p>;

  const cards = [
    ["Нийт захиалга", s.orders ?? 0],
    ["Шинэ захиалга", s.newOrders ?? 0],
    ["Нийт орлого", money(s.revenue ?? 0)],
    ["Бүртгэлтэй хэрэглэгч", s.customers ?? 0],
    ["Идэвхтэй бүтээгдэхүүн", s.products ?? 0],
    ["Нөөц багатай (≤5)", s.lowStock ?? 0],
    ["Төлбөр хүлээгдэж буй", s.unpaid ?? 0],
    ["Шинэ мессеж", s.newMessages ?? 0],
    ["Мэдээлэл авагч", s.subscribers ?? 0],
  ];
  const top = Array.isArray(s.top) ? s.top : [];

  return (
    <>
      <div className="stat-grid">
        {cards.map(([label, value]) => (
          <div className="stat" key={label}>
            <small>{label}</small>
            <b>{value}</b>
          </div>
        ))}
      </div>
      <p className="hint">Орлогод цуцлагдсан захиалга ороогүй.</p>
      <h3>Хамгийн их зарагдсан</h3>
      {top.length === 0 ? (
        <p className="empty">Борлуулалт алга</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Бүтээгдэхүүн</th>
                <th>Тоо</th>
                <th>Орлого</th>
              </tr>
            </thead>
            <tbody>
              {top.map((t) => (
                <tr key={t.name}>
                  <td>
                    <b>{t.name}</b>
                  </td>
                  <td>{t.qty}</td>
                  <td>{money(t.sum)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
