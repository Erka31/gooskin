import { useState } from "react";
import useLoad from "../useLoad";
import { api, money } from "../../lib/api";

export default function CustomersTab() {
  const [rawUsers, error] = useLoad("/admin/users");
  const [temp, setTemp] = useState(null); // { name, password }
  const [err, setErr] = useState("");

  // Утсаар нууц үгээ мартсан гэж хандвал түр нууц үг үүсгэж хэлнэ
  const resetPw = async (u) => {
    if (
      !window.confirm(
        `${u.name}-ийн нууц үгийг шинэчлэх үү? Хуучин нууц үг ажиллахаа болино.`,
      )
    )
      return;
    setErr("");
    try {
      const r = await api(`/admin/users/${u.id}/reset-password`, {
        method: "POST",
      });
      setTemp({ name: u.name, email: u.email, password: r.password });
    } catch (e) {
      setErr(e.message);
    }
  };
  if (error) return <p className="error">{error}</p>;
  if (!rawUsers) return <p className="empty">Ачаалж байна...</p>;

  const users = Array.isArray(rawUsers)
    ? rawUsers
    : rawUsers.users || rawUsers.items || [];

  return (
    <>
      <h3>Бүртгэлтэй хэрэглэгчид ({users.length})</h3>
      {err && <p className="error">{err}</p>}
      {temp && (
        <div className="note temp-pw">
          <b>{temp.name}</b> ({temp.email}) — түр нууц үг:{" "}
          <code>{temp.password}</code>
          <br />
          Хэрэглэгчид хэлээд нэвтэрсний дараа “Миний мэдээлэл” хэсгээс солихыг
          зөвлөнө үү.
          <button className="small-btn" onClick={() => setTemp(null)}>
            Хаах
          </button>
        </div>
      )}
      {users.length === 0 ? (
        <p className="empty">Хэрэглэгч алга</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Нэр</th>
                <th>И-мэйл</th>
                <th>Утас</th>
                <th>Захиалга</th>
                <th>Нийт дүн</th>
                <th>Бүртгүүлсэн</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <b>{u.name}</b>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.phone || "-"}</td>
                  <td>{u.orders ?? 0}</td>
                  <td>{money(u.spent ?? 0)}</td>
                  <td>{u.created_at}</td>
                  <td>
                    <button className="small-btn" onClick={() => resetPw(u)}>
                      Нууц үг шинэчлэх
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
