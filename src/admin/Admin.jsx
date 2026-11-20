import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { goShop } from "./goShop";
import AdminLogin from "./AdminLogin";
import Dashboard from "./tabs/Dashboard";
import OrdersTab from "./tabs/OrdersTab";
import ProductsTab from "./products/ProductsTab";
import CategoriesTab from "./tabs/CategoriesTab";
import SettingsTab from "./tabs/SettingsTab";
import CustomersTab from "./tabs/CustomersTab";
import MessagesTab from "./tabs/MessagesTab";
import SubscribersTab from "./tabs/SubscribersTab";
import "../styles/admin.css";

// Таб бүр: [id, гарчиг, компонент]
const TABS = [
  ["dashboard", "📊 Самбар", Dashboard],
  ["orders", "📦 Захиалга", OrdersTab],
  ["products", "🧴 Бүтээгдэхүүн", ProductsTab],
  ["categories", "🏷️ Ангилал", CategoriesTab],
  ["customers", "👥 Хэрэглэгч", CustomersTab],
  ["messages", "✉️ Мессеж", MessagesTab],
  ["subscribers", "📰 Захиалагчид", SubscribersTab],
  ["settings", "⚙️ Тохиргоо", SettingsTab],
];

export default function Admin() {
  const [me, setMe] = useState(undefined);
  const [tab, setTab] = useState("dashboard");

  useEffect(() => {
    api("/auth/me")
      .then((res) => setMe(res?.user || res || null))
      .catch(() => setMe(null));
  }, []);

  const logout = async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    setMe(null);
  };

  if (me === undefined) {
    return (
      <div className="admin-wrap">
        <div className="admin">
          <p className="empty">Ачаалж байна...</p>
        </div>
      </div>
    );
  }

  if (!me || me.role !== "admin") {
    return <AdminLogin me={me} onDone={setMe} />;
  }

  const Current = TABS.find(([id]) => id === tab)[2];

  return (
    <div className="admin-wrap">
      <div className="admin-bar">
        <b>Gooskin · Админ</b>
        <div>
          <span>👤 {me.name}</span>
          <button onClick={goShop}>Дэлгүүр</button>
          <button onClick={logout}>Гарах</button>
        </div>
      </div>
      <div className="admin-tabs">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="admin">
        <Current />
      </div>
    </div>
  );
}
