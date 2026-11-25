import { useState } from "react";
import Icon from "../common/Icon";
import Link from "../common/Link";
import { api } from "../../lib/api";
import { BRAND, SHOP_INFO } from "../../constants";

const YEAR = new Date().getFullYear();

function Newsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api("/subscribe", { method: "POST", body: { email } });
      setSent(true);
      setEmail("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="newsletter">
      <div>
        <span className="kicker light">Хямдралын мэдээ</span>
        <h3>Шинэ хямдрал, бэлгийг хамгийн түрүүнд аваарай</h3>
      </div>
      {sent ? (
        <p className="nl-done">
          <Icon name="check" size={18} /> Баярлалаа! Та бүртгэгдлээ.
        </p>
      ) : (
        <form onSubmit={submit} className="nl-form">
          <input
            required
            type="email"
            placeholder="И-мэйл хаягаа оруулна уу"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button>Бүртгүүлэх</button>
          {error && <p className="error">{error}</p>}
        </form>
      )}
    </section>
  );
}

export default function Footer({ onOrders }) {
  return (
    <footer className="footer" id="footer">
      <Newsletter />
      <div className="footer-cols">
        <div className="f-brand">
          <Link to="/" className="logo light">
            {BRAND}
            <i>.</i>
          </Link>
          <p>
            Арьс арчилгаа, нүүр будалтын оригинал бүтээгдэхүүнийг хямд үнээр,
            хурдан хүргэлттэй.
          </p>
          <a className="f-contact" href={"tel:" + SHOP_INFO.phone}>
            <Icon name="phone" size={16} /> {SHOP_INFO.phone}
          </a>
          <a className="f-contact" href={"mailto:" + SHOP_INFO.email}>
            <Icon name="mail" size={16} /> {SHOP_INFO.email}
          </a>
        </div>
        <div>
          <h4>{BRAND}</h4>
          <Link to="/p/about">Бидний тухай</Link>
          <Link to="/p/contact">Холбоо барих</Link>
        </div>
        <div>
          <h4>Тусламж</h4>
          <Link to="/p/faq">Түгээмэл асуултууд</Link>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onOrders();
            }}
          >
            Миний захиалгууд
          </a>
          <Link to="/p/delivery">Хүргэлт ба буцаалт</Link>
        </div>
        <div>
          <h4>Мэдээлэл</h4>
          <Link to="/p/terms">Үйлчилгээний нөхцөл</Link>
          <Link to="/p/privacy">Нууцлалын бодлого</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>
          © {YEAR} {BRAND}. Бүх эрх хуулиар хамгаалагдсан.
        </p>
        <div className="pay-marks" aria-label="Төлбөрийн хэлбэрүүд">
          <span>QPay</span>
          <span>Банкны шилжүүлэг</span>
          <span>Бэлэн</span>
          <span>Карт</span>
        </div>
      </div>
    </footer>
  );
}
