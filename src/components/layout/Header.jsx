import { useState } from "react";
import Icon from "../common/Icon";
import Link from "../common/Link";
import { navigate } from "../../lib/router";
import { BRAND, SHOP_INFO } from "../../constants";
import { useCategories } from "../../hooks/useCategories";
import { money } from "../../lib/api";

// Мэдээллийн хуудсан дээр байхад дэлгүүр рүү буцаах
const toShop = () => {
  if (window.location.pathname !== "/") navigate("/#products");
};

export default function Header({
  query,
  setQuery,
  cartCount,
  onCart,
  cat,
  setCat,
  user,
  onLogin,
  onSignup,
  onLogout,
  onOrders,
  onProfile,
  freeFrom,
}) {
  const [menu, setMenu] = useState(false);
  const cats = useCategories();
  const go = (fn) => () => {
    setMenu(false);
    fn();
  };

  return (
    <header className="header">
      <div className="announce">
        <span>
          <Icon name="truck" size={15} /> {money(freeFrom)}-с дээш захиалгад
          хүргэлт үнэгүй
        </span>
        <a href={"tel:" + SHOP_INFO.phone}>
          <Icon name="phone" size={14} /> {SHOP_INFO.phone}
        </a>
      </div>

      <div className="nav-main">
        <Link to="/" className="logo" aria-label={BRAND + " нүүр хуудас"}>
          {BRAND}
          <i>.</i>
        </Link>

        <label className="search">
          <Icon name="search" size={18} />
          <input
            type="search"
            placeholder="Серум, нарны тос, уруулын будаг..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              toShop();
            }}
          />
        </label>

        <nav className="actions">
          <Link to="/p/faq" className="act-link">
            Тусламж
          </Link>
          {user ? (
            <div className="user-menu">
              <button
                className="icon-btn with-label"
                onClick={() => setMenu(!menu)}
                aria-expanded={menu}
              >
                <span className="avatar">
                  {(user.name || "?").charAt(0).toUpperCase()}
                </span>
                <span className="act-label">
                  {(user.name || "").split(" ")[0]}
                </span>
                <Icon name="chevronDown" size={16} />
              </button>
              {menu && (
                <div className="dropdown" onMouseLeave={() => setMenu(false)}>
                  <div className="dd-head">
                    <b>{user.name}</b>
                    <small>{user.email}</small>
                  </div>
                  {user.role === "admin" && (
                    <button onClick={go(() => navigate("/admin"))}>
                      <Icon name="grid" size={17} /> Админ самбар
                    </button>
                  )}
                  <button onClick={go(onOrders)}>
                    <Icon name="package" size={17} /> Миний захиалгууд
                  </button>
                  <button onClick={go(onProfile)}>
                    <Icon name="user" size={17} /> Миний мэдээлэл
                  </button>
                  <button className="dd-danger" onClick={go(onLogout)}>
                    <Icon name="logout" size={17} /> Гарах
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="act-link" onClick={onLogin}>
                Нэвтрэх
              </button>
              <button className="pill-btn" onClick={onSignup}>
                Бүртгүүлэх
              </button>
            </>
          )}
          <button className="icon-btn bag" onClick={onCart} aria-label="Сагс">
            <Icon name="bag" size={22} />
            {cartCount > 0 && <span className="bag-count">{cartCount}</span>}
          </button>
        </nav>
      </div>

      <nav className="cats" aria-label="Ангилал">
        {[{ id: "all", name: "Бүгд", emoji: "" }, ...cats].map((c) => (
          <button
            key={c.id}
            className={c.name === cat ? "active" : ""}
            onClick={() => {
              setCat(c.name);
              toShop();
            }}
          >
            {c.emoji && <span className="cat-em">{c.emoji}</span>}
            {c.name}
          </button>
        ))}
      </nav>
    </header>
  );
}
