import useLoad from "../useLoad";

export default function SubscribersTab() {
  const [rows, error] = useLoad("/admin/subscribers");
  if (error) return <p className="error">{error}</p>;
  if (!rows) return <p className="empty">Ачаалж байна...</p>;
  const copy = () => {
    navigator.clipboard
      ?.writeText(rows.map((r) => r.email).join(", "))
      .then(() => window.alert("И-мэйлүүд хуулагдлаа"))
      .catch(() => {});
  };
  return (
    <>
      <div className="toolbar">
        <h3>Хямдралын мэдээлэл авагчид ({rows.length})</h3>
        {rows.length > 0 && (
          <button className="small-btn" onClick={copy}>
            Бүх и-мэйл хуулах
          </button>
        )}
      </div>
      {rows.length === 0 ? (
        <p className="empty">Одоогоор бүртгүүлсэн хүн алга</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>И-мэйл</th>
                <th>Огноо</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.email}</td>
                  <td>{r.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
