import useLoad from "../useLoad";
import { api } from "../../lib/api";

export default function MessagesTab() {
  const [rows, error, load] = useLoad("/admin/messages");
  const toggle = async (m) => {
    await api("/admin/messages/" + m.id, {
      method: "PATCH",
      body: { done: !m.done },
    }).catch(() => {});
    load();
  };
  if (error) return <p className="error">{error}</p>;
  if (!rows) return <p className="empty">Ачаалж байна...</p>;
  return (
    <>
      <h3>Холбоо барих мессеж ({rows.length})</h3>
      {rows.length === 0 ? (
        <p className="empty">Мессеж алга</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Огноо</th>
                <th>Илгээгч</th>
                <th>Мессеж</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id} className={m.done ? "off" : ""}>
                  <td>{m.created_at}</td>
                  <td>
                    <b>{m.name}</b>
                    <br />
                    <a href={"mailto:" + m.email}>{m.email}</a>
                  </td>
                  <td className="msg-text">{m.message}</td>
                  <td>
                    <button className="small-btn" onClick={() => toggle(m)}>
                      {m.done ? "Буцаах" : "Шийдсэн"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
